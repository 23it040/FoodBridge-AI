const adminService = require('../services/admin.service');
const auditService = require('../services/audit.service');
const ApiResponse = require('../utils/ApiResponse');

const getDashboard = async (req, res) => {
  const data = await adminService.getDashboard();
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Admin dashboard data fetched', data }));
};

const listUsers = async (req, res) => {
  const data = await adminService.listUsers(req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Users fetched successfully', data }));
};

const getUser = async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'User fetched successfully', data: user }));
};

const updateUser = async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'UPDATE_USER',
    resourceType: 'User',
    targetId: req.params.id,
    details: req.body,
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'User updated successfully', data: user }));
};

const deleteUser = async (req, res) => {
  const user = await adminService.deleteUser(req.params.id);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'DELETE_USER',
    resourceType: 'User',
    targetId: req.params.id,
    details: { email: user.email, role: user.role },
    ipAddress: req.ip
  });

  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'User deleted successfully' }));
};

const updateUserStatus = async (req, res) => {
  const { status, reason } = req.body;
  const user = await adminService.updateUserStatus(req.params.id, status, reason);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'UPDATE_USER_STATUS',
    resourceType: 'User',
    targetId: req.params.id,
    details: { status, reason },
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'User status updated successfully', data: user }));
};

const listPendingNgos = async (req, res) => {
  const data = await adminService.listPendingNgos(req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Pending NGOs fetched successfully', data }));
};

const approveNgo = async (req, res) => {
  const ngo = await adminService.changeNgoVerification(req.params.id, 'approve', req.user._id);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'APPROVE_NGO',
    resourceType: 'User',
    targetId: req.params.id,
    details: { verificationStatus: 'APPROVED' },
    ipAddress: req.ip
  });

  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      recipientType: 'USER',
      recipientId: ngo._id,
      senderId: req.user._id,
      title: 'NGO Verification Approved',
      message: 'Congratulations! Your NGO profile has been verified and approved by the platform admin.',
      type: 'NGO_VERIFIED',
      data: { ngoId: ngo._id }
    });
  } catch (err) {
    console.error('Failed to notify NGO of approval:', err);
  }

  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'NGO approved successfully', data: ngo }));
};

const rejectNgo = async (req, res) => {
  const ngo = await adminService.changeNgoVerification(req.params.id, 'reject', req.user._id, req.body.reason);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'REJECT_NGO',
    resourceType: 'User',
    targetId: req.params.id,
    details: { verificationStatus: 'REJECTED', reason: req.body.reason },
    ipAddress: req.ip
  });

  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      recipientType: 'USER',
      recipientId: ngo._id,
      senderId: req.user._id,
      title: 'NGO Verification Rejected',
      message: `Your NGO verification request was declined: ${req.body.reason || 'Verification criteria not met.'}`,
      type: 'NGO_REJECTED',
      data: { ngoId: ngo._id }
    });
  } catch (err) {
    console.error('Failed to notify NGO of rejection:', err);
  }

  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'NGO rejected successfully', data: ngo }));
};

const suspendNgo = async (req, res) => {
  const ngo = await adminService.changeNgoVerification(req.params.id, 'suspend', req.user._id, req.body.reason);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'SUSPEND_NGO',
    resourceType: 'User',
    targetId: req.params.id,
    details: { verificationStatus: 'SUSPENDED', reason: req.body.reason },
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'NGO suspended successfully', data: ngo }));
};

const listDonations = async (req, res) => {
  const data = await adminService.listDonations(req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Donations fetched successfully', data }));
};

const getDonation = async (req, res) => {
  const donation = await adminService.getDonationById(req.params.id);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Donation fetched successfully', data: donation }));
};

const updateDonationStatus = async (req, res) => {
  const donation = await adminService.updateDonationStatus(req.params.id, req.body.status);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'UPDATE_DONATION_STATUS',
    resourceType: 'FoodDonation',
    targetId: req.params.id,
    details: { status: req.body.status },
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Donation status updated successfully', data: donation }));
};

const deleteDonation = async (req, res) => {
  const donation = await adminService.deleteDonation(req.params.id);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'DELETE_DONATION',
    resourceType: 'FoodDonation',
    targetId: req.params.id,
    details: { foodName: donation.foodName, donorId: donation.donorId },
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Donation deleted successfully' }));
};

const listRequests = async (req, res) => {
  const data = await adminService.listRequests(req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Requests fetched successfully', data }));
};

const getRequest = async (req, res) => {
  const request = await adminService.getRequestById(req.params.id);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Request fetched successfully', data: request }));
};

const updateRequestStatus = async (req, res) => {
  const request = await adminService.updateRequestStatus(req.params.id, req.body.status);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'UPDATE_REQUEST_STATUS',
    resourceType: 'FoodRequest',
    targetId: req.params.id,
    details: { status: req.body.status },
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Request status updated successfully', data: request }));
};

const deleteRequest = async (req, res) => {
  await adminService.deleteRequest(req.params.id);
  await auditService.recordAction({
    adminId: req.user._id,
    action: 'DELETE_REQUEST',
    resourceType: 'FoodRequest',
    targetId: req.params.id,
    ipAddress: req.ip
  });
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Request deleted successfully' }));
};

const reportsOverview = async (req, res) => {
  const data = await adminService.reportsOverview(req.query.range, req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Overview report fetched successfully', data }));
};

const reportsDonations = async (req, res) => {
  const data = await adminService.reportsDonations(req.query.range, req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Donation report fetched successfully', data }));
};

const reportsRequests = async (req, res) => {
  const data = await adminService.reportsRequests(req.query.range, req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Request report fetched successfully', data }));
};

const reportsUsers = async (req, res) => {
  const data = await adminService.reportsUsers(req.query.range, req.query.startDate, req.query.endDate);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'User report fetched successfully', data }));
};

const getAnalytics = async (req, res) => {
  const data = await adminService.getAnalytics();
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Analytics fetched successfully', data }));
};

const createNotification = async (req, res) => {
  const notification = await adminService.sendNotification({
    recipientType: req.body.recipientType,
    recipientId: req.body.recipientId,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type,
    data: req.body.data,
    createdBy: req.user._id
  });

  await auditService.recordAction({
    adminId: req.user._id,
    action: 'CREATE_NOTIFICATION',
    resourceType: 'Notification',
    targetId: notification._id,
    details: { recipientType: notification.recipientType, recipient: notification.recipient, type: notification.type },
    ipAddress: req.ip
  });

  res.status(201).json(new ApiResponse({ success: true, statusCode: 201, message: 'Notification created successfully', data: notification }));
};

const listAuditLogs = async (req, res) => {
  const data = await adminService.listAuditLogs(req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Audit logs fetched successfully', data }));
};

const listNotifications = async (req, res) => {
  const data = await adminService.listNotifications(req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Notifications fetched successfully', data }));
};

module.exports = {
  getDashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  listPendingNgos,
  approveNgo,
  rejectNgo,
  suspendNgo,
  listDonations,
  getDonation,
  updateDonationStatus,
  deleteDonation,
  listRequests,
  getRequest,
  updateRequestStatus,
  deleteRequest,
  reportsOverview,
  reportsDonations,
  reportsRequests,
  reportsUsers,
  getAnalytics,
  createNotification,
  listAuditLogs,
  listNotifications
};
