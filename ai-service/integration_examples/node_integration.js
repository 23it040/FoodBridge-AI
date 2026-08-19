// Example Node.js (Express) integration with the AI microservice using axios
const axios = require('axios');

const AI_BASE = process.env.AI_SERVICE_URL || 'http://localhost:8001';

async function recommendExample(donation, ngos) {
  try {
    const res = await axios.post(`${AI_BASE}/recommend`, { donation, ngos, top_k: 5 }, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error('AI recommend error', err.message);
    throw err;
  }
}

async function priorityExample(payload) {
  try {
    const res = await axios.post(`${AI_BASE}/priority-score`, payload, { timeout: 3000 });
    return res.data;
  } catch (err) {
    console.error('AI priority error', err.message);
    throw err;
  }
}

async function riskExample(payload) {
  try {
    const res = await axios.post(`${AI_BASE}/risk-score`, payload, { timeout: 3000 });
    return res.data;
  } catch (err) {
    console.error('AI risk error', err.message);
    throw err;
  }
}

module.exports = { recommendExample, priorityExample, riskExample };
