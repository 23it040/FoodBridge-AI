import ApiError from '../utils/ApiError.js';
import { buildPagination, getPaginationParams } from '../utils/helpers.js';
import donationRepository from '../repositories/donation.repository.js';
import cloudinaryService from './cloudinary.service.js';
import notificationService from './notification.service.js';
import {
  USER_ROLES,
  DONATION_STATUS,
  NOTIFICATION_TYPES,
} from '../constants/enums.js';

const defaultPopulate = [
  { path: 'donorId', select: 'email role profile.organizationName profile.phone profile.avatar' },
  { path: 'assignedNgoId', select: 'email role profile.organizationName profile.phone' },
];

class DonationService {
  async create(donorId, payload, files = []) {
    let images = [];

    if (files.length) {
      images = await cloudinaryService.uploadMultiple(files, 'donations');
    }

    const donation = await donationRepository.create({
      ...payload,
      donorId,
      images,
    });

    await notificationService.create({
      userId: donorId,
      type: NOTIFICATION_TYPES.DONATION,
      title: 'Donation Listed',
      message: `Your donation "${donation.title}" is now live and visible to NGOs.`,
      metadata: { donationId: donation._id },
    });

    return donationRepository.findById(donation._id, defaultPopulate);
  }

  async getById(id) {
    const donation = await donationRepository.findById(id, defaultPopulate);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    return donation;
  }

  async list(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.donorId) filter.donorId = query.donorId;

    const hasGeoQuery =
      query.longitude !== undefined &&
      query.latitude !== undefined &&
      !Number.isNaN(Number(query.longitude)) &&
      !Number.isNaN(Number(query.latitude));

    const options = { skip, limit, sort: '-createdAt', populate: defaultPopulate };

    let donations;
    let total;

    if (hasGeoQuery) {
      const coordinates = [Number(query.longitude), Number(query.latitude)];
      const maxDistanceMeters = (query.radiusKm || 15) * 1000;

      if (!query.status) {
        filter.status = DONATION_STATUS.AVAILABLE;
      }

      [donations, total] = await Promise.all([
        donationRepository.findNearby(filter, coordinates, maxDistanceMeters, options),
        donationRepository.countNearby(filter, coordinates, maxDistanceMeters),
      ]);
    } else {
      [donations, total] = await Promise.all([
        donationRepository.findAll(filter, options),
        donationRepository.count(filter),
      ]);
    }

    return {
      donations,
      pagination: buildPagination(page, limit, total),
    };
  }

  async update(donorId, donationId, payload, files = []) {
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    if (donation.donorId.toString() !== donorId.toString()) {
      throw ApiError.forbidden('You can only update your own donations');
    }

    if (![DONATION_STATUS.AVAILABLE, DONATION_STATUS.ASSIGNED].includes(donation.status)) {
      throw ApiError.badRequest('Cannot update donation in current status');
    }

    const updateData = { ...payload };

    if (files.length) {
      const newImages = await cloudinaryService.uploadMultiple(files, 'donations');
      updateData.images = [...(donation.images || []), ...newImages];
    }

    const updated = await donationRepository.updateById(donationId, updateData);
    return donationRepository.findById(updated._id, defaultPopulate);
  }

  async cancel(donorId, donationId, cancellationReason) {
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    if (donation.donorId.toString() !== donorId.toString()) {
      throw ApiError.forbidden('You can only cancel your own donations');
    }

    if ([DONATION_STATUS.DELIVERED, DONATION_STATUS.CANCELLED].includes(donation.status)) {
      throw ApiError.badRequest('Donation cannot be cancelled in current status');
    }

    const updated = await donationRepository.updateById(donationId, {
      status: DONATION_STATUS.CANCELLED,
      cancellationReason,
    });

    if (donation.assignedNgoId) {
      await notificationService.create({
        userId: donation.assignedNgoId,
        type: NOTIFICATION_TYPES.DONATION,
        title: 'Donation Cancelled',
        message: `Donation "${donation.title}" has been cancelled by the donor.`,
        metadata: { donationId: donation._id },
        priority: 'high',
      });
    }

    return donationRepository.findById(updated._id, defaultPopulate);
  }

  async getMyDonations(donorId, query) {
    return this.list({ ...query, donorId: donorId.toString() });
  }
}

export default new DonationService();
