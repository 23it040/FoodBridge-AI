import { useState, useCallback } from 'react';
import { computeRoute } from '../services/map.service';

/**
 * Dedicated hook for route calculation, distance, ETA, and polyline state.
 */
export const useRouting = () => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRouteData = useCallback(async (origin, destination) => {
    if (!origin || !destination) {
      setRouteData(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await computeRoute(origin, destination);
      if (res) {
        setRouteData({
          ...res,
          origin,
          destination
        });
        return res;
      } else {
        setError('Unable to calculate route');
        setRouteData(null);
        return null;
      }
    } catch (err) {
      console.error('useRouting calculation error:', err);
      setError('Route computation failed');
      setRouteData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRouteData(null);
    setError(null);
  }, []);

  return {
    routeData,
    loading,
    error,
    calculateRouteData,
    clearRoute
  };
};

export default useRouting;
