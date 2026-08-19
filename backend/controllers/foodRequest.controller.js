const foodRequestService = require('../services/foodRequest.service');
const ApiResponse = require('../utils/ApiResponse');

const createRequest = async (req, res) => {
  const { foodId, requestMessage, pickupDate, pickupTime } = req.body;

  const request = await foodRequestService.createRequest({
    foodId,
    ngoId: req.user._id,
    requestMessage,
    pickupDate,
    pickupTime
  });

  try {
    const { DonationLifecycleEvent } = require('../models/DonationLifecycleEvent.model');
    await DonationLifecycleEvent.logEvent({
      donationId: request.foodId?._id || foodId,
      requestId: request._id,
      eventType: 'REQUEST_CREATED',
      actorId: req.user._id,
      actorRole: 'NGO',
      ngoId: req.user._id,
      metadata: { pickupDate, pickupTime }
    });
  } catch (eventErr) {
    console.error('[DonationLifecycleEvent] Error logging REQUEST_CREATED:', eventErr.message);
  }

  try {
    const notificationService = require('../services/notification.service');
    const foodName = request.foodId?.foodName || 'Food Item';
    const donorId = request.donorId?._id || request.donorId;

    if (donorId) {
      await notificationService.createNotification({
        recipientType: 'USER',
        recipientId: donorId,
        senderId: req.user._id,
        title: 'New Food Pickup Request',
        message: `An NGO partner requested your food donation "${foodName}".`,
        type: 'FOOD_REQUEST_CREATED',
        data: { requestId: request._id, donationId: request.foodId?._id || foodId }
      });
    }

    await notificationService.createNotification({
      recipientType: 'USER',
      recipientId: req.user._id,
      senderId: req.user._id,
      title: 'Food Request Submitted',
      message: `Your request for "${foodName}" has been submitted to the donor.`,
      type: 'FOOD_REQUEST_CREATED',
      data: { requestId: request._id, donationId: request.foodId?._id || foodId }
    });
  } catch (notifErr) {
    console.error('Failed to dispatch request creation notifications:', notifErr);
  }

  res.status(201).json(
    new ApiResponse({
      success: true,
      statusCode: 201,
      message: 'Food request created successfully',
      data: request
    })
  );
};

const listRequests = async (req, res) => {
  const requests = await foodRequestService.listRequests(req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food requests retrieved successfully',
      data: requests
    })
  );
};

const getRequest = async (req, res) => {
  const request = await foodRequestService.getRequestById(req.params.id, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food request fetched successfully',
      data: request
    })
  );
};

const updateRequestStatus = async (req, res) => {
  const { status, rejectionReason, completedAt } = req.body;
  const request = await foodRequestService.updateRequestStatus(req.params.id, req.user, {
    status,
    rejectionReason,
    completedAt
  });

  try {
    const { DonationLifecycleEvent } = require('../models/DonationLifecycleEvent.model');
    const eventTypeMap = {
      ACCEPTED: 'REQUEST_ACCEPTED',
      REJECTED: 'REQUEST_REJECTED',
      SCHEDULED: 'PICKUP_SCHEDULED',
      PICKED_UP: 'PICKUP_STARTED',
      COMPLETED: 'PICKUP_COMPLETED'
    };

    if (eventTypeMap[status]) {
      await DonationLifecycleEvent.logEvent({
        donationId: request.foodId?._id || request.foodId,
        requestId: request._id,
        eventType: eventTypeMap[status],
        actorId: req.user._id,
        actorRole: req.user.role === 'NGO' ? 'NGO' : req.user.role === 'ADMIN' ? 'ADMIN' : 'DONOR',
        ngoId: request.ngoId?._id || request.ngoId,
        metadata: { status, rejectionReason, completedAt: request.completedAt }
      });
    }
  } catch (eventErr) {
    console.error('[DonationLifecycleEvent] Error logging status lifecycle event:', eventErr.message);
  }

  try {
    const notificationService = require('../services/notification.service');
    const foodName = request.foodId?.foodName || 'Food Item';
    const ngoId = request.ngoId?._id || request.ngoId;

    if (ngoId) {
      let notifType = 'FOOD_REQUEST_ACCEPTED';
      let title = 'Food Request Status Updated';
      let message = `Your request for "${foodName}" status changed to ${status}.`;

      if (status === 'ACCEPTED') {
        notifType = 'FOOD_REQUEST_ACCEPTED';
        title = 'Food Request Accepted!';
        message = `The donor has accepted your request for "${foodName}".`;
      } else if (status === 'REJECTED') {
        notifType = 'FOOD_REQUEST_REJECTED';
        title = 'Food Request Declined';
        message = `Your request for "${foodName}" was declined by the donor.`;
      } else if (status === 'COMPLETED') {
        notifType = 'FOOD_COMPLETED';
        title = 'Food Pickup Completed';
        message = `The donation "${foodName}" pickup has been marked completed.`;
      }

      await notificationService.createNotification({
        recipientType: 'USER',
        recipientId: ngoId,
        senderId: req.user._id,
        title,
        message,
        type: notifType,
        data: { requestId: request._id, donationId: request.foodId?._id || request.foodId }
      });
    }
  } catch (notifErr) {
    console.error('Failed to dispatch request update notification:', notifErr);
  }

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food request status updated successfully',
      data: request
    })
  );
};

const deleteRequest = async (req, res) => {
  await foodRequestService.deleteRequest(req.params.id, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food request deleted successfully'
    })
  );
};

module.exports = {
  createRequest,
  listRequests,
  getRequest,
  updateRequestStatus,
  deleteRequest
};
