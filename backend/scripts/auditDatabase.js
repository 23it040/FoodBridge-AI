require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const User = require('../models/User.model');
const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');

async function fullAudit() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  const users = await User.find().lean();
  const donations = await FoodDonation.find().lean();
  const requests = await FoodRequest.find().lean();
  const notifications = await Notification.find().lean();
  const auditLogs = await AuditLog.find().lean();

  const auditSummary = {
    totalUsers: users.length,
    adminsCount: users.filter(u => u.role === 'admin').length,
    donorsCount: users.filter(u => u.role === 'user' || u.role === 'partner').length,
    ngosCount: users.filter(u => u.role === 'ngo').length,
    users,
    totalDonations: donations.length,
    donations,
    totalRequests: requests.length,
    requests,
    totalNotifications: notifications.length,
    notifications,
    totalAuditLogs: auditLogs.length,
    auditLogs
  };

  fs.writeFileSync('scripts/audit_results.json', JSON.stringify(auditSummary, null, 2));
  console.log('Complete database audit saved to scripts/audit_results.json');
  await mongoose.disconnect();
  process.exit(0);
}

fullAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
