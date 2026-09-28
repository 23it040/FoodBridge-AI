const foodDonationService = require('../services/foodDonation.service');
const cloudinaryService = require('../services/cloudinary.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const createDonation = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Food image is required.');
  }

  const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/donations', req.file.originalname);
  const foodImage = {
    publicId: uploadResult.public_id || null,
    url: uploadResult.secure_url || null
  };

  const donationData = {
    donorId: req.user._id,
    foodName: req.body.foodName,
    category: req.body.category || 'General',
    quantity: req.body.quantity || 1,
    unit: req.body.unit || 'servings',
    description: req.body.description || '',
    cookedTime: req.body.cookedTime || new Date(),
    expiryTime: req.body.expiryTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
    pickupAddress: req.body.pickupAddress || '',
    latitude: req.body.latitude || 28.6139,
    longitude: req.body.longitude || 77.2090,
    foodImage
  };

  const donation = await foodDonationService.createDonation(donationData);

  try {
    const { DonationLifecycleEvent } = require('../models/DonationLifecycleEvent.model');
    await DonationLifecycleEvent.logEvent({
      donationId: donation._id,
      eventType: 'DONATION_CREATED',
      actorId: req.user._id,
      actorRole: req.user.role === 'NGO' ? 'NGO' : req.user.role === 'ADMIN' ? 'ADMIN' : 'DONOR',
      location: donation.location || (donation.longitude && donation.latitude ? { type: 'Point', coordinates: [donation.longitude, donation.latitude] } : undefined),
      metadata: { category: donation.category, quantity: donation.quantity }
    });
  } catch (eventErr) {
    console.error('[DonationLifecycleEvent] Error logging DONATION_CREATED:', eventErr.message);
  }

  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      recipientType: 'USER',
      recipientId: req.user._id,
      senderId: req.user._id,
      title: 'Food Donation Created',
      message: `Your food donation "${donation.foodName}" has been posted successfully.`,
      type: 'NEW_DONATION',
      data: { donationId: donation._id }
    });
    await notificationService.sendNearbyDonationNotification(donation, 50);
  } catch (notifErr) {
    console.error('Failed to dispatch donation creation notifications:', notifErr);
  }

  res.status(201).json(
    new ApiResponse({
      success: true,
      statusCode: 201,
      message: 'Food donation created successfully',
      data: donation
    })
  );
};

const listDonations = async (req, res) => {
  const donations = await foodDonationService.listDonations(req.user, req.query);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donations retrieved successfully',
      data: donations
    })
  );
};


const getDonation = async (req, res) => {
  const donation = await foodDonationService.getDonationById(req.params.id, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donation fetched successfully',
      data: donation
    })
  );
};

const updateDonation = async (req, res) => {
  const updateData = {};

  if (typeof req.body.foodName === 'string') updateData.foodName = req.body.foodName;
  if (typeof req.body.category === 'string') updateData.category = req.body.category;
  if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;
  if (typeof req.body.unit === 'string') updateData.unit = req.body.unit;
  if (typeof req.body.description === 'string') updateData.description = req.body.description;
  if (req.body.cookedTime) updateData.cookedTime = req.body.cookedTime;
  if (req.body.expiryTime) updateData.expiryTime = req.body.expiryTime;
  if (typeof req.body.pickupAddress === 'string') updateData.pickupAddress = req.body.pickupAddress;
  if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;
  if (typeof req.body.status === 'string') updateData.status = req.body.status;

  if (req.file) {
    const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/donations', req.file.originalname);
    updateData.foodImage = {
      publicId: uploadResult.public_id || null,
      url: uploadResult.secure_url || null
    };
  }

  const donation = await foodDonationService.updateDonation(req.params.id, req.user, updateData);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donation updated successfully',
      data: donation
    })
  );
};

const deleteDonation = async (req, res) => {
  await foodDonationService.deleteDonation(req.params.id, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donation deleted successfully'
    })
  );
};

function calculateLogisticsMatchScore({ distanceKm, donationQty, ngoCap, foodCategory, expiryHours }) {
  let distPts = 10;
  if (distanceKm <= 5) distPts = 100;
  else if (distanceKm <= 10) distPts = 90;
  else if (distanceKm <= 15) distPts = 75;
  else if (distanceKm <= 20) distPts = 60;
  else if (distanceKm <= 25) distPts = 45;
  else if (distanceKm <= 30) distPts = 35;
  else if (distanceKm <= 40) distPts = 25;
  else if (distanceKm <= 50) distPts = 15;

  const cap = ngoCap && ngoCap > 0 ? ngoCap : 100;
  let capPts = 100;
  if (donationQty > cap) {
    const ratio = donationQty / cap;
    if (ratio <= 1.25) capPts = 80;
    else if (ratio <= 1.5) capPts = 60;
    else if (ratio <= 2.0) capPts = 40;
    else capPts = 20;
  }

  const catPts = 90;

  let qtyPts = 50;
  if (donationQty >= 50) qtyPts = 100;
  else if (donationQty >= 20) qtyPts = 85;
  else if (donationQty >= 10) qtyPts = 70;

  let urgPts = 50;
  if (expiryHours <= 3) urgPts = 100;
  else if (expiryHours <= 6) urgPts = 90;
  else if (expiryHours <= 12) urgPts = 75;
  else if (expiryHours <= 24) urgPts = 60;

  const baseScore = (distPts * 0.45) + (capPts * 0.25) + (catPts * 0.15) + (qtyPts * 0.10) + (urgPts * 0.05);

  let finalScore = baseScore;
  if (distanceKm > 100) {
    finalScore = Math.min(finalScore, 20);
    finalScore = Math.max(10, Math.min(20, finalScore));
  } else if (distanceKm > 50) {
    finalScore = Math.min(finalScore, 30);
    finalScore = Math.max(10, Math.min(30, finalScore));
  } else if (distanceKm > 40) {
    finalScore = Math.min(finalScore, 35);
  } else if (distanceKm > 30) {
    finalScore = Math.min(finalScore, 45);
  } else if (distanceKm > 20) {
    finalScore = Math.min(finalScore, 55);
  }

  const roundedScore = Math.round(Math.max(10, Math.min(100, finalScore)));

  let recommendation = 'NOT RECOMMENDED';
  if (roundedScore >= 80) recommendation = 'HIGH MATCH';
  else if (roundedScore >= 60) recommendation = 'RECOMMENDED';
  else if (roundedScore >= 36) recommendation = 'LOW MATCH';

  const reasons = [];
  if (capPts >= 80) reasons.push('✓ Capacity compatible');
  if (catPts >= 80) reasons.push('✓ Food category compatible');
  if (distanceKm <= 10) {
    reasons.push(`✓ Nearby pickup (${distanceKm.toFixed(1)} km)`);
  } else if (distanceKm > 40) {
    reasons.push(`✕ Pickup distance ${distanceKm.toFixed(1)} km (Impractical)`);
  } else {
    reasons.push(`✕ Pickup distance ${distanceKm.toFixed(1)} km`);
  }

  return {
    score: roundedScore,
    matchScore: roundedScore,
    recommendation,
    matchLevel: recommendation,
    distanceKm: Math.round(distanceKm * 10) / 10,
    breakdown: {
      distance: Math.round(distPts),
      capacity: Math.round(capPts),
      category: Math.round(catPts),
      quantity: Math.round(qtyPts),
      urgency: Math.round(urgPts)
    },
    reasons
  };
}

const getDonationMatches = async (req, res) => {
  const axios = require('axios');
  const User = require('../models/User.model');
  const FoodDonation = require('../models/FoodDonation.model');

  const donationId = req.params.id;
  const donation = await FoodDonation.findById(donationId);
  if (!donation) {
    throw new ApiError(404, 'Food donation listing not found');
  }

  const now = new Date();
  if (donation.status === 'EXPIRED' || (donation.expiryTime && new Date(donation.expiryTime) <= now)) {
    throw new ApiError(400, 'This food donation has expired and cannot be matched with NGOs.');
  }

  const eligibleNgos = await User.find({
    role: { $in: ['ngo', 'partner'] },
    verificationStatus: 'APPROVED',
    status: 'ACTIVE',
    latitude: { $exists: true, $ne: null },
    longitude: { $exists: true, $ne: null }
  }).select('_id name organizationName city latitude longitude phone address email capacity');

  if (!eligibleNgos || eligibleNgos.length === 0) {
    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'No eligible verified NGOs available for matching',
        data: {
          donationId,
          aiAvailable: true,
          matches: []
        }
      })
    );
  }

  const donLat = donation.latitude || 28.6139;
  const donLon = donation.longitude || 77.2090;
  const expiry = donation.expiryTime ? new Date(donation.expiryTime) : new Date(Date.now() + 6 * 3600 * 1000);
  const expiryHoursRemaining = Math.max(0.5, (expiry.getTime() - now.getTime()) / (1000 * 60 * 60));

  const ngoPayloads = eligibleNgos.map((ngo) => ({
    ngoId: ngo._id.toString(),
    ngoName: ngo.organizationName || ngo.name || 'Verified NGO Partner',
    latitude: ngo.latitude,
    longitude: ngo.longitude,
    ngoCapacity: ngo.capacity || 100.0
  }));

  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

  try {
    const aiResponse = await axios.post(
      `${aiServiceUrl}/predict/match`,
      {
        donation: {
          foodId: donation._id.toString(),
          foodCategory: donation.category || 'cooked_meals',
          quantity: donation.quantity || 1,
          latitude: donLat,
          longitude: donLon,
          expiryHoursRemaining
        },
        ngos: ngoPayloads
      },
      { timeout: 5000 }
    );

    const matches = aiResponse.data?.matches || [];
    const enrichedMatches = matches.map((m) => {
      const dbNgo = eligibleNgos.find((n) => n._id.toString() === m.ngoId);
      return {
        ...m,
        city: dbNgo?.city || 'Local Region',
        phone: dbNgo?.phone || null,
        email: dbNgo?.email || null,
        latitude: dbNgo?.latitude,
        longitude: dbNgo?.longitude
      };
    }).sort((a, b) => (b.score || b.matchScore || 0) - (a.score || a.matchScore || 0));

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'NGO matches calculated successfully via ML model',
        data: {
          donationId,
          aiAvailable: true,
          matches: enrichedMatches
        }
      })
    );
  } catch (err) {
    console.warn(`[AI Service Warning] Matching model call failed: ${err.message}. Using distance fallback.`);

    const R = 6371.0;
    const fallbackMatches = eligibleNgos.map((ngo) => {
      const dLat = (ngo.latitude - donLat) * (Math.PI / 180);
      const dLon = (ngo.longitude - donLon) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(donLat * (Math.PI / 180)) *
          Math.cos(ngo.latitude * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      const evalRes = calculateLogisticsMatchScore({
        distanceKm: dist,
        donationQty: donation.quantity || 1,
        ngoCap: ngo.capacity || 100,
        foodCategory: donation.category || 'cooked_meals',
        expiryHours: expiryHoursRemaining
      });

      return {
        ngoId: ngo._id.toString(),
        ngoName: ngo.organizationName || ngo.name || 'Verified NGO Partner',
        city: ngo.city || 'Local Region',
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        score: evalRes.score,
        matchScore: evalRes.matchScore,
        recommendation: evalRes.recommendation,
        matchLevel: evalRes.matchLevel,
        distanceKm: evalRes.distanceKm,
        breakdown: evalRes.breakdown,
        reasons: evalRes.reasons,
        factors: {
          distance: dist <= 5 ? 'EXCELLENT' : dist <= 15 ? 'GOOD' : 'FAIR',
          quantityCompatibility: 'SUITABLE',
          urgency: expiryHoursRemaining <= 6 ? 'HIGH_PRIORITY' : 'NORMAL'
        }
      };
    }).sort((a, b) => b.score - a.score);

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'Matching recommendations calculated by logistics engine.',
        data: {
          donationId,
          aiAvailable: false,
          matches: fallbackMatches
        }
      })
    );
  }
};

module.exports = {
  createDonation,
  listDonations,
  getDonation,
  updateDonation,
  deleteDonation,
  getDonationMatches,
  calculateLogisticsMatchScore
};
