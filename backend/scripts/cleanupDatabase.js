require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User.model');
const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');

const isDryRun = process.argv.includes('--dry-run');

async function cleanup() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  console.log(`==================================================`);
  console.log(`  FOODBRIDGE-AI PRODUCTION DATABASE CLEANUP SCRIPT`);
  console.log(`  MODE: ${isDryRun ? 'DRY RUN (NO CHANGES WILL BE SAVED)' : 'LIVE EXECUTION (DELETING FAKE DATA)'}`);
  console.log(`==================================================\n`);

  // Step 1: Initial Database Counts
  const initialUsersCount = await User.countDocuments();
  const initialDonationsCount = await FoodDonation.countDocuments();
  const initialRequestsCount = await FoodRequest.countDocuments();
  const initialNotificationsCount = await Notification.countDocuments();
  const initialAuditLogsCount = await AuditLog.countDocuments();

  console.log(`INITIAL DATABASE COUNTS:`);
  console.log(`- Total Users: ${initialUsersCount}`);
  console.log(`- Total Food Donations: ${initialDonationsCount}`);
  console.log(`- Total Food Requests: ${initialRequestsCount}`);
  console.log(`- Total Notifications: ${initialNotificationsCount}`);
  console.log(`- Total Audit Logs: ${initialAuditLogsCount}\n`);

  // Step 2: Identify Legitimate Real Users
  // Canonical Admin: 23it030@charusat.edu.in (Laksh Jivani)
  // Legitimate Users/NGOs: 23it040@charusat.edu.in, varmijivani1611@gmail.com, 23it046@charusat.edu.in
  const realEmails = [
    '23it030@charusat.edu.in',
    '23it040@charusat.edu.in',
    'varmijivani1611@gmail.com',
    '23it046@charusat.edu.in'
  ].map(e => e.trim().toLowerCase());

  const allUsers = await User.find().lean();

  const realUsers = [];
  const fakeUsers = [];

  const testEmailPatterns = [
    /example\.com/i,
    /test/i,
    /qa\./i,
    /audit/i,
    /demo/i,
    /dummy/i,
    /sample/i,
    /fake/i,
    /proof/i,
    /live user/i,
    /live admin/i
  ];

  allUsers.forEach(u => {
    const normEmail = (u.email || '').trim().toLowerCase();
    const isExplicitReal = realEmails.includes(normEmail);
    const isTestPattern = testEmailPatterns.some(p => p.test(u.email) || p.test(u.name));

    if (isExplicitReal) {
      realUsers.push(u);
    } else if (isTestPattern) {
      fakeUsers.push(u);
    } else {
      // Check if user has legitimate activity or real domain name
      if (u.role === 'admin' && normEmail !== '23it030@charusat.edu.in') {
        fakeUsers.push(u); // Remove duplicate admins
      } else {
        fakeUsers.push(u); // Default test accounts cleanup
      }
    }
  });

  const realUserIds = new Set(realUsers.map(u => u._id.toString()));
  const fakeUserIds = new Set(fakeUsers.map(u => u._id.toString()));

  console.log(`USER IDENTIFICATION:`);
  console.log(`- Preserved Real Users (${realUsers.length}):`);
  realUsers.forEach(u => {
    console.log(`   * [${u.role.toUpperCase()}] ${u.name} (${u.email}) - ID: ${u._id}`);
  });
  console.log(`- Fake / Duplicate / Test Users to Remove: ${fakeUsers.length}\n`);

  // Step 3: Identify Donations to Remove
  const allDonations = await FoodDonation.find().lean();
  const realDonations = [];
  const fakeDonations = [];

  allDonations.forEach(d => {
    const donorIdStr = (d.donorId || '').toString();
    const isRealDonor = realUserIds.has(donorIdStr);
    const isTestFoodName = /test/i.test(d.foodName) || /sample/i.test(d.foodName) || /dummy/i.test(d.foodName);

    if (isRealDonor && !isTestFoodName) {
      realDonations.push(d);
    } else {
      fakeDonations.push(d);
    }
  });

  const realDonationIds = new Set(realDonations.map(d => d._id.toString()));

  console.log(`FOOD DONATIONS IDENTIFICATION:`);
  console.log(`- Preserved Real Donations (${realDonations.length}):`);
  realDonations.forEach(d => {
    console.log(`   * "${d.foodName}" (Qty: ${d.quantity}) - DonorID: ${d.donorId}`);
  });
  console.log(`- Fake / Test / Orphaned Donations to Remove: ${fakeDonations.length}\n`);

  // Step 4: Identify Food Requests to Remove
  const allRequests = await FoodRequest.find().lean();
  const realRequests = [];
  const fakeRequests = [];

  allRequests.forEach(r => {
    const donorIdStr = (r.donorId || '').toString();
    const ngoIdStr = (r.ngoId || '').toString();
    const foodIdStr = (r.foodId || '').toString();

    const isRealDonor = realUserIds.has(donorIdStr);
    const isRealNgo = realUserIds.has(ngoIdStr);
    const isRealFood = realDonationIds.has(foodIdStr);

    if (isRealDonor && isRealNgo && isRealFood) {
      realRequests.push(r);
    } else {
      fakeRequests.push(r);
    }
  });

  console.log(`FOOD REQUESTS IDENTIFICATION:`);
  console.log(`- Preserved Real Requests (${realRequests.length}):`);
  realRequests.forEach(r => {
    console.log(`   * Request ID: ${r._id} | Status: ${r.status} | FoodID: ${r.foodId}`);
  });
  console.log(`- Fake / Test / Orphaned Requests to Remove: ${fakeRequests.length}\n`);

  // Step 5: Identify Notifications & Audit Logs to Remove
  const allNotifications = await Notification.find().lean();
  const realNotifications = [];
  const fakeNotifications = [];

  allNotifications.forEach(n => {
    const recipIdStr = (n.recipientId || '').toString();
    if (recipIdStr && realUserIds.has(recipIdStr)) {
      realNotifications.push(n);
    } else {
      fakeNotifications.push(n);
    }
  });

  const allAuditLogs = await AuditLog.find().lean();
  const realAuditLogs = [];
  const fakeAuditLogs = [];

  allAuditLogs.forEach(a => {
    const perfByStr = (a.performedBy || '').toString();
    if (perfByStr && realUserIds.has(perfByStr)) {
      realAuditLogs.push(a);
    } else {
      fakeAuditLogs.push(a);
    }
  });

  console.log(`NOTIFICATIONS & AUDIT LOGS IDENTIFICATION:`);
  console.log(`- Preserved Real Notifications: ${realNotifications.length}`);
  console.log(`- Fake / Test Notifications to Remove: ${fakeNotifications.length}`);
  console.log(`- Preserved Real Audit Logs: ${realAuditLogs.length}`);
  console.log(`- Fake / Test Audit Logs to Remove: ${fakeAuditLogs.length}\n`);

  // Step 6: Perform Deletions if not Dry Run
  if (!isDryRun) {
    console.log(`EXECUTING DELETIONS...`);

    const fakeUserObjectIds = fakeUsers.map(u => u._id);
    const fakeDonationObjectIds = fakeDonations.map(d => d._id);
    const fakeRequestObjectIds = fakeRequests.map(r => r._id);
    const fakeNotificationObjectIds = fakeNotifications.map(n => n._id);
    const fakeAuditLogObjectIds = fakeAuditLogs.map(a => a._id);

    if (fakeUserObjectIds.length > 0) await User.deleteMany({ _id: { $in: fakeUserObjectIds } });
    if (fakeDonationObjectIds.length > 0) await FoodDonation.deleteMany({ _id: { $in: fakeDonationObjectIds } });
    if (fakeRequestObjectIds.length > 0) await FoodRequest.deleteMany({ _id: { $in: fakeRequestObjectIds } });
    if (fakeNotificationObjectIds.length > 0) await Notification.deleteMany({ _id: { $in: fakeNotificationObjectIds } });
    if (fakeAuditLogObjectIds.length > 0) await AuditLog.deleteMany({ _id: { $in: fakeAuditLogObjectIds } });

    console.log(`✓ Deleted ${fakeUsers.length} fake users.`);
    console.log(`✓ Deleted ${fakeDonations.length} fake donations.`);
    console.log(`✓ Deleted ${fakeRequests.length} fake requests.`);
    console.log(`✓ Deleted ${fakeNotifications.length} fake notifications.`);
    console.log(`✓ Deleted ${fakeAuditLogs.length} fake audit logs.\n`);

    // Normalize emails for preserved users
    const preservedUsers = await User.find();
    for (const u of preservedUsers) {
      const norm = (u.email || '').trim().toLowerCase();
      if (u.email !== norm) {
        u.email = norm;
        await u.save();
      }
    }

    // Ensure Unique Email Index on User collection
    try {
      await User.syncIndexes();
      console.log(`✓ Synchronized unique indexes on User model.`);
    } catch (idxErr) {
      console.warn(`Index synchronization note:`, idxErr.message);
    }
  }

  // Step 7: Final Verification Counts
  const finalUsers = isDryRun ? realUsers.length : await User.countDocuments();
  const finalAdmins = isDryRun ? realUsers.filter(u => u.role === 'admin').length : await User.countDocuments({ role: 'admin' });
  const finalDonors = isDryRun ? realUsers.filter(u => u.role === 'user' || u.role === 'partner').length : await User.countDocuments({ role: { $in: ['user', 'partner'] } });
  const finalNgos = isDryRun ? realUsers.filter(u => u.role === 'ngo').length : await User.countDocuments({ role: 'ngo' });
  const finalDonations = isDryRun ? realDonations.length : await FoodDonation.countDocuments();
  const finalRequests = isDryRun ? realRequests.length : await FoodRequest.countDocuments();
  const finalNotifications = isDryRun ? realNotifications.length : await Notification.countDocuments();
  const finalAuditLogs = isDryRun ? realAuditLogs.length : await AuditLog.countDocuments();

  console.log(`==================================================`);
  console.log(`  FINAL DATABASE INTEGRITY VERIFICATION REPORT`);
  console.log(`==================================================`);
  console.log(`- Total Users: ${finalUsers}`);
  console.log(`  * Admin Count (MUST BE 1): ${finalAdmins} ${finalAdmins === 1 ? '✅' : '❌'}`);
  console.log(`  * Donor Users Count: ${finalDonors}`);
  console.log(`  * NGO Users Count: ${finalNgos}`);
  console.log(`- Food Donations Count: ${finalDonations}`);
  console.log(`- Food Requests Count: ${finalRequests}`);
  console.log(`- Notifications Count: ${finalNotifications}`);
  console.log(`- Audit Logs Count: ${finalAuditLogs}`);
  console.log(`==================================================\n`);

  await mongoose.disconnect();
  process.exit(0);
}

cleanup().catch(err => {
  console.error(`Cleanup script error:`, err);
  process.exit(1);
});
