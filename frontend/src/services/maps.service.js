/**
 * Maps Helper Service Abstraction
 * Constructs directions navigation URLs for physical coordinates.
 */
export const getDirectionsUrl = (origin, destination) => {
  if (!origin || !destination) return '#';

  const readCoordinate = (value, primaryKey, secondaryKey, arrayIndex) => {
    const candidate = typeof value === 'object'
      ? value[primaryKey] ?? value[secondaryKey] ?? value.coordinates?.[arrayIndex]
      : null;
    const numeric = Number(candidate);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const origLat = readCoordinate(origin, 'latitude', 'lat', 1);
  const origLng = readCoordinate(origin, 'longitude', 'lng', 0);

  const destLat = readCoordinate(destination, 'latitude', 'lat', 1);
  const destLng = readCoordinate(destination, 'longitude', 'lng', 0);

  if (origLat !== null && origLng !== null && destLat !== null && destLng !== null) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${destLat},${destLng}&travelmode=driving`;
  } else if (destLat !== null && destLng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
  }

  return '#';
};

export default {
  getDirectionsUrl
};
