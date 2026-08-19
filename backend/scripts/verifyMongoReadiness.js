const mongoose = require('mongoose');

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodbridge';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Connection Successful!');

    const db = mongoose.connection.db;
    const donationsCount = await db.collection('food_donations').countDocuments({});
    const requestsCount = await db.collection('food_requests').countDocuments({});
    const usersCount = await db.collection('users').countDocuments({});
    const eventsCount = await db.collection('donationlifecycleevents').countDocuments({});

    const completedPickups = await db.collection('donationlifecycleevents').countDocuments({ eventType: 'PICKUP_COMPLETED' });

    console.log('=== MONGODB INDEPENDENT AUDIT RESULTS ===');
    console.log('FoodDonation records:', donationsCount);
    console.log('FoodRequest records:', requestsCount);
    console.log('User records:', usersCount);
    console.log('DonationLifecycleEvent records:', eventsCount);
    console.log('Completed Pickup Events:', completedPickups);

    const dateRangeAgg = await db.collection('donationlifecycleevents').aggregate([
      { $group: { _id: null, minDate: { $min: '$timestamp' }, maxDate: { $max: '$timestamp' } } }
    ]).toArray();

    console.log('Date range in events:', dateRangeAgg);

  } catch (err) {
    console.log('MongoDB Audit Result: Offline or 0 active records stored locally:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
