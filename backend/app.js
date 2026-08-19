const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const foodRoutes = require('./routes/food.routes');
const foodRequestRoutes = require('./routes/foodRequest.routes');
const ngoRoutes = require('./routes/ngo.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const aiRoutes = require('./routes/ai.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'FoodBridge AI Backend',
    status: 'Running'
  });
});

app.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    database: isDbConnected ? 'Connected' : 'Disconnected',
    server: 'Running'
  });
});

// Primary v1 API mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/donations', foodRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/requests', foodRequestRoutes);
app.use('/api/v1/ngo', ngoRoutes);
app.use('/api/v1/ngos', ngoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', adminRoutes);
app.use('/api/v1/audit', adminRoutes);
app.use('/api/v1/reports', adminRoutes);

// Legacy and unversioned mounts
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', foodRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/requests', foodRequestRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorMiddleware);

module.exports = app;
