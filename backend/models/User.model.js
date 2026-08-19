const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'partner', 'ngo'],
      default: 'user'
    },
    organizationName: {
      type: String,
      trim: true,
      maxlength: 120
    },
    registrationNumber: {
      type: String,
      trim: true,
      maxlength: 80,
      unique: true,
      sparse: true
    },
    city: {
      type: String,
      trim: true,
      maxlength: 80
    },
    state: {
      type: String,
      trim: true,
      maxlength: 80
    },
    pincode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    profileImage: {
      publicId: String,
      url: String
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20
    },
    address: {
      type: String,
      trim: true,
      maxlength: 250
    },
    avatar: {
      publicId: String,
      url: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    verificationRejectionReason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'BLOCKED'],
      default: 'ACTIVE'
    },
    statusReason: {
      type: String,
      trim: true
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
