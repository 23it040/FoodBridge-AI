import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Reusable Browser Geolocation Hook for FoodBridge.
 * Requests device location on demand, automatically, or via continuous watch,
 * with maximumAge: 0 to ensure live coordinates and comprehensive error handling.
 */
export const useGeolocation = (autoFetch = false) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const watchIdRef = useRef(null);

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

  const formatCoords = (position) => {
    const lat = Number(position.coords.latitude.toFixed(6));
    const lng = Number(position.coords.longitude.toFixed(6));

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      (lat !== 0 || lng !== 0)
    ) {
      return {
        lat,
        lng,
        accuracy: position.coords.accuracy
      };
    }
    return null;
  };

  const handlePositionError = (error, reject) => {
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
    if (reject) {
      reject(new Error(msg));
    }
  };

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
          const coords = formatCoords(position);
          if (coords) {
            setLocation(coords);
            setLoading(false);
            setPermissionStatus('granted');
            resolve(coords);
          } else {
            setLoading(false);
            setErrorType('POSITION_UNAVAILABLE');
            setErrorMessage('Invalid coordinates received from browser.');
            reject(new Error('Invalid coordinates received'));
          }
        },
        (error) => handlePositionError(error, reject),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Always fetch fresh coordinates
        }
      );
    });
  }, []);

  const startWatch = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = formatCoords(position);
        if (coords) {
          setLocation(coords);
          setPermissionStatus('granted');
        }
      },
      (error) => handlePositionError(error, null),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      requestLocation().catch(() => {});
    }

    return () => {
      stopWatch();
    };
  }, [autoFetch, requestLocation, stopWatch]);

  return {
    location,
    loading,
    error: errorMessage,
    errorType,
    errorMessage,
    permissionStatus,
    requestLocation,
    startWatch,
    stopWatch
  };
};

export default useGeolocation;
