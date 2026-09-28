/**
 * Google Places Discovery Service for Non-Profit Organizations
 * Searches real-world non-profit organizations around the specified coordinates.
 * Handles API availability, rate limits, and errors safely without crashing.
 */

const PLACE_FIELDS = [
  'id',
  'displayName',
  'location',
  'formattedAddress',
  'googleMapsURI',
  'types',
  'rating',
  'userRatingCount',
  'nationalPhoneNumber'
];

/**
 * Searches real-world NGOs around location { lat, lng }
 */
export const searchPlacesNGOs = async (location, radiusMeters = 10000) => {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return {
      status: 'INVALID_LOCATION',
      places: [],
      error: 'Invalid coordinates provided for Google Places search'
    };
  }

  if (typeof window === 'undefined' || !window.google?.maps) {
    return {
      status: 'NOT_LOADED',
      places: [],
      error: 'Google Maps API is not loaded yet'
    };
  }

  try {
    // 1. Try modern Place.searchByText from Places Library (New)
    let PlaceClass = window.google.maps.places?.Place;
    if (!PlaceClass && window.google.maps.importLibrary) {
      try {
        const placesLib = await window.google.maps.importLibrary('places');
        PlaceClass = placesLib?.Place;
      } catch (importErr) {
        console.warn('[GOOGLE PLACES] importLibrary(places) notice:', importErr.message);
      }
    }

    if (PlaceClass?.searchByText) {
      const request = {
        textQuery: 'non profit organization NGO charitable foundation',
        includedType: 'non_profit_organization',
        useStrictTypeFiltering: false,
        fields: PLACE_FIELDS,
        locationBias: {
          circle: {
            center: { lat: location.lat, lng: location.lng },
            radius: radiusMeters
          }
        },
        maxResultCount: 20,
        language: 'en',
        region: 'IN'
      };

      const response = await PlaceClass.searchByText(request);
      const rawPlaces = response?.places || [];

      const normalized = rawPlaces
        .map((p) => {
          const pLat = typeof p.location?.lat === 'function' ? p.location.lat() : p.location?.lat;
          const pLng = typeof p.location?.lng === 'function' ? p.location.lng() : p.location?.lng;
          if (pLat == null || pLng == null || !Number.isFinite(pLat) || !Number.isFinite(pLng)) {
            return null;
          }

          const name = p.displayName?.text || p.displayName || 'Non-Profit Organization';
          return {
            id: p.id || `place-${pLat}-${pLng}`,
            name,
            organizationName: name,
            latitude: pLat,
            longitude: pLng,
            lat: pLat,
            lng: pLng,
            address: p.formattedAddress || 'Local Area',
            phone: p.nationalPhoneNumber || '',
            rating: p.rating || null,
            reviews: p.userRatingCount || null,
            googleMapsURI: p.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${pLat},${pLng}`,
            types: p.types || [],
            source: 'google_places',
            isVerified: false
          };
        })
        .filter(Boolean);

      return {
        status: normalized.length > 0 ? 'OK' : 'ZERO_RESULTS',
        places: normalized,
        error: null
      };
    }

    // 2. Fallback to classic PlacesService if Place.searchByText is not available
    if (window.google.maps.places?.PlacesService) {
      return new Promise((resolve) => {
        const dummyNode = document.createElement('div');
        const service = new window.google.maps.places.PlacesService(dummyNode);

        const request = {
          location: new window.google.maps.LatLng(location.lat, location.lng),
          radius: radiusMeters,
          keyword: 'NGO non profit organization'
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const normalized = results
              .map((p) => {
                const pLat = p.geometry?.location?.lat();
                const pLng = p.geometry?.location?.lng();
                if (pLat == null || pLng == null) return null;

                return {
                  id: p.place_id || `place-${pLat}-${pLng}`,
                  name: p.name || 'Non-Profit Organization',
                  organizationName: p.name || 'Non-Profit Organization',
                  latitude: pLat,
                  longitude: pLng,
                  lat: pLat,
                  lng: pLng,
                  address: p.vicinity || p.formatted_address || 'Local Area',
                  rating: p.rating || null,
                  reviews: p.user_ratings_total || null,
                  googleMapsURI: p.place_id
                    ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
                    : `https://www.google.com/maps/search/?api=1&query=${pLat},${pLng}`,
                  source: 'google_places',
                  isVerified: false
                };
              })
              .filter(Boolean);

            resolve({
              status: 'OK',
              places: normalized,
              error: null
            });
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve({
              status: 'ZERO_RESULTS',
              places: [],
              error: null
            });
          } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            resolve({
              status: 'REQUEST_DENIED',
              places: [],
              error: 'Google Places API request denied. Ensure Places API is enabled for the API key.'
            });
          } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            resolve({
              status: 'OVER_QUERY_LIMIT',
              places: [],
              error: 'Google Places API quota exceeded.'
            });
          } else {
            resolve({
              status: status || 'UNKNOWN_ERROR',
              places: [],
              error: `Google Places API status: ${status}`
            });
          }
        });
      });
    }

    return {
      status: 'NOT_SUPPORTED',
      places: [],
      error: 'Neither Place.searchByText nor PlacesService is available'
    };
  } catch (err) {
    console.warn('[GOOGLE PLACES NGO DISCOVERY EXCEPTION]', err);
    return {
      status: 'ERROR',
      places: [],
      error: err.message || 'Places API invocation failed'
    };
  }
};

export default {
  searchPlacesNGOs
};
