/**
 * Maps Helper Service Abstraction
 * Constructs directions navigation URLs for physical coordinates.
 */
export const getDirectionsUrl = (origin, destination) => {
  if (!origin || !destination) return '#';

  const origLat = typeof origin === 'object' ? origin.latitude || origin.lat || origin.coordinates?.[1] : null;
  const origLng = typeof origin === 'object' ? origin.longitude || origin.lng || origin.coordinates?.[0] : null;

  const destLat = typeof destination === 'object' ? destination.latitude || destination.lat || destination.coordinates?.[1] : null;
  const destLng = typeof destination === 'object' ? destination.longitude || destination.lng || destination.coordinates?.[0] : null;

  if (origLat && origLng && destLat && destLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${destLat},${destLng}&travelmode=driving`;
  } else if (destLat && destLng) {
    return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
  }

  return '#';
};

export default {
  getDirectionsUrl
};
