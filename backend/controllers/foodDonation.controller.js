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

function calculateLogisticsMatchScore({ distanceKm, donationQty, ngoCap, foodCategory, expiryHours, capacityMatch, categoryMatch, currentWorkload }) {
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
  if (capacityMatch === false) capPts = 20;

  let catPts = 90;
  if (categoryMatch === true) catPts = 100;
  else if (categoryMatch === false) catPts = 20;

  let workloadPts = 100;
  if (currentWorkload > 20) workloadPts = 20;
  else if (currentWorkload > 10) workloadPts = 50;
  else if (currentWorkload > 5) workloadPts = 75;

  let verifPts = 100;

  const baseScore = (capPts * 0.35) + (distPts * 0.30) + (catPts * 0.20) + (workloadPts * 0.10) + (verifPts * 0.05);

  let finalScore = baseScore;
  if (capacityMatch === false) {
    finalScore = Math.min(finalScore, 25);
  }
  if (categoryMatch === false) {
    finalScore = Math.min(finalScore, 20);
  }

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
  if (capacityMatch === false) reasons.push(`✕ Insufficient capacity`);
  if (categoryMatch === false) reasons.push(`✕ Incompatible food category`);

  return {
    score: roundedScore,
    matchScore: roundedScore,
    recommendation,
    matchLevel: recommendation,
    distanceKm: Math.round(distanceKm * 10) / 10,
    breakdown: {
      capacity: Math.round(capPts),
      distance: Math.round(distPts),
      category: Math.round(catPts),
      workload: Math.round(workloadPts),
      verification: Math.round(verifPts)
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
  }).select('_id name organizationName city latitude longitude phone address email capacity foodTypesAccepted');

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

  const donLat = donation.latitude;
  const donLon = donation.longitude;
  if (!donLat || !donLon) {
    return res.status(200).json(
      new ApiResponse({
        success: false,
        statusCode: 200,
        message: 'Donation location is required for NGO matching',
        data: {
          donationId,
          reason: 'LOCATION_REQUIRED',
          aiAvailable: false,
          donation: { id: donationId, quantity: donation.quantity, category: donation.category, unit: donation.unit },
          recommendations: [],
          nearbyUnverified: []
        }
      })
    );
  }

  const FoodRequest = require('../models/FoodRequest.model');
  const activeWorkloads = await FoodRequest.aggregate([
    {
      $match: {
        ngoId: { $in: eligibleNgos.map(n => n._id) },
        status: { $in: ['PENDING', 'ACCEPTED', 'PICKED_UP'] }
      }
    },
    {
      $group: {
        _id: '$ngoId',
        activeCount: { $sum: 1 }
      }
    }
  ]);
  const workloadMap = {};
  activeWorkloads.forEach(w => { workloadMap[w._id.toString()] = w.activeCount; });

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

  const donationMeta = {
    id: donationId,
    quantity: donation.quantity || 1,
    category: donation.category || 'General',
    unit: donation.unit || 'servings',
    latitude: donLat,
    longitude: donLon
  };

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
      
      const ngoCapacity = dbNgo?.capacity || null;
      const currentWorkload = dbNgo ? (workloadMap[dbNgo._id.toString()] || 0) : 0;
      const availableCapacity = ngoCapacity != null ? Math.max(0, ngoCapacity - currentWorkload) : null;
      const capacityMatch = availableCapacity != null ? (availableCapacity >= (donation.quantity || 1)) : null;

      const ngoFoodTypes = dbNgo && Array.isArray(dbNgo.foodTypesAccepted) && dbNgo.foodTypesAccepted.length > 0 ? dbNgo.foodTypesAccepted : null;
      const donationCat = (donation.category || '').toLowerCase().trim();
      let categoryMatch = null;
      if (ngoFoodTypes && donationCat) {
        categoryMatch = ngoFoodTypes.some(t => {
          const tLower = t.toLowerCase().trim();
          return donationCat.includes(tLower) || tLower.includes(donationCat) || (donationCat.includes('cook') && tLower.includes('cook')) || (donationCat.includes('package') && tLower.includes('package'));
        });
      }

      return {
        ...m,
        city: dbNgo?.city || 'Local Region',
        phone: dbNgo?.phone || null,
        email: dbNgo?.email || null,
        latitude: dbNgo?.latitude,
        longitude: dbNgo?.longitude,
        capacity: ngoCapacity,
        currentWorkload,
        availableCapacity,
        capacityMatch,
        categoryMatch,
        foodTypesAccepted: ngoFoodTypes || [],
        source: 'FOODBRIDGE',
        verified: true
      };
    }).sort((a, b) => (b.score || b.matchScore || 0) - (a.score || a.matchScore || 0));

    const recommendations = enrichedMatches.filter(m => m.capacityMatch !== false && m.categoryMatch !== false);

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'NGO matches calculated successfully via ML model',
        data: {
          donationId,
          aiAvailable: true,
          donation: donationMeta,
          recommendations,
          nearbyUnverified: [],
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

      const ngoCapacity = ngo.capacity || null;
      const currentWorkload = workloadMap[ngo._id.toString()] || 0;
      const availableCapacity = ngoCapacity != null ? Math.max(0, ngoCapacity - currentWorkload) : null;
      const capacityMatch = availableCapacity != null ? (availableCapacity >= (donation.quantity || 1)) : null;

      const ngoFoodTypes = Array.isArray(ngo.foodTypesAccepted) && ngo.foodTypesAccepted.length > 0 ? ngo.foodTypesAccepted : null;
      const donationCat = (donation.category || '').toLowerCase().trim();
      let categoryMatch = null;
      if (ngoFoodTypes && donationCat) {
        categoryMatch = ngoFoodTypes.some(t => {
          const tLower = t.toLowerCase().trim();
          return donationCat.includes(tLower) || tLower.includes(donationCat) || (donationCat.includes('cook') && tLower.includes('cook')) || (donationCat.includes('package') && tLower.includes('package'));
        });
      }

      const evalRes = calculateLogisticsMatchScore({
        distanceKm: dist,
        donationQty: donation.quantity || 1,
        ngoCap: ngo.capacity || 100,
        foodCategory: donation.category || 'cooked_meals',
        expiryHours: expiryHoursRemaining,
        capacityMatch,
        categoryMatch,
        currentWorkload
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
        },
        capacity: ngoCapacity,
        currentWorkload,
        availableCapacity,
        capacityMatch,
        categoryMatch,
        foodTypesAccepted: ngoFoodTypes || [],
        source: 'FOODBRIDGE',
        verified: true
      };
    }).sort((a, b) => b.score - a.score);

    const recommendations = fallbackMatches.filter(m => m.capacityMatch !== false && m.categoryMatch !== false);

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'Matching recommendations calculated by logistics engine.',
        data: {
          donationId,
          aiAvailable: false,
          donation: donationMeta,
          recommendations,
          nearbyUnverified: [],
          matches: fallbackMatches
        }
      })
    );
  }
};

const getDonationSpoilageRisk = async (req, res) => {
  const axios = require('axios');
  const FoodDonation = require('../models/FoodDonation.model');
  const mongoose = require('mongoose');

  const donationId = req.params.id;

  if (!donationId || !mongoose.Types.ObjectId.isValid(donationId)) {
    throw new ApiError(400, 'Invalid food donation ID format');
  }

  const donation = await FoodDonation.findById(donationId);
  if (!donation) {
    throw new ApiError(404, 'Food donation listing not found');
  }

  // Authorization check: Donor, Admin, or verified NGO
  const user = req.user;
  const userRole = user && user.role ? String(user.role).toLowerCase() : '';
  const isDonor = user && donation.donorId && donation.donorId.toString() === user._id.toString();
  const isAdmin = userRole === 'admin';
  const isNGO = userRole === 'ngo' || userRole === 'partner';

  if (!isDonor && !isAdmin && !isNGO) {
    throw new ApiError(403, 'Access denied: You do not have permission to view spoilage risk for this donation');
  }

  // Calculate real time-dependent features
  const now = new Date();
  const expiry = donation.expiryTime ? new Date(donation.expiryTime) : new Date(now.getTime() + 24 * 3600 * 1000);
  const cooked = donation.cookedTime ? new Date(donation.cookedTime) : null;

  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 3600);
  const hoursSinceCooked = cooked ? Math.max(0, (now.getTime() - cooked.getTime()) / (1000 * 3600)) : null;
  const isExpired = donation.status === 'EXPIRED' || hoursUntilExpiry <= 0 || now.getTime() >= expiry.getTime();

  // Storage and packaging parameters
  const storageCondition = req.body?.storageCondition || req.query?.storageCondition || 'pantry';
  const storageTemperatureC =
    req.body?.storageTemperatureC != null
      ? Number(req.body.storageTemperatureC)
      : storageCondition === 'frozen'
        ? -18.0
        : storageCondition === 'refrigerated'
          ? 4.0
          : 22.0;

  const isOpened =
    req.body?.isOpened != null
      ? Number(req.body.isOpened)
      : (String(donation.category || '').toLowerCase().includes('cook') || String(donation.category || '').toLowerCase().includes('meal'))
        ? 1
        : 0;

  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

  const aiPayload = {
    foodId: donation._id.toString(),
    foodName: donation.foodName || 'Donation Item',
    category: donation.category || 'cooked_meals',
    storageCondition,
    storageTemperatureC,
    isOpened,
    hoursUntilExpiry: Math.round(hoursUntilExpiry * 10) / 10
  };

  try {
    const aiResponse = await axios.post(
      `${aiServiceUrl}/predict/spoilage-risk`,
      aiPayload,
      { timeout: 5000 }
    );

    const aiData = aiResponse.data;

    if (!aiData || typeof aiData !== 'object' || aiData.spoilageRisk === undefined) {
      throw new Error('Malformed AI service response: missing spoilageRisk field');
    }

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'Food spoilage risk evaluated successfully via ML model',
        data: {
          donationId: donation._id.toString(),
          foodName: donation.foodName,
          category: donation.category,
          hoursUntilExpiry: Math.round(hoursUntilExpiry * 10) / 10,
          hoursSinceCooked: hoursSinceCooked !== null ? Math.round(hoursSinceCooked * 10) / 10 : null,
          isExpired,
          aiAvailable: true,
          fallback: false,
          spoilageRisk: aiData.spoilageRisk,
          riskLevel: aiData.riskLevel || (aiData.spoilageRisk === 1 ? 'High' : 'Low'),
          highSpoilageRisk: Boolean(aiData.highSpoilageRisk ?? aiData.spoilageRisk === 1),
          riskScore: aiData.riskScore != null ? aiData.riskScore : (aiData.spoilageRisk === 1 ? 85.0 : 15.0),
          confidence: aiData.confidence || 0.85,
          probabilities: aiData.probabilities || {
            lowRisk: aiData.spoilageRisk === 1 ? 0.15 : 0.85,
            highRisk: aiData.spoilageRisk === 1 ? 0.85 : 0.15
          },
          featuresUsed: aiData.featuresUsed || aiPayload,
          recommendation: aiData.recommendation || (aiData.spoilageRisk === 1 ? 'High Spoilage Risk: Priority redistribution recommended within 24-48 hours.' : 'Low Spoilage Risk: Stable for standard distribution window.'),
          model: aiData.model || 'FoodBridge AI - Food Spoilage Risk Classifier v1.0.0'
        }
      })
    );
  } catch (err) {
    console.warn(`[AI Service Warning] Spoilage risk model call failed: ${err.message}. Using safety heuristic fallback.`);

    const catLower = String(donation.category || '').toLowerCase();
    const isPerishable =
      catLower.includes('cook') ||
      catLower.includes('meal') ||
      catLower.includes('dairy') ||
      catLower.includes('meat') ||
      catLower.includes('fish') ||
      catLower.includes('poultry') ||
      catLower.includes('produce');

    const isHighRisk =
      isExpired ||
      hoursUntilExpiry <= 6.0 ||
      (isPerishable && hoursUntilExpiry <= 12.0) ||
      (isPerishable && storageCondition === 'pantry');

    const fallbackScore = isExpired ? 100.0 : (isHighRisk ? 88.0 : 15.0);

    return res.status(200).json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'Spoilage risk evaluated using safety heuristic fallback (AI service offline or unavailable)',
        data: {
          donationId: donation._id.toString(),
          foodName: donation.foodName,
          category: donation.category,
          hoursUntilExpiry: Math.round(hoursUntilExpiry * 10) / 10,
          hoursSinceCooked: hoursSinceCooked !== null ? Math.round(hoursSinceCooked * 10) / 10 : null,
          isExpired,
          aiAvailable: false,
          fallback: true,
          spoilageRisk: isHighRisk ? 1 : 0,
          riskLevel: isExpired ? 'Critical' : (isHighRisk ? 'High' : 'Low'),
          highSpoilageRisk: isHighRisk,
          riskScore: fallbackScore,
          confidence: 0.8,
          probabilities: {
            lowRisk: isHighRisk ? 0.12 : 0.88,
            highRisk: isHighRisk ? 0.88 : 0.12
          },
          featuresUsed: aiPayload,
          recommendation: isExpired
            ? 'Donation expired. Unsafe for human consumption.'
            : isHighRisk
              ? 'High Spoilage Risk: Priority redistribution recommended within 24-48 hours.'
              : 'Low Spoilage Risk: Stable for standard distribution window.',
          fallbackReason: err.message
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
  getDonationSpoilageRisk,
  calculateLogisticsMatchScore
};
