import api from './api';

/**
 * Shared NGO Location Discovery Service
 * Fetches verified FoodBridge NGOs strictly from MongoDB via backend geospatial API.
 * Never substitutes hardcoded coordinates.
 */
export const getNearbyNGOs = async (latitude, longitude, radiusMeters = 10000, signal = null) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radius = Number(radiusMeters) || 10000;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (lat === 0 && lng === 0)
  ) {
    throw new Error('Valid latitude and longitude are required for nearby NGO discovery.');
  }

  const response = await api.get('/api/ngos/nearby', {
    params: {
      latitude: lat,
      longitude: lng,
      radius
    },
    signal: signal || undefined
  });

  const rawList = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

  return rawList.map((ngo) => {
    const ngoLat = Number(ngo.latitude ?? ngo.lat);
    const ngoLng = Number(ngo.longitude ?? ngo.lng);
    return {
      id: ngo.id || ngo._id,
      _id: ngo._id || ngo.id,
      name: ngo.organizationName || ngo.name || 'Verified FoodBridge NGO',
      organizationName: ngo.organizationName || ngo.name || 'Verified FoodBridge NGO',
      address: ngo.address || (ngo.city ? `${ngo.city}, ${ngo.state || ''}` : 'Gujarat, India'),
      city: ngo.city || '',
      state: ngo.state || '',
      pincode: ngo.pincode || '',
      phone: ngo.phone || '',
      latitude: ngoLat,
      longitude: ngoLng,
      lat: ngoLat,
      lng: ngoLng,
      capacity: ngo.capacity,
      foodTypesAccepted: Array.isArray(ngo.foodTypesAccepted) ? ngo.foodTypesAccepted : ['cooked', 'packaged'],
      distanceKm: ngo.distanceKm != null ? Number(ngo.distanceKm) : null,
      source: 'foodbridge',
      isVerified: true
    };
  });
};

export default {
  getNearbyNGOs
};
