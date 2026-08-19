const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      trim: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true
    },
    details: {
      type: Object,
      default: {}
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
