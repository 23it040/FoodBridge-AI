const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI or MONGO_URI is required in environment variables');
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn(`Failed to connect to configured MongoDB (${mongoUri}): ${err.message}`);
    if (mongoUri !== 'mongodb://127.0.0.1:27017/foodbridge') {
      console.log('Attempting fallback connection to local MongoDB: mongodb://127.0.0.1:27017/foodbridge');
      await mongoose.connect('mongodb://127.0.0.1:27017/foodbridge', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected successfully to local instance');
    } else {
      throw err;
    }
  }
};

module.exports = connectDatabase;
