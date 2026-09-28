import { useCallback, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

/**
 * Custom hook focused strictly on Google Map lifecycle & view manipulation.
 * Manages map reference, zoom, center, and fitting bounds.
 */
export const useGoogleMap = () => {
  const map = useMap();
  const [isLoaded, setIsLoaded] = useState(Boolean(map));

  const fitBoundsToMarkers = useCallback(
    (markersList = []) => {
      if (!map || typeof window === 'undefined' || !window.google?.maps || !Array.isArray(markersList) || markersList.length === 0) {
        return;
      }

      try {
        const bounds = new window.google.maps.LatLngBounds();
        let validCount = 0;

        markersList.forEach((m) => {
          let lat = null;
          let lng = null;

          if (m.position) {
            if (Array.isArray(m.position)) {
              lat = Number(m.position[0]);
              lng = Number(m.position[1]);
            } else if (typeof m.position === 'object') {
              lat = Number(m.position.lat ?? m.position.latitude);
              lng = Number(m.position.lng ?? m.position.longitude);
            }
          } else if (m.latitude != null && m.longitude != null) {
            lat = Number(m.latitude);
            lng = Number(m.longitude);
          }

          if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
            bounds.extend({ lat, lng });
            validCount++;
          }
        });

        if (validCount > 0) {
          map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
          if (validCount === 1) {
            map.setZoom(14);
          }
        }
      } catch (err) {
        console.warn('fitBoundsToMarkers error:', err);
      }
    },
    [map]
  );

  const resetView = useCallback(
    (center, zoom = 12) => {
      if (!map || !center) return;
      map.setCenter(center);
      map.setZoom(zoom);
    },
    [map]
  );

  return {
    map,
    isLoaded: Boolean(map) || isLoaded,
    fitBoundsToMarkers,
    resetView
  };
};

export default useGoogleMap;
