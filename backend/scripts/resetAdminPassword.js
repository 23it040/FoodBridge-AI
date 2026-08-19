require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const User = require('../models/User.model');

const run = async () => {
  await connectDatabase();
  const admin = await User.findOne({ email: '23it030@charusat.edu.in' });
  if (admin) {
    admin.password = 'Admin123!';
    await admin.save();
    console.log('Successfully set admin password for 23it030@charusat.edu.in to Admin123!');
  } else {
    console.error('Admin user not found!');
  }
  process.exit(0);
};

run();
