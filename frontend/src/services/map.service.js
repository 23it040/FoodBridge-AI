/**
 * FoodBridge Map Service
 * Provides Coordinate Normalization, Geocoding, Route computation (Route.computeRoutes),
 * Route Matrix comparison (RouteMatrix.computeRouteMatrix), and Directions URL generation.
 */

export const normalizeCoordinates = (input) => {
  if (!input) return null;

  let lat = null;
  let lng = null;

  if (Array.isArray(input)) {
    // GeoJSON order in MongoDB: [longitude, latitude]
    if (input.length >= 2) {
      lng = Number(input[0]);
      lat = Number(input[1]);
    }
  } else if (typeof input === 'object') {
    if (input.location && Array.isArray(input.location.coordinates) && input.location.coordinates.length >= 2) {
      // GeoJSON object: { location: { type: 'Point', coordinates: [lng, lat] } }
      lng = Number(input.location.coordinates[0]);
      lat = Number(input.location.coordinates[1]);
    } else if (Array.isArray(input.coordinates) && input.coordinates.length >= 2) {
      // GeoJSON object: { type: 'Point', coordinates: [lng, lat] }
      lng = Number(input.coordinates[0]);
      lat = Number(input.coordinates[1]);
    } else if (Array.isArray(input.position) && input.position.length >= 2) {
      lat = Number(input.position[0]);
      lng = Number(input.position[1]);
    } else if (input.position && typeof input.position === 'object') {
      lat = Number(input.position.lat ?? input.position.latitude);
      lng = Number(input.position.lng ?? input.position.longitude);
    } else {
      lat = Number(input.lat ?? input.latitude);
      lng = Number(input.lng ?? input.longitude);
    }
  }

  if (
    lat !== null &&
    lng !== null &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    (lat !== 0 || lng !== 0)
  ) {
    return { lat, lng };
  }

  return null;
};

export const geocodeAddress = async (address) => {
  if (!address || typeof window === 'undefined' || !window.google?.maps) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          console.warn('Geocode address status:', status);
          resolve(null);
        }
      });
    } catch (err) {
      console.error('Geocoding error:', err);
      resolve(null);
    }
  });
};

export const computeRoute = async (origin, destination) => {
  if (!origin || !destination || typeof window === 'undefined' || !window.google?.maps) {
    return null;
  }

  const orig = normalizeCoordinates(origin);
  const dest = normalizeCoordinates(destination);

  if (!orig || !dest) return null;

  return new Promise((resolve) => {
    try {
      if (window.google.maps.routes && window.google.maps.routes.Route) {
        window.google.maps.routes.Route.computeRoutes({
          origin: { location: { latLng: orig } },
          destination: { location: { latLng: dest } },
          travelMode: 'DRIVE'
        })
          .then((response) => {
            if (response && response.routes && response.routes[0]) {
              const route = response.routes[0];
              const leg = route.legs?.[0];
              const distanceKm = leg?.distanceMeters ? (leg.distanceMeters / 1000).toFixed(1) : null;
              const durationMin = leg?.duration ? Math.round(parseInt(leg.duration, 10) / 60) : null;

              resolve({
                distanceText: distanceKm ? `${distanceKm} km` : 'N/A',
                distanceValue: leg?.distanceMeters || 0,
                durationText: durationMin ? `${durationMin} mins` : 'N/A',
                durationValue: durationMin || 0,
                polyline: route.polyline?.encodedPolyline || null,
                path: route.polyline?.path || []
              });
              return;
            }
            fallbackDirectionsService(orig, dest, resolve);
          })
          .catch(() => {
            fallbackDirectionsService(orig, dest, resolve);
          });
      } else {
        fallbackDirectionsService(orig, dest, resolve);
      }
    } catch (err) {
      console.warn('computeRoute error, using fallback:', err);
      fallbackDirectionsService(orig, dest, resolve);
    }
  });
};

const fallbackDirectionsService = (orig, dest, resolve) => {
  try {
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: orig,
        destination: dest,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
          const leg = result.routes[0].legs[0];
          resolve({
            distanceText: leg.distance.text,
            distanceValue: leg.distance.value,
            durationText: leg.duration.text,
            durationValue: Math.round(leg.duration.value / 60),
            directionsResult: result
          });
        } else {
          console.warn('DirectionsService status:', status);
          resolve(null);
        }
      }
    );
  } catch (err) {
    console.error('DirectionsService fallback error:', err);
    resolve(null);
  }
};

export const computeRouteMatrix = async (origins, destinations) => {
  if (!origins?.length || !destinations?.length || typeof window === 'undefined' || !window.google?.maps) {
    return [];
  }

  const normOrigins = origins.map(normalizeCoordinates).filter(Boolean);
  const normDestinations = destinations.map(normalizeCoordinates).filter(Boolean);

  if (!normOrigins.length || !normDestinations.length) return [];

  return new Promise((resolve) => {
    try {
      if (window.google.maps.routes && window.google.maps.routes.RouteMatrix) {
        window.google.maps.routes.RouteMatrix.computeRouteMatrix({
          origins: normOrigins.map((o) => ({ location: { latLng: o } })),
          destinations: normDestinations.map((d) => ({ location: { latLng: d } })),
          travelMode: 'DRIVE'
        })
          .then((matrix) => {
            resolve(matrix);
          })
          .catch(() => {
            fallbackDistanceMatrix(normOrigins, normDestinations, resolve);
          });
      } else {
        fallbackDistanceMatrix(normOrigins, normDestinations, resolve);
      }
    } catch (err) {
      fallbackDistanceMatrix(normOrigins, normDestinations, resolve);
    }
  });
};

const fallbackDistanceMatrix = (origins, destinations, resolve) => {
  try {
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: origins.map((o) => ({ lat: o.lat, lng: o.lng })),
        destinations: destinations.map((d) => ({ lat: d.lat, lng: d.lng })),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (response, status) => {
        if (status === 'OK' && response) {
          resolve(response);
        } else {
          resolve([]);
        }
      }
    );
  } catch (err) {
    resolve([]);
  }
};

export const getDirectionsUrl = (origin, destination) => {
  if (!origin || !destination) return '#';

  const orig = normalizeCoordinates(origin);
  const dest = normalizeCoordinates(destination);

  if (orig && dest) {
    return `https://www.google.com/maps/dir/?api=1&origin=${orig.lat},${orig.lng}&destination=${dest.lat},${dest.lng}&travelmode=driving`;
  }
  if (dest) {
    return `https://www.google.com/maps/search/?api=1&query=${dest.lat},${dest.lng}`;
  }
  return '#';
};

export default {
  normalizeCoordinates,
  geocodeAddress,
  computeRoute,
  computeRouteMatrix,
  getDirectionsUrl
};
