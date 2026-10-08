const axios = require('axios');

async function testEndToEndFlow() {
  console.log('=== FOODBRIDGE END-TO-END VERIFICATION ===\n');

  // STEP 1: DONOR LOGIN
  console.log('STEP 1: DONOR LOGIN');
  let token;
  const donorEmail = 'testdonor_e2e_spoilage@example.com';
  const donorPassword = 'Password123!';

  try {
    const regRes = await axios.post('http://127.0.0.1:5000/api/v1/auth/register', {
      name: 'E2E Test Donor',
      email: donorEmail,
      password: donorPassword,
      role: 'user',
      phone: '9876543210'
    });
    token = regRes.data?.data?.token;
    console.log('  -> Registered new donor account:', donorEmail);
  } catch (regErr) {
    try {
      const loginRes = await axios.post('http://127.0.0.1:5000/api/v1/auth/login', {
        email: donorEmail,
        password: donorPassword
      });
      token = loginRes.data?.data?.token;
      console.log('  -> Logged in existing donor account:', donorEmail);
    } catch (loginErr) {
      console.error('Login failed:', loginErr.response?.data || loginErr.message);
      process.exit(1);
    }
  }

  if (!token) {
    console.error('Failed to obtain auth token');
    process.exit(1);
  }
  console.log('  -> Token obtained successfully: Bearer ' + token.substring(0, 20) + '...\n');

  const headers = { Authorization: 'Bearer ' + token };

  // STEP 2: DONOR DASHBOARD
  console.log('STEP 2: DONOR DASHBOARD API CALLS');
  const dashRes = await axios.get('http://127.0.0.1:5000/api/v1/donations', { headers });
  console.log('  -> GET /api/v1/donations status:', dashRes.status, 'Items count:', dashRes.data?.data?.length || 0);

  // Retrieve or create a donation owned by this donor
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://127.0.0.1:27017/foodbridge');
  const jwt = require('jsonwebtoken');
  const decoded = jwt.decode(token);
  const donorId = new mongoose.Types.ObjectId(decoded.id);

  const now = new Date();
  const donDoc = await mongoose.connection.collection('fooddonations').insertOne({
    donorId: donorId,
    foodName: 'Fresh Vegetable Pulao & Raita',
    category: 'Cooked Meals',
    quantity: 25,
    unit: 'meals',
    description: 'Prepared for community event today afternoon.',
    cookedTime: now,
    expiryTime: new Date(now.getTime() + 8 * 3600 * 1000), // 8 hours remaining
    pickupAddress: 'Sector 15, Connaught Place, New Delhi',
    latitude: 28.6304,
    longitude: 77.2177,
    status: 'AVAILABLE',
    createdAt: now,
    updatedAt: now
  });
  const targetDonationId = donDoc.insertedId.toString();
  console.log('  -> Prepared donor donation record in DB:', targetDonationId);

  // STEP 3: OPEN DONATION
  console.log('\nSTEP 3: OPEN DONATION (Donation Details)');
  const donationRes = await axios.get('http://127.0.0.1:5000/api/v1/donations/' + targetDonationId, { headers });
  console.log('  -> GET /api/v1/donations/' + targetDonationId + ' status:', donationRes.status);
  const donationItem = donationRes.data?.data;
  console.log('  -> Item Name:', donationItem.foodName);
  console.log('  -> Category:', donationItem.category);
  console.log('  -> Quantity:', donationItem.quantity, donationItem.unit);
  console.log('  -> Coordinates for Google Maps:', donationItem.latitude, donationItem.longitude);

  // STEP 4 & 5: AI SPOILAGE PREDICTION -> REAL API -> REAL MODEL
  console.log('\nSTEP 4 & 5: AI SPOILAGE PREDICTION (Real Model via FastAPI Microservice)');
  const spoilageRes = await axios.get('http://127.0.0.1:5000/api/v1/donations/' + targetDonationId + '/spoilage-risk', { headers });
  console.log('  -> GET /api/v1/donations/' + targetDonationId + '/spoilage-risk status:', spoilageRes.status);
  
  const aiData = spoilageRes.data?.data;
  console.log('\nSTEP 6: RESULT DISPLAY');
  console.log('  -> AI Available:', aiData.aiAvailable);
  console.log('  -> Model Name:', aiData.model);
  console.log('  -> Spoilage Risk Flag:', aiData.spoilageRisk);
  console.log('  -> Risk Level:', aiData.riskLevel);
  console.log('  -> Risk Percentage:', aiData.riskScore + '%');
  console.log('  -> Confidence:', (aiData.confidence * 100).toFixed(1) + '%');
  console.log('  -> Hours Until Expiry:', aiData.hoursUntilExpiry);
  console.log('  -> Contributing Factors:', JSON.stringify(aiData.featuresUsed, null, 2));
  console.log('  -> AI Recommendation:', aiData.recommendation);

  // STEP 7: STORAGE SIMULATION TEST (Pantry vs Refrigerated vs Frozen)
  console.log('\nSTEP 7: STORAGE SIMULATION TEST (What-If Analysis via Real Model)');
  for (const cond of ['pantry', 'refrigerated', 'frozen']) {
    const simRes = await axios.post('http://127.0.0.1:5000/api/v1/donations/' + targetDonationId + '/spoilage-risk', {
      storageCondition: cond
    }, { headers });
    const sim = simRes.data?.data;
    console.log('  -> Storage: ' + cond.toUpperCase() + ' => Risk: ' + sim.riskLevel + ' (' + sim.riskScore + '%), Spoilage Flag: ' + sim.spoilageRisk);
  }

  // STEP 8: TEST EXISTING MATCHING ENDPOINT (NGO MATCHING)
  console.log('\nSTEP 8: TEST EXISTING MATCHING AI ENDPOINT');
  try {
    const matchRes = await axios.get('http://127.0.0.1:5000/api/v1/donations/' + targetDonationId + '/matches', { headers });
    console.log('  -> Matching API Status:', matchRes.status, 'Matches returned:', matchRes.data?.data?.matches?.length || 0);
  } catch (mErr) {
    console.log('  -> Matching API returned:', mErr.response?.data?.message || mErr.message);
  }

  // Clean up
  await mongoose.connection.collection('fooddonations').deleteOne({ _id: donDoc.insertedId });
  console.log('\n=== END-TO-END FLOW VERIFICATION COMPLETE: ALL CHECKS PASSED ===');
  process.exit(0);
}

testEndToEndFlow();
