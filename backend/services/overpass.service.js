const axios = require('axios');
const User = require('../models/User.model');

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

const getNearbyNgosFromOverpass = async (latitude, longitude, radiusMeters = 10000) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const radius = parseInt(radiusMeters, 10) || 10000;

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Valid latitude and longitude are required.');
  }

  const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const query = `
    [out:json][timeout:25];
    (
      node["office"="ngo"](around:${radius},${lat},${lng});
      node["amenity"="social_facility"](around:${radius},${lat},${lng});
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["social_facility"](around:${radius},${lat},${lng});
      node["charity"](around:${radius},${lat},${lng});

      way["office"="ngo"](around:${radius},${lat},${lng});
      way["amenity"="social_facility"](around:${radius},${lat},${lng});
      way["amenity"="community_centre"](around:${radius},${lat},${lng});
      way["social_facility"](around:${radius},${lat},${lng});

      relation["office"="ngo"](around:${radius},${lat},${lng});
      relation["amenity"="social_facility"](around:${radius},${lat},${lng});
      relation["amenity"="community_centre"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  let elements = [];
  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FoodBridge-AI/1.0 (contact@foodbridge.org)'
        },
        timeout: 8000
      }
    );
    elements = response.data?.elements || [];
    console.log('=== RAW OVERPASS API REQUEST ===');
    console.log('URL: https://overpass-api.de/api/interpreter');
    console.log('Overpass Query:', query.trim());
    console.log('RAW JSON Response Elements:', elements.length);
    console.log('Raw Elements Sample:', JSON.stringify(elements.slice(0, 2), null, 2));
  } catch (err) {
    console.warn('Overpass API primary endpoint failed, trying backup...', err.message);
    try {
      const backupResponse = await axios.post(
        'https://overpass.kumi.systems/api/interpreter',
        `data=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'FoodBridge-AI/1.0 (contact@foodbridge.org)'
          },
          timeout: 8000
        }
      );
      elements = backupResponse.data?.elements || [];
      console.log('=== RAW OVERPASS API BACKUP RESPONSE ===');
      console.log('RAW JSON Response Elements:', elements.length);
    } catch (bErr) {
      console.warn('Overpass API backup endpoint failed:', bErr.message);
      elements = [];
    }
  }

  const normalizedOsm = elements
    .map((item) => {
      const tags = item.tags || {};
      const itemLat = item.lat ?? item.center?.lat ?? null;
      const itemLng = item.lon ?? item.center?.lon ?? null;

      // Rule 6: Name strictly from tags.name -> tags.operator -> tags.brand -> tags.official_name -> "Unnamed NGO"
      const name =
        tags.name ||
        tags.operator ||
        tags.brand ||
        tags.official_name ||
        'Unnamed NGO';

      // Rule 9: Address strictly from addr:housenumber, addr:street, addr:city
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city']
      ].filter(Boolean);

      const address = addressParts.length > 0 ? addressParts.join(', ') : 'Not available';

      // Rule 7: Phone strictly from contact:phone -> phone -> "Not available"
      const phone = tags['contact:phone'] || tags.phone || 'Not available';

      // Rule 8: Website strictly from website -> contact:website -> "Not available"
      const website = tags.website || tags['contact:website'] || 'Not available';

      // Rule 10: Coordinates exact as returned
      const distance =
        itemLat && itemLng ? getHaversineDistanceKm(lat, lng, itemLat, itemLng) : null;

      return {
        id: `${item.type}/${item.id}`,
        name,
        latitude: itemLat,
        longitude: itemLng,
        address,
        phone,
        website,
        distance,
        osmType: item.type,
        tags
      };
    })
    .filter((ngo) => ngo.latitude !== null && ngo.longitude !== null);

  // Rule 3: Query verified, active MongoDB NGOs dynamically
  let dbNgos = [];
  try {
    const mongoNgos = await User.find({
      role: 'ngo',
      $or: [
        { isVerified: true },
        { verificationStatus: 'APPROVED' }
      ],
      $or: [
        { isActive: true },
        { status: 'ACTIVE' }
      ]
    }).select('name organizationName address city state phone website latitude longitude isVerified verificationStatus status');

    dbNgos = mongoNgos
      .map((u) => {
        const uLat = Number(u.latitude);
        const uLng = Number(u.longitude);
        if (isNaN(uLat) || isNaN(uLng) || uLat === 0) return null;
        const distance = getHaversineDistanceKm(lat, lng, uLat, uLng);

        const addr = [u.address, u.city, u.state].filter(Boolean).join(', ') || 'Not available';

        return {
          id: `db/${u._id}`,
          name: u.organizationName || u.name,
          latitude: uLat,
          longitude: uLng,
          address: addr,
          phone: u.phone || 'Not available',
          website: u.website || 'Not available',
          distance,
          osmType: 'registered',
          tags: { verified: true }
        };
      })
      .filter(Boolean);
  } catch (dbErr) {
    console.warn('Failed to query DB NGOs:', dbErr.message);
  }

  // Rule 5: Combine real DB NGOs and real OpenStreetMap NGOs. If 0 found, return empty array [].
  const combined = [...dbNgos, ...normalizedOsm];

  // Deduplicate by name
  const uniqueMap = new Map();
  for (const item of combined) {
    const key = (item.name || '').toLowerCase().trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  const result = Array.from(uniqueMap.values());
  result.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

  console.log('=== FINAL TRANSFORMED NGO JSON ===');
  console.log(`Total Count: ${result.length}`);
  console.log(JSON.stringify(result.slice(0, 3), null, 2));

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
};

module.exports = {
  getNearbyNgosFromOverpass
};
