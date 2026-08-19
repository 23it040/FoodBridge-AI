import ApiError from '../utils/ApiError.js';
import { buildPagination, getPaginationParams, generateOtp, getOtpExpiry } from '../utils/helpers.js';
import requestRepository from '../repositories/request.repository.js';
import donationRepository from '../repositories/donation.repository.js';
import userRepository from '../repositories/user.repository.js';
import notificationService from './notification.service.js';
import {
  USER_ROLES,
  REQUEST_TYPES,
  REQUEST_STATUS,
  DONATION_STATUS,
  NOTIFICATION_TYPES,
} from '../constants/enums.js';

const defaultPopulate = [
  { path: 'ngoId', select: 'email role profile.organizationName profile.phone profile.location' },
  { path: 'donationId', populate: { path: 'donorId', select: 'email profile.organizationName profile.phone' } },
  { path: 'respondedBy', select: 'email profile.organizationName' },
];

class RequestService {
  async create(ngoId, payload) {
    const ngo = await userRepository.findById(ngoId);

    if (!ngo || ngo.role !== USER_ROLES.NGO) {
      throw ApiError.forbidden('Only NGOs can create food requests');
    }

    if (payload.requestType === REQUEST_TYPES.PICKUP) {
      return this.createPickupRequest(ngoId, payload);
    }

    return this.createDemandRequest(ngoId, payload);
  }

  async createDemandRequest(ngoId, payload) {
    const request = await requestRepository.create({
      ...payload,
      ngoId,
      statusTimeline: [{ status: REQUEST_STATUS.PENDING, updatedBy: ngoId }],
    });

    return requestRepository.findById(request._id, defaultPopulate);
  }

  async createPickupRequest(ngoId, payload) {
    const donation = await donationRepository.findById(payload.donationId);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    if (donation.status !== DONATION_STATUS.AVAILABLE) {
      throw ApiError.badRequest('Donation is not available for pickup requests');
    }

    if (donation.donorId.toString() === ngoId.toString()) {
      throw ApiError.badRequest('Cannot request pickup for your own donation');
    }

    const existing = await requestRepository.findActivePickupRequest(payload.donationId, ngoId);

    if (existing) {
      throw ApiError.conflict('You already have an active pickup request for this donation');
    }

    const request = await requestRepository.create({
      ...payload,
      ngoId,
      location: donation.location,
      statusTimeline: [{ status: REQUEST_STATUS.PENDING, updatedBy: ngoId }],
    });

    await notificationService.create({
      userId: donation.donorId,
      type: NOTIFICATION_TYPES.REQUEST,
      title: 'New Pickup Request',
      message: `An NGO has requested to pick up your donation "${donation.title}".`,
      metadata: { donationId: donation._id, foodRequestId: request._id },
      priority: 'high',
    });

    return requestRepository.findById(request._id, defaultPopulate);
  }

  async getById(id) {
    const request = await requestRepository.findById(id, defaultPopulate);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    return request;
  }

  async list(query, user = null) {
    const { page, limit, skip } = getPaginationParams(query);
    const filter = { isActive: true };

    if (query.requestType) filter.requestType = query.requestType;
    if (query.status) filter.status = query.status;
    if (query.ngoId) filter.ngoId = query.ngoId;
    if (query.donationId) filter.donationId = query.donationId;

    if (user?.role === USER_ROLES.NGO) {
      filter.ngoId = user._id;
    }

    const [requests, total] = await Promise.all([
      requestRepository.findAll(filter, { skip, limit, sort: '-createdAt', populate: defaultPopulate }),
      requestRepository.count(filter),
    ]);

    return {
      requests,
      pagination: buildPagination(page, limit, total),
    };
  }

  async respond(responderId, requestId, payload) {
    const request = await requestRepository.findById(requestId, [
      { path: 'donationId' },
      { path: 'ngoId', select: 'email profile.organizationName' },
    ]);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      throw ApiError.badRequest('Request has already been responded to');
    }

    if (request.requestType === REQUEST_TYPES.PICKUP) {
      const donation = request.donationId;

      if (!donation || donation.donorId.toString() !== responderId.toString()) {
        throw ApiError.forbidden('Only the donor can respond to pickup requests');
      }
    }

    const updateData = {
      status: payload.status,
      respondedBy: responderId,
      respondedAt: new Date(),
      responseNote: payload.responseNote,
      $push: {
        statusTimeline: {
          status: payload.status,
          note: payload.responseNote,
          updatedBy: responderId,
        },
      },
    };

    if (payload.status === REQUEST_STATUS.ACCEPTED && request.requestType === REQUEST_TYPES.PICKUP) {
      const otp = generateOtp();
      updateData.handoverOtp = otp;
      updateData.handoverOtpExpiresAt = getOtpExpiry(30);
      updateData.isOtpVerified = false;

      await donationRepository.updateById(request.donationId._id, {
        status: DONATION_STATUS.ASSIGNED,
        assignedNgoId: request.ngoId,
        assignedAt: new Date(),
      });

      await notificationService.create({
        userId: request.ngoId,
        type: NOTIFICATION_TYPES.PICKUP,
        title: 'Pickup Request Accepted',
        message: `Your pickup request has been accepted. Use OTP at handover.`,
        metadata: {
          donationId: request.donationId._id,
          foodRequestId: request._id,
          extra: { otp },
        },
        priority: 'high',
      });
    }

    if (payload.status === REQUEST_STATUS.REJECTED) {
      await notificationService.create({
        userId: request.ngoId,
        type: NOTIFICATION_TYPES.REQUEST,
        title: 'Request Declined',
        message: payload.responseNote || 'Your request was declined.',
        metadata: { foodRequestId: request._id },
      });
    }

    const updated = await requestRepository.updateById(requestId, updateData);
    return requestRepository.findById(updated._id, defaultPopulate);
  }

  async verifyOtp(userId, requestId, otp) {
    const request = await requestRepository.findByIdWithOtp(requestId);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    if (request.status !== REQUEST_STATUS.ACCEPTED) {
      throw ApiError.badRequest('OTP verification is only available for accepted requests');
    }

    const isDonor = request.requestType === REQUEST_TYPES.PICKUP;
    const donation = await donationRepository.findById(request.donationId);

    if (isDonor && donation?.donorId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Only the donor can verify handover OTP');
    }

    if (!isDonor && request.ngoId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Only the assigned NGO can verify handover OTP');
    }

    if (!request.handoverOtp || request.handoverOtpExpiresAt < new Date()) {
      throw ApiError.badRequest('OTP has expired. Please request a new one.');
    }

    if (request.handoverOtp !== otp) {
      throw ApiError.badRequest('Invalid OTP');
    }

    const updated = await requestRepository.updateById(requestId, {
      isOtpVerified: true,
      status: REQUEST_STATUS.COMPLETED,
      completedAt: new Date(),
      handoverOtp: null,
      handoverOtpExpiresAt: null,
      $push: {
        statusTimeline: {
          status: REQUEST_STATUS.COMPLETED,
          note: 'Handover verified via OTP',
          updatedBy: userId,
        },
      },
    });

    if (request.donationId) {
      await donationRepository.updateById(request.donationId, {
        status: DONATION_STATUS.DELIVERED,
        deliveredAt: new Date(),
      });
    }

    return requestRepository.findById(updated._id, defaultPopulate);
  }

  async cancel(ngoId, requestId) {
    const request = await requestRepository.findById(requestId);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    if (request.ngoId.toString() !== ngoId.toString()) {
      throw ApiError.forbidden('You can only cancel your own requests');
    }

    if (![REQUEST_STATUS.PENDING, REQUEST_STATUS.ACCEPTED].includes(request.status)) {
      throw ApiError.badRequest('Request cannot be cancelled in current status');
    }

    const updated = await requestRepository.updateById(requestId, {
      status: REQUEST_STATUS.CANCELLED,
      isActive: false,
      $push: {
        statusTimeline: {
          status: REQUEST_STATUS.CANCELLED,
          updatedBy: ngoId,
        },
      },
    });

    return requestRepository.findById(updated._id, defaultPopulate);
  }
}

export default new RequestService();
