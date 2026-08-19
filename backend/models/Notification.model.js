const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ['ALL', 'DONOR', 'NGO', 'USER', 'ADMIN'],
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 150
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: [
        'FOOD_REQUEST_CREATED',
        'FOOD_REQUEST_ACCEPTED',
        'FOOD_REQUEST_REJECTED',
        'FOOD_PICKUP_REMINDER',
        'FOOD_PICKED_UP',
        'FOOD_COMPLETED',
        'NGO_VERIFIED',
        'NGO_REJECTED',
        'NEW_DONATION',
        'SYSTEM_NOTIFICATION'
      ],
      required: [true, 'Notification type is required']
    },
    data: {
      type: Object,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientType: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
