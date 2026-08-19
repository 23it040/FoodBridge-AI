const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor ID is required']
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 80
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: 40
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    cookedTime: {
      type: Date,
      required: [true, 'Cooked time is required']
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required']
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
      maxlength: 250
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    },
    foodImage: {
      publicId: String,
      url: String
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'REJECTED', 'EXPIRED'],
      default: 'AVAILABLE'
    }
  },
  {
    timestamps: true
  }
);

foodDonationSchema.pre('save', function (next) {
  if (this.latitude != null && this.longitude != null) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude]
    };
  }
  next();
});

foodDonationSchema.index({ location: '2dsphere' });

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);
module.exports = FoodDonation;
