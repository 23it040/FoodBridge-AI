require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');

const User = require('../models/User.model');
const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');

const auditDatabaseForMl = async () => {
  await connectDatabase();

  console.log('==================================================');
  console.log('  MONGODB REAL ML TRAINING DATASET AUDIT REPORT');
  console.log('==================================================\n');

  const userCount = await User.countDocuments();
  const donationCount = await FoodDonation.countDocuments();
  const requestCount = await FoodRequest.countDocuments();
  const notificationCount = await Notification.countDocuments();
  const auditLogCount = await AuditLog.countDocuments();

  console.log(`User Records: ${userCount}`);
  console.log(`FoodDonation Records: ${donationCount}`);
  console.log(`FoodRequest Records: ${requestCount}`);
  console.log(`Notification Records: ${notificationCount}`);
  console.log(`AuditLog Records: ${auditLogCount}\n`);

  const donations = await FoodDonation.find().lean();
  console.log('--- FOOD DONATIONS ANALYSIS ---');
  console.log(`Total Donations: ${donations.length}`);
  if (donations.length > 0) {
    const dates = donations.map(d => new Date(d.createdAt)).filter(d => !isNaN(d));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    console.log(`Date Range: ${minDate.toISOString()} to ${maxDate.toISOString()}`);
    console.log('Sample Fields Available:', Object.keys(donations[0]));
    console.log('Donation Items Details:');
    donations.forEach(d => {
      console.log(` - ID: ${d._id} | Title: "${d.foodName || d.title}" | Qty: ${d.quantity} | Status: ${d.status} | Created: ${d.createdAt}`);
    });
  }

  console.log('\n--- FOOD REQUESTS ANALYSIS ---');
  const requests = await FoodRequest.find().lean();
  console.log(`Total Requests: ${requests.length}`);
  if (requests.length > 0) {
    const dates = requests.map(r => new Date(r.createdAt)).filter(d => !isNaN(d));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    console.log(`Date Range: ${minDate.toISOString()} to ${maxDate.toISOString()}`);
    console.log('Sample Fields Available:', Object.keys(requests[0]));
    console.log('Request Details:');
    requests.forEach(r => {
      console.log(` - ID: ${r._id} | Status: ${r.status} | RequestedBy: ${r.requestedBy} | Created: ${r.createdAt}`);
    });
  }

  process.exit(0);
};

auditDatabaseForMl();
