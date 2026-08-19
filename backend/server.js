require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDatabase = require('./config/db');
const User = require('./models/User.model');

const PORT = process.env.PORT || 5000;

const ensureAdminExists = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No Admin account found. Creating single initial Admin account...');
      await User.create({
        name: 'Laksh Jivani',
        email: process.env.ADMIN_EMAIL || '23it030@charusat.edu.in',
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'APPROVED',
        status: 'ACTIVE'
      });
      console.log('Initial Admin created successfully.');
    } else {
      console.log(`Admin verification: ${adminCount} Admin account(s) present. Server startup clean.`);
    }
  } catch (err) {
    console.error('Error during Admin verification:', err.message);
  }
};

connectDatabase()
  .then(async () => {
    await ensureAdminExists();
    app.listen(PORT, () => {
      console.log(`FoodBridge AI backend listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to start server:', error);
    process.exit(1);
  });

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
