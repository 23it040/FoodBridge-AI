import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useGeolocation from '../hooks/useGeolocation';

export const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const {
    location: deviceLocation,
    loading: locationLoading,
    error: locationError,
    errorType,
    errorMessage,
    permissionStatus,
    requestLocation,
    startWatch,
    stopWatch
  } = useGeolocation(true);

  // Allow manual location overrides (e.g. from search, user selection, or test)
  const [manualLocation, setManualLocation] = useState(null);

  const currentLocation = manualLocation || deviceLocation;

  const setCurrentLocation = useCallback((loc) => {
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      setManualLocation({
        lat: Number(loc.lat.toFixed(6)),
        lng: Number(loc.lng.toFixed(6))
      });
    } else if (loc === null) {
      setManualLocation(null);
    }
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    setManualLocation(null);
    return await requestLocation();
  }, [requestLocation]);

  const value = useMemo(
    () => ({
      currentLocation,
      deviceLocation,
      locationLoading,
      locationError,
      errorType,
      errorMessage,
      permissionStatus,
      requestCurrentLocation,
      startLocationTracking: startWatch,
      stopLocationTracking: stopWatch,
      setCurrentLocation
    }),
    [
      currentLocation,
      deviceLocation,
      locationLoading,
      locationError,
      errorType,
      errorMessage,
      permissionStatus,
      requestCurrentLocation,
      startWatch,
      stopWatch,
      setCurrentLocation
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export default LocationProvider;
