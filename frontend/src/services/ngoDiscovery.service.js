import { getNearbyNGOs } from './ngoLocation.service';
import { searchPlacesNGOs } from './places.service';

/**
 * Haversine distance calculator in kilometers
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Checks if a Google Place is a duplicate of a FoodBridge NGO
 */
const isDuplicate = (place, foodBridgeNgos) => {
  if (!place.latitude || !place.longitude || !foodBridgeNgos?.length) return false;
  const pName = (place.name || '').toLowerCase().trim();

  for (const fb of foodBridgeNgos) {
    const fbLat = fb.latitude ?? fb.lat;
    const fbLng = fb.longitude ?? fb.lng;
    if (fbLat == null || fbLng == null) continue;

    const distKm = calculateDistanceKm(place.latitude, place.longitude, fbLat, fbLng);
    if (distKm !== null && distKm < 0.1) {
      // Within 100 meters
      const fbName = (fb.organizationName || fb.name || '').toLowerCase().trim();
      if (
        fbName &&
        pName &&
        (fbName.includes(pName) || pName.includes(fbName) || fbName === pName)
      ) {
        return true;
      }
      if (distKm < 0.05) return true; // Within 50 meters
    }
  }
  return false;
};

/**
 * Unified NGO Discovery Service
 * Uses Promise.allSettled to guarantee that a failure in one provider
 * (e.g. Google Places or MongoDB API) never destroys valid results from the other.
 */
export const discoverNearbyNGOs = async ({ location, radiusMeters = 10000, signal = null }) => {
  if (
    !location ||
    typeof location.lat !== 'number' ||
    typeof location.lng !== 'number' ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lng)
  ) {
    return {
      ngos: [],
      foodBridgeCount: 0,
      placesCount: 0,
      status: 'LOCATION_REQUIRED',
      emptyMessage: 'Enable location access to find NGOs near you.',
      error: null
    };
  }

  const radiusKm = radiusMeters / 1000;

  // Execute independent parallel requests via Promise.allSettled
  const [mongoResult, placesResult] = await Promise.allSettled([
    getNearbyNGOs(location.lat, location.lng, radiusMeters, signal),
    searchPlacesNGOs(location, radiusMeters)
  ]);

  let foodBridgeNGOs = [];
  let mongoError = null;

  if (mongoResult.status === 'fulfilled') {
    foodBridgeNGOs = mongoResult.value || [];
  } else {
    mongoError = mongoResult.reason?.message || 'MongoDB NGO query failed';
    console.warn('[FoodBridge NGO Discovery] MongoDB error:', mongoError);
  }

  let placesNGOs = [];
  let placesError = null;

  if (placesResult.status === 'fulfilled') {
    const pData = placesResult.value;
    const rawPlaces = pData.places || [];
    if (pData.error) {
      placesError = pData.error;
    }
    // Filter places within radius and compute distance
    placesNGOs = rawPlaces
      .map((p) => {
        const dist = calculateDistanceKm(location.lat, location.lng, p.latitude, p.longitude);
        return {
          ...p,
          distanceKm: dist
        };
      })
      .filter((p) => p.distanceKm != null && p.distanceKm <= radiusKm);
  } else {
    placesError = placesResult.reason?.message || 'Places search failed';
    console.warn('[FoodBridge NGO Discovery] Places error:', placesError);
  }

  // Deduplicate Places against verified FoodBridge NGOs
  const deduplicatedPlaces = placesNGOs.filter((p) => !isDuplicate(p, foodBridgeNGOs));

  // Combine into single source of truth array
  const combined = [...foodBridgeNGOs, ...deduplicatedPlaces];

  // Sort by distance ascending
  combined.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

  // Determine overall status
  const bothFailed = mongoResult.status === 'rejected' && placesResult.status === 'rejected';
  let overallError = null;

  if (bothFailed) {
    overallError = 'Nearby NGO service temporarily unavailable.';
  }

  let emptyMessage = null;
  if (!overallError && combined.length === 0) {
    emptyMessage = 'No nearby NGOs found within this radius.';
  }

  if (import.meta.env.DEV) {
    console.info('[FoodBridge NGO Discovery]', {
      location: `${location.lat}, ${location.lng}`,
      radiusMeters,
      mongoCount: foodBridgeNGOs.length,
      placesCount: deduplicatedPlaces.length,
      totalCount: combined.length,
      mongoError,
      placesError,
      overallError
    });
  }

  return {
    ngos: combined,
    foodBridgeCount: foodBridgeNGOs.length,
    placesCount: deduplicatedPlaces.length,
    totalCount: combined.length,
    error: overallError,
    emptyMessage,
    placesError,
    mongoError
  };
};

export default {
  discoverNearbyNGOs,
  calculateDistanceKm
};
