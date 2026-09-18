import { useState, useCallback, useEffect } from 'react';

/**
 * Reusable Browser Geolocation Hook for FoodBridge.
 * Requests device location on demand or automatically, with high accuracy options and comprehensive error handling.
 */
export const useGeolocation = (autoFetch = false) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          setPermissionStatus(status.state);
          status.onchange = () => setPermissionStatus(status.state);
        })
        .catch(() => {});
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setErrorType('UNSUPPORTED');
      setErrorMessage('Browser geolocation is not supported by your device.');
      setPermissionStatus('denied');
      return Promise.reject(new Error('Browser geolocation unsupported'));
    }

    setLoading(true);
    setErrorType(null);
    setErrorMessage(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            accuracy: position.coords.accuracy
          };
          setLocation(coords);
          setLoading(false);
          setPermissionStatus('granted');
          resolve(coords);
        },
        (error) => {
          setLoading(false);
          let type = 'UNKNOWN';
          let msg = 'Failed to obtain device location.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              type = 'PERMISSION_DENIED';
              msg = 'Location permission was denied. Please allow location access in your browser settings.';
              setPermissionStatus('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              type = 'POSITION_UNAVAILABLE';
              msg = 'Device location position is currently unavailable.';
              break;
            case error.TIMEOUT:
              type = 'TIMEOUT';
              msg = 'Location request timed out. Please try again.';
              break;
            default:
              type = 'UNKNOWN';
              msg = error.message || 'Unknown location error.';
          }

          setErrorType(type);
          setErrorMessage(msg);
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }, []);

  useEffect(() => {
    if (autoFetch) {
      requestLocation().catch(() => {});
    }
  }, [autoFetch, requestLocation]);

  return {
    location,
    loading,
    errorType,
    errorMessage,
    permissionStatus,
    requestLocation
  };
};

export default useGeolocation;
