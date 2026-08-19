const AuditLog = require('../models/AuditLog.model');

const recordAction = async ({ adminId, action, resourceType, targetId, details = {}, ipAddress }) => {
  await AuditLog.create({
    adminId,
    action,
    resourceType,
    targetId,
    details,
    ipAddress
  });
};

module.exports = {
  recordAction
};
