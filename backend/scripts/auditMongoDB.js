const mongoose = require('mongoose');

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodbridge';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Connected!');

    const db = mongoose.connection.db;
    const donationsCount = await db.collection('food_donations').countDocuments({});
    const requestsCount = await db.collection('food_requests').countDocuments({});
    const usersCount = await db.collection('users').countDocuments({});

    console.log('--- MONGODB AUDIT RESULTS ---');
    console.log('FoodDonation count:', donationsCount);
    console.log('FoodRequest count:', requestsCount);
    console.log('User count:', usersCount);

    const reqStatus = await db.collection('food_requests').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray();
    console.log('FoodRequest status breakdown:', reqStatus);

    const donStatus = await db.collection('food_donations').aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).toArray();
    console.log('FoodDonation status breakdown:', donStatus);

    const dateRange = await db.collection('food_requests').aggregate([
      { $group: { _id: null, minDate: { $min: '$createdAt' }, maxDate: { $max: '$createdAt' } } }
    ]).toArray();
    console.log('Date range:', dateRange);

  } catch (err) {
    console.log('MongoDB Audit Result: Offline / No connection', err.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
