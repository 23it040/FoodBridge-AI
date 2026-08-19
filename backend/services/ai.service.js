const axios = require('axios');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');
const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');
const { AIPredictionLog } = require('../models/AIPredictionLog.model');

// In-memory cache for OpenStreetMap Overpass responses (10 minutes TTL)
const osmCache = new Map();
const OSM_CACHE_TTL_MS = 10 * 60 * 1000;

const logTelemetry = async ({ modelName, modelVersion = '1.0.0', status, error = null, latencyMs = 0, inputAvailability = {} }) => {
  try {
    await AIPredictionLog.create({
      modelName,
      modelVersion,
      status,
      error,
      latencyMs,
      inputAvailability,
      timestamp: new Date()
    });
  } catch (err) {
    console.error(`[aiService] Error logging telemetry for ${modelName}:`, err.message);
  }
};

const createClient = () => {
  const baseURL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  const token = process.env.AI_SERVICE_TOKEN;
  const timeout = parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 7000;

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.create({
    baseURL,
    timeout,
    headers
  });
};

const normalizeValue = (source, keys) => {
  if (!source) return undefined;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }
  return undefined;
};

const validateCoordinates = (lat, lng) => {
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    return false;
  }
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || numLat < -90 || numLat > 90) return false;
  if (isNaN(numLng) || numLng < -180 || numLng > 180) return false;
  return true;
};

const fetchOSMNgos = async (lat, lng, radiusMeters = 15000) => {
  if (!validateCoordinates(lat, lng)) return { ngos: [], warning: null };

  const cacheKey = `${Number(lat).toFixed(3)}_${Number(lng).toFixed(3)}_${radiusMeters}`;
  const cached = osmCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return { ngos: cached.ngos, warning: null };
  }

  const query = `[out:json][timeout:5];
(
  node["amenity"="social_facility"](around:${radiusMeters},${lat},${lng});
  node["social_facility"="food_bank"](around:${radiusMeters},${lat},${lng});
  node["community_centre"="yes"](around:${radiusMeters},${lat},${lng});
);
out body 15;`;

  try {
    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'FoodBridge-AI/1.0 (contact@foodbridge.org)'
      },
      timeout: 4000
    });

    const elements = response.data?.elements || [];
    const osmNgos = elements
      .filter((el) => el.lat && el.lon)
      .map((el) => {
        const name = el.tags?.name || el.tags?.['name:en'] || 'Community Food Relief (OSM)';
        return {
          ngoId: `osm_${el.id}`,
          ngoName: name,
          location: { latitude: el.lat, longitude: el.lon },
          capacity: null,
          previous_collections: 0,
          preferred_categories: [],
          active: true,
          pending_requests: 0,
          source: 'osm'
        };
      });

    osmCache.set(cacheKey, { ngos: osmNgos, expiry: Date.now() + OSM_CACHE_TTL_MS });
    return { ngos: osmNgos, warning: null };
  } catch (error) {
    return {
      ngos: [],
      warning: 'External nearby NGO data is temporarily unavailable'
    };
  }
};

const getMongoNgos = async (foodCategory = null) => {
  try {
    const ngoUsers = await User.find({
      role: 'ngo',
      $or: [
        { isVerified: true },
        { verificationStatus: 'APPROVED' }
      ],
      $or: [
        { isActive: true },
        { status: 'ACTIVE' }
      ]
    }).select('_id name organizationName city latitude longitude isVerified verificationStatus status capacity preferredCategories').lean();

    if (!ngoUsers || ngoUsers.length === 0) return [];

    const ngoIds = ngoUsers.map((u) => u._id);

    const pendingAgg = await FoodRequest.aggregate([
      { $match: { requestedBy: { $in: ngoIds }, status: 'PENDING' } },
      { $group: { _id: '$requestedBy', count: { $sum: 1 } } }
    ]);
    const pendingMap = new Map(pendingAgg.map((item) => [item._id.toString(), item.count]));

    const completedAgg = await FoodRequest.aggregate([
      { $match: { requestedBy: { $in: ngoIds }, status: 'COMPLETED' } },
      { $group: { _id: '$requestedBy', count: { $sum: 1 } } }
    ]);
    const completedMap = new Map(completedAgg.map((item) => [item._id.toString(), item.count]));

    let categoryDemandMap = new Map();
    if (foodCategory) {
      const catAgg = await FoodRequest.aggregate([
        {
          $match: {
            requestedBy: { $in: ngoIds },
            foodCategory: { $regex: new RegExp(foodCategory, 'i') }
          }
        },
        {
          $group: {
            _id: '$requestedBy',
            requestCount: { $sum: 1 },
            requestedQuantity: { $sum: '$quantity' }
          }
        }
      ]);
      categoryDemandMap = new Map(catAgg.map((item) => [item._id.toString(), { requestCount: item.requestCount, requestedQuantity: item.requestedQuantity }]));
    }

    const result = [];
    for (const ngo of ngoUsers) {
      if (!validateCoordinates(ngo.latitude, ngo.longitude)) continue;

      const idStr = ngo._id.toString();
      const pendingCount = pendingMap.get(idStr) || 0;
      const completedCount = completedMap.get(idStr) || 0;
      const catDemand = categoryDemandMap.get(idStr) || null;

      result.push({
        ngoId: idStr,
        ngoName: ngo.organizationName || ngo.name,
        location: { latitude: Number(ngo.latitude), longitude: Number(ngo.longitude) },
        capacity: ngo.capacity || null,
        previous_collections: completedCount,
        preferred_categories: ngo.preferredCategories || [],
        active: true,
        pending_requests: pendingCount,
        verified: true,
        source: 'mongodb',
        historicalDemand: catDemand ? { category: foodCategory, requestCount: catDemand.requestCount, requestedQuantity: catDemand.requestedQuantity } : null
      });
    }

    return result;
  } catch (err) {
    console.error('[aiService] Error in getMongoNgos:', err.message);
    return [];
  }
};

const buildRecommendPayload = async (body) => {
  let donationObj = body.donation;
  let donationId = body.donationId;

  if (!donationObj && donationId) {
    try {
      const found = await FoodDonation.findById(donationId);
      if (found) donationObj = found.toObject();
    } catch (e) {
      // ignore
    }
  }

  if (!donationObj) donationObj = body;

  const lat = normalizeValue(donationObj, ['latitude']) ?? donationObj.location?.latitude ?? body.latitude;
  const lng = normalizeValue(donationObj, ['longitude']) ?? donationObj.location?.longitude ?? body.longitude;

  if (!validateCoordinates(lat, lng)) {
    return {
      insufficientData: true,
      message: 'Valid donation latitude and longitude coordinates are required.',
      payload: null
    };
  }

  const formattedDonation = {
    location: { latitude: Number(lat), longitude: Number(lng) },
    quantity: normalizeValue(donationObj, ['quantity']),
    food_category: normalizeValue(donationObj, ['food_category', 'foodCategory', 'category']),
    expiry_time: normalizeValue(donationObj, ['expiry_time', 'expiryTime']),
    meal_type: normalizeValue(donationObj, ['meal_type', 'mealType']),
    donation_time: normalizeValue(donationObj, ['donation_time', 'donationTime', 'cookedTime', 'createdAt'])
  };

  let mergedNgos = [];
  let osmWarning = null;

  if (Array.isArray(body.ngos) && body.ngos.length > 0) {
    mergedNgos = body.ngos.map((n) => ({
      ...n,
      source: n.source || 'mongodb'
    }));
  } else {
    const mongoNgos = await getMongoNgos(formattedDonation.food_category);
    const osmResult = await fetchOSMNgos(formattedDonation.location.latitude, formattedDonation.location.longitude);

    osmWarning = osmResult.warning;

    const ngoMap = new Map();
    for (const ngo of [...mongoNgos, ...osmResult.ngos]) {
      const key = `${ngo.ngoName.toLowerCase().trim()}_${Number(ngo.location.latitude).toFixed(3)}`;
      if (!ngoMap.has(key)) {
        ngoMap.set(key, ngo);
      }
    }
    mergedNgos = Array.from(ngoMap.values());
  }

  return {
    insufficientData: false,
    payload: {
      donation: formattedDonation,
      ngos: mergedNgos,
      top_k: normalizeValue(body, ['top_k', 'topK']) || 10
    },
    warning: osmWarning
  };
};

const buildRiskPayload = async (body) => {
  let donation = body.donation || body;
  if (!donation && body.donationId) {
    try {
      const found = await FoodDonation.findById(body.donationId);
      if (found) donation = found.toObject();
    } catch (e) {
      // ignore
    }
  }

  return {
    food_category: normalizeValue(donation, ['food_category', 'foodCategory', 'category']),
    ph: normalizeValue(donation, ['ph', 'pH']),
    temperature: normalizeValue(donation, ['temperature', 'temperature_c', 'temperatureC']),
    taste: normalizeValue(donation, ['taste']),
    odor: normalizeValue(donation, ['odor']),
    fat: normalizeValue(donation, ['fat']),
    turbidity: normalizeValue(donation, ['turbidity']),
    color: normalizeValue(donation, ['color', 'colour'])
  };
};

const buildPriorityPayload = async (body) => {
  let donation = body.donation || body;
  if (!donation && body.donationId) {
    try {
      const found = await FoodDonation.findById(body.donationId);
      if (found) donation = found.toObject();
    } catch (e) {
      // ignore
    }
  }

  return {
    food_category: normalizeValue(donation, ['food_category', 'foodCategory', 'category']),
    quantity: normalizeValue(donation, ['quantity']),
    expiry_time: normalizeValue(donation, ['expiry_time', 'expiryTime']),
    distance_km: normalizeValue(donation, ['distance_km', 'distanceKm', 'distance']),
    created_at: normalizeValue(donation, ['created_at', 'createdAt'])
  };
};

const buildDemandPayload = async (body) => {
  let prevVal = normalizeValue(body, ['previous_donations', 'previousDonations', 'historical_demand', 'historicalDemand']);

  if (prevVal === undefined || prevVal === null) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const reqCount = await FoodRequest.countDocuments({
        status: { $in: ['ACCEPTED', 'COMPLETED', 'PICKED_UP', 'PENDING'] },
        createdAt: { $gte: thirtyDaysAgo }
      });
      if (reqCount > 0) {
        prevVal = reqCount;
      }
    } catch (e) {
      // MongoDB query optional
    }
  }

  return {
    food_category: normalizeValue(body, ['food_category', 'foodCategory', 'category']),
    center_type: normalizeValue(body, ['center_type', 'centerType']),
    op_area: normalizeValue(body, ['op_area', 'opArea']),
    previous_donations: prevVal,
    week: normalizeValue(body, ['week']),
    day_of_week: normalizeValue(body, ['day_of_week', 'dayOfWeek']),
    city: normalizeValue(body, ['city', 'location']),
    season: normalizeValue(body, ['season'])
  };
};

const buildOptimizeRoutePayload = (body) => {
  const startLoc = body.start || body.location;
  if (!startLoc || !validateCoordinates(startLoc.latitude, startLoc.longitude)) {
    return {
      insufficientData: true,
      message: 'Valid starting latitude and longitude coordinates are required for route optimization.'
    };
  }

  const rawDonations = Array.isArray(body.donations) && body.donations.length > 0 ? body.donations : [];
  const points = [];

  for (const d of rawDonations) {
    const lat = d.latitude || d.location?.latitude;
    const lng = d.longitude || d.location?.longitude;
    if (validateCoordinates(lat, lng)) {
      points.push({
        id: String(d._id || d.id),
        name: d.foodName || d.name || 'Pickup Stop',
        address: d.pickupAddress || d.address || 'Pickup Location',
        location: { latitude: Number(lat), longitude: Number(lng) }
      });
    }
  }

  if (points.length === 0) {
    return {
      insufficientData: true,
      message: 'Valid pickup location coordinates are required for route optimization.'
    };
  }

  return {
    insufficientData: false,
    start: { latitude: Number(startLoc.latitude), longitude: Number(startLoc.longitude) },
    donations: points,
    avg_speed_kmph: normalizeValue(body, ['avg_speed_kmph', 'avgSpeedKmph']),
    originalPoints: points
  };
};

const handleAxiosError = (error) => {
  if (error.response) {
    const rawDetail = error.response.data?.detail;
    if (error.response.status === 503 || (rawDetail && rawDetail.code === 'MODEL_UNAVAILABLE')) {
      return new ApiError(503, 'MODEL_UNAVAILABLE: AI microservice model is currently unavailable.');
    }
    const message = typeof rawDetail === 'object' ? JSON.stringify(rawDetail) : (rawDetail || error.response.data?.message || 'AI service error');
    return new ApiError(error.response.status || 502, `AI service error: ${message}`);
  }

  if (error.request) {
    return new ApiError(503, 'MODEL_UNAVAILABLE: AI service did not respond.');
  }

  return new ApiError(502, `AI service request failed: ${error.message}`);
};

const requestPrediction = async (path, payload) => {
  try {
    const client = createClient();
    const response = await client.post(path, payload);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

const recommend = async (body) => {
  const startTime = Date.now();
  const prep = await buildRecommendPayload(body);
  if (prep.insufficientData) {
    await logTelemetry({
      modelName: 'recommendation',
      status: 'INSUFFICIENT_DATA',
      latencyMs: Date.now() - startTime,
      inputAvailability: { donationCoordinates: false }
    });
    return {
      recommendations: [],
      insufficientData: true,
      message: prep.message,
      dataSource: { mongodb: true, osm: false, synthetic: false, googleMaps: false }
    };
  }

  try {
    const result = await requestPrediction('/recommend', prep.payload);
    if (prep.warning) result.warning = prep.warning;
    await logTelemetry({
      modelName: 'recommendation',
      status: 'SUCCESS',
      latencyMs: Date.now() - startTime
    });
    return result;
  } catch (err) {
    await logTelemetry({
      modelName: 'recommendation',
      status: 'ERROR',
      error: err.message,
      latencyMs: Date.now() - startTime
    });
    throw err;
  }
};

const riskScore = async (body) => {
  const startTime = Date.now();
  const payload = await buildRiskPayload(body);
  try {
    const res = await requestPrediction('/risk-score', payload);
    const status = res.insufficientData ? 'INSUFFICIENT_DATA' : 'SUCCESS';
    await logTelemetry({
      modelName: 'risk',
      status,
      latencyMs: Date.now() - startTime
    });
    return res;
  } catch (err) {
    await logTelemetry({
      modelName: 'risk',
      status: 'ERROR',
      error: err.message,
      latencyMs: Date.now() - startTime
    });
    throw err;
  }
};

const priorityScore = async (body) => {
  const startTime = Date.now();
  const payload = await buildPriorityPayload(body);
  try {
    const res = await requestPrediction('/priority-score', payload);
    const status = res.insufficientData ? 'INSUFFICIENT_DATA' : 'SUCCESS';
    await logTelemetry({
      modelName: 'priority',
      status,
      latencyMs: Date.now() - startTime
    });
    return res;
  } catch (err) {
    await logTelemetry({
      modelName: 'priority',
      status: 'ERROR',
      error: err.message,
      latencyMs: Date.now() - startTime
    });
    throw err;
  }
};

const predictDemand = async (body) => {
  const startTime = Date.now();
  const payload = await buildDemandPayload(body);
  try {
    const res = await requestPrediction('/predict-demand', payload);
    await logTelemetry({
      modelName: 'demand',
      status: 'SUCCESS',
      latencyMs: Date.now() - startTime
    });
    return res;
  } catch (err) {
    await logTelemetry({
      modelName: 'demand',
      status: 'ERROR',
      error: err.message,
      latencyMs: Date.now() - startTime
    });
    throw err;
  }
};

const optimizeRoute = async (body) => {
  const startTime = Date.now();
  const prep = buildOptimizeRoutePayload(body);
  if (prep.insufficientData) {
    await logTelemetry({
      modelName: 'route',
      status: 'INSUFFICIENT_DATA',
      latencyMs: Date.now() - startTime,
      inputAvailability: { startCoordinates: false }
    });
    return {
      sequence: [],
      total_distance_km: null,
      estimated_time_minutes: null,
      insufficientData: true,
      message: prep.message,
      dataSource: { mongodb: true, osm: false, synthetic: false, googleMaps: false }
    };
  }

  const payload = { start: prep.start, donations: prep.donations, avg_speed_kmph: prep.avg_speed_kmph };
  try {
    const res = await requestPrediction('/optimize-route', payload);
    const seq = res.sequence || [];
    const stops = seq.map((id, index) => {
      const matched = prep.originalPoints.find((p) => p.id === id);
      return {
        stopNumber: index + 1,
        id,
        name: matched?.name || `Stop #${index + 1}`,
        address: matched?.address || 'Location',
        lat: matched?.location?.latitude,
        lng: matched?.location?.longitude
      };
    });

    await logTelemetry({
      modelName: 'route',
      status: 'SUCCESS',
      latencyMs: Date.now() - startTime
    });

    return {
      ...res,
      stops
    };
  } catch (err) {
    await logTelemetry({
      modelName: 'route',
      status: 'ERROR',
      error: err.message,
      latencyMs: Date.now() - startTime
    });
    throw err;
  }
};

module.exports = {
  recommend,
  riskScore,
  priorityScore,
  predictDemand,
  optimizeRoute
};
