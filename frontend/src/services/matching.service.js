import api from './api';
import { discoverNearbyNGOs, calculateDistanceKm } from './ngoDiscovery.service';

class MatchingService {
  // Keep existing method
  async getDonationMatches(donationId) {
    const response = await api.get(`/api/food/${donationId}/matches`);
    return response.data;
  }

  // New enhanced method
  async getEnhancedDonationMatches(donationId, donationLocation) {
    // 1. Fetch backend matches (FoodBridge verified NGOs)
    let backendResult = null;
    let backendError = null;
    try {
      const response = await api.get(`/api/food/${donationId}/matches`);
      backendResult = response.data?.data || response.data || {};
    } catch (err) {
      backendError = err.message || 'Backend matching failed';
      console.warn('[MatchingService] Backend match error:', backendError);
    }

    // 2. Fetch Google Places nearby NGOs (only if donation has location)
    let placesNgos = [];
    let placesError = null;
    if (donationLocation && donationLocation.lat && donationLocation.lng) {
      try {
        const discovery = await discoverNearbyNGOs({
          location: donationLocation,
          radiusMeters: 15000
        });
        // Only take Google Places NGOs (not FoodBridge ones — those come from backend)
        placesNgos = (discovery.ngos || []).filter(n => 
          n.source === 'google_places' || !n.isVerified
        ).map(n => ({
          ...n,
          id: n.id || n._id,
          name: n.name || n.organizationName || 'Non-Profit Organization',
          source: 'GOOGLE_PLACES',
          verified: false,
          capacityMatch: 'unknown',
          categoryMatch: 'unknown',
          distanceKm: n.distanceKm || (
            donationLocation ? calculateDistanceKm(
              donationLocation.lat, donationLocation.lng,
              n.latitude || n.lat, n.longitude || n.lng
            ) : null
          ),
          googleMapsUrl: n.googleMapsURI || n.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${n.latitude || n.lat},${n.longitude || n.lng}`
        }));
      } catch (err) {
        placesError = err.message || 'Google Places discovery failed';
        console.warn('[MatchingService] Places error:', placesError);
      }
    }

    // 3. Deduplicate Google Places against backend matches (within 100m)
    const backendMatches = backendResult?.recommendations || backendResult?.matches || [];
    const deduplicatedPlaces = placesNgos.filter(place => {
      if (!place.latitude && !place.lat) return false;
      const pLat = place.latitude || place.lat;
      const pLng = place.longitude || place.lng;
      return !backendMatches.some(bm => {
        const bmLat = bm.latitude || bm.lat;
        const bmLng = bm.longitude || bm.lng;
        if (!bmLat || !bmLng) return false;
        const dist = calculateDistanceKm(pLat, pLng, bmLat, bmLng);
        return dist !== null && dist < 0.1;
      });
    });

    // 4. Build unified result
    const aiAvailable = backendResult?.aiAvailable ?? false;
    const donation = backendResult?.donation || null;
    const locationRequired = backendResult?.reason === 'LOCATION_REQUIRED';

    return {
      success: !locationRequired && (backendMatches.length > 0 || deduplicatedPlaces.length > 0),
      locationRequired,
      aiAvailable,
      donation,
      recommendations: backendMatches.sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0)),
      nearbyUnverified: deduplicatedPlaces.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999)),
      backendError,
      placesError,
      totalCount: backendMatches.length + deduplicatedPlaces.length
    };
  }
}

const matchingService = new MatchingService();
export default matchingService;
