const aiService = require('./services/ai.service');
const mongoose = require('mongoose');

async function runDirect() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge');
  console.log('MongoDB Connected.');

  console.log('Calling aiService.recommend...');
  try {
    const res = await aiService.recommend({
      donation: {
        latitude: 28.6139,
        longitude: 77.2090,
        quantity: 30,
        foodCategory: 'cooked_meals'
      }
    });
    console.log('RESULT:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runDirect();
