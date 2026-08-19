const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/audit_results.json', 'utf8'));

console.log('Total Users:', data.totalUsers);

const testUserPatterns = [
  /test/i,
  /example\.com/i,
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

const realUsers = [];
const fakeUsers = [];

data.users.forEach(user => {
  const isTest = testUserPatterns.some(p => p.test(user.name) || p.test(user.email));
  if (isTest) {
    fakeUsers.push(user);
  } else {
    realUsers.push(user);
  }
});

console.log('\n--- REAL USERS IDENTIFIED ---');
console.log(`Count: ${realUsers.length}`);
realUsers.forEach(u => {
  console.log(`ID: ${u._id} | Name: "${u.name}" | Email: "${u.email}" | Role: ${u.role}`);
});

console.log('\n--- FAKE/TEST USERS IDENTIFIED ---');
console.log(`Count: ${fakeUsers.length}`);

console.log('\n--- DONATIONS ---');
console.log(`Total Donations: ${data.totalDonations}`);
data.donations.forEach(d => {
  console.log(`ID: ${d._id} | Name: "${d.foodName}" | DonorID: ${d.donorId} | Category: ${d.category} | Status: ${d.status}`);
});

console.log('\n--- REQUESTS ---');
console.log(`Total Requests: ${data.totalRequests}`);
data.requests.forEach(r => {
  console.log(`ID: ${r._id} | FoodID: ${r.foodId} | DonorID: ${r.donorId} | NGOID: ${r.ngoId} | Status: ${r.status}`);
});
