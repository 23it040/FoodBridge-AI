const { getNearbyNgosFromOverpass } = require('./services/overpass.service');
const mongoose = require('mongoose');

async function testOverpass() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge');

  console.log('\n--- EXECUTING getNearbyNgosFromOverpass(28.6139, 77.2090, 10000) ---');
  const res = await getNearbyNgosFromOverpass(28.6139, 77.2090, 10000);
  console.log('\n=== FINAL API RESPONSE RETURNED ===');
  console.log(JSON.stringify(res, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

testOverpass();
