import { useState, useCallback } from 'react';
import { geocodeAddress } from '../services/map.service';

/**
 * Dedicated hook for address-to-coordinate geocoding.
 */
export const useGeocoding = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const geocode = useCallback(async (address) => {
    if (!address) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await geocodeAddress(address);
      if (result) {
        setCoordinates(result);
        return result;
      } else {
        setError('Could not find location for address');
        setCoordinates(null);
        return null;
      }
    } catch (err) {
      setError('Geocoding error');
      setCoordinates(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coordinates,
    loading,
    error,
    geocode
  };
};

export default useGeocoding;
