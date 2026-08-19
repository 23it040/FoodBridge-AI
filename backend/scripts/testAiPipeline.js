const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api/ai';
const AUTH_URL = 'http://127.0.0.1:5000/api/auth';

const runTests = async () => {
  console.log('==================================================');
  console.log('  FOODBRIDGE-AI STEP 3 ML PIPELINE INTEGRITY TESTS');
  console.log('==================================================\n');

  let token = '';
  try {
    const loginRes = await axios.post(`${AUTH_URL}/login`, {
      email: '23it030@charusat.edu.in',
      password: 'Admin123!'
    });
    token = loginRes.data?.data?.token || loginRes.data?.token;
    console.log('✓ Authenticated test runner with Admin JWT token.');
  } catch (err) {
    console.error('❌ Failed to authenticate test runner:', err.message);
    process.exit(1);
  }

  const client = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  let passed = 0;
  let failed = 0;

  const testCase = async (name, fn) => {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      if (err.response?.data) {
        console.error('   Response Body:', JSON.stringify(err.response.data));
      }
      failed++;
    }
  };

  // Test 1: Demand Prediction with Insufficient Data Status
  await testCase('Demand Prediction (Reports insufficientData & modelReady=false due to lack of real records)', async () => {
    const res = await client.post(`${BASE_URL}/predict-demand`, { city: 'Surat' });
    const data = res.data?.data || res.data;
    if (!data.insufficientData || data.modelReady !== false) {
      throw new Error(`Expected insufficientData=true and modelReady=false, got: ${JSON.stringify(data)}`);
    }
    if (data.modelStatus !== 'insufficient_data') {
      throw new Error(`Expected modelStatus='insufficient_data', got: ${data.modelStatus}`);
    }
  });

  // Test 2: Risk Score (Reports insufficientData & modelReady=false due to lack of real labeled data)
  await testCase('Risk Score (Reports insufficientData & modelReady=false due to lack of real labeled data)', async () => {
    const res = await client.post(`${BASE_URL}/risk-score`, { food_category: 'cooked_meals' });
    const data = res.data?.data || res.data;
    if (!data.insufficientData || data.modelReady !== false) {
      throw new Error(`Expected insufficientData=true and modelReady=false, got: ${JSON.stringify(data)}`);
    }
    if (data.modelStatus !== 'insufficient_data') {
      throw new Error(`Expected modelStatus='insufficient_data', got: ${data.modelStatus}`);
    }
  });

  // Test 3: Priority Score (Reports insufficientData & modelReady=false due to lack of real historical outcomes)
  await testCase('Priority Score (Reports insufficientData & modelReady=false due to lack of real outcomes)', async () => {
    const res = await client.post(`${BASE_URL}/priority-score`, { quantity: 10 });
    const data = res.data?.data || res.data;
    if (!data.insufficientData || data.modelReady !== false) {
      throw new Error(`Expected insufficientData=true and modelReady=false, got: ${JSON.stringify(data)}`);
    }
    if (data.modelStatus !== 'insufficient_data') {
      throw new Error(`Expected modelStatus='insufficient_data', got: ${data.modelStatus}`);
    }
  });

  // Test 4: NGO Recommendation with Invalid Coordinates (Expect insufficientData)
  await testCase('NGO Recommendation with Missing Location Coordinates', async () => {
    const res = await client.post(`${BASE_URL}/recommend`, { donation: { quantity: 10, food_category: 'cooked_meals' } });
    const data = res.data?.data || res.data;
    if (!data.insufficientData || data.recommendations.length !== 0) {
      throw new Error(`Expected insufficientData=true and empty recommendations, got: ${JSON.stringify(data)}`);
    }
  });

  // Test 5: Route Optimization with Missing Coordinates (Expect insufficientData)
  await testCase('Route Optimization with Missing Coordinates', async () => {
    const res = await client.post(`${BASE_URL}/optimize-route`, { donations: [] });
    const data = res.data?.data || res.data;
    if (!data.insufficientData || data.sequence.length !== 0) {
      throw new Error(`Expected insufficientData=true and empty sequence, got: ${JSON.stringify(data)}`);
    }
  });

  console.log('\n==================================================');
  console.log(`  STEP 3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
};

runTests();
