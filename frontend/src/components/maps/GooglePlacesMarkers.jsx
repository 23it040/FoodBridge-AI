import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import NGOPinIcon from './NGOPinIcon';

/**
 * GooglePlacesMarkers
 *
 * Renders markers for real non-profit organizations discovered via the
 * Google Places API (New) searchByText with STRICT type filtering:
 * includedType = "non_profit_organization", useStrictTypeFiltering = true.
 *
 * Uses the SAME NGOPinIcon as FoodBridge registered NGOs — no visual
 * distinction between the two data sources on the map.
 *
 * Must be rendered as a child of <Map> so useMap() works.
 */

const PLACE_FIELDS = [
  'id',
  'displayName',
  'location',
  'formattedAddress',
  'googleMapsURI',
  'types'
];

/**
 * Check if a Google Place is likely the same as a FoodBridge NGO
 * based on name similarity and coordinate proximity (~100m).
 */
const isDuplicateOfFoodBridgeNGO = (place, foodBridgeNGOs) => {
  if (!place.location || !foodBridgeNGOs?.length) return false;

  const placeLat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
  const placeLng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
  if (placeLat == null || placeLng == null) return false;

  const placeName = (place.displayName?.text || place.displayName || '').toLowerCase().trim();

  for (const ngo of foodBridgeNGOs) {
    const ngoLat = Number(ngo.latitude ?? ngo.lat ?? ngo.position?.lat);
    const ngoLng = Number(ngo.longitude ?? ngo.lng ?? ngo.position?.lng);
    if (isNaN(ngoLat) || isNaN(ngoLng)) continue;

    const dLat = (placeLat - ngoLat) * 111320;
    const dLng = (placeLng - ngoLng) * 111320 * Math.cos(placeLat * Math.PI / 180);
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);

    if (distance < 100) {
      const ngoName = (ngo.organizationName || ngo.name || '').toLowerCase().trim();
      if (ngoName && placeName && (
        ngoName.includes(placeName) ||
        placeName.includes(ngoName) ||
        ngoName === placeName
      )) {
        return true;
      }
      if (distance < 50) return true;
    }
  }
  return false;
};


const GooglePlacesMarkers = ({ foodBridgeNGOs = [] }) => {
  const map = useMap();
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);
  const searchDoneRef = useRef(false);

  const searchPlaces = useCallback(async () => {
    if (!map || searchDoneRef.current) return;

    const bounds = map.getBounds();
    if (!bounds) {
      const listener = map.addListener('idle', () => {
        if (window.google?.maps?.event) {
          window.google.maps.event.removeListener(listener);
        }
        searchPlaces();
      });
      return;
    }

    searchDoneRef.current = true;

    try {
      const { Place } = await window.google.maps.importLibrary('places');

      if (!Place?.searchByText) {
        console.error('[GOOGLE PLACES] Place.searchByText is not available. Ensure Places API (New) is enabled in Google Cloud Console.');
        setError('Google Places API (New) is not available.');
        return;
      }

      // ONE controlled search with strict non_profit_organization type
      const request = {
        textQuery: 'non profit organization',
        includedType: 'non_profit_organization',
        useStrictTypeFiltering: true,
        fields: PLACE_FIELDS,
        locationRestriction: map.getBounds(),
        maxResultCount: 20,
        language: 'en',
        region: 'IN'
      };

      const response = await Place.searchByText(request);
      const rawPlaces = response?.places || [];

      console.log(`[GOOGLE PLACES] Raw results: ${rawPlaces.length}`);

      // SECOND safety filter: only accept places with non_profit_organization type
      const ngoPlaces = rawPlaces.filter(place => {
        if (!place?.location) return false;
        const types = place.types || [];
        return types.includes('non_profit_organization');
      });

      console.log(`[GOOGLE PLACES] After non_profit_organization filter: ${ngoPlaces.length}`);

      // Filter out duplicates that overlap with FoodBridge NGOs
      const filtered = ngoPlaces.filter(
        (place) => !isDuplicateOfFoodBridgeNGO(place, foodBridgeNGOs)
      );

      console.log(`[GOOGLE PLACES] After FoodBridge dedup: ${filtered.length}`);

      setPlaces(filtered);
    } catch (err) {
      console.error('[GOOGLE PLACES NGO SEARCH ERROR]', err);
      setError('Nearby Google Maps organizations could not be loaded.');
    }
  }, [map, foodBridgeNGOs]);

  useEffect(() => {
    if (!map) return;
    searchDoneRef.current = false;

    const timer = setTimeout(() => {
      searchPlaces();
    }, 1000);

    return () => clearTimeout(timer);
  }, [map, searchPlaces]);

  const getPlacePosition = (place) => {
    if (!place?.location) return null;
    const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
    const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    return null;
  };

  const getDisplayName = (place) => {
    if (!place?.displayName) return 'Organization';
    if (typeof place.displayName === 'string') return place.displayName;
    if (place.displayName.text) return place.displayName.text;
    return 'Organization';
  };

  return (
    <>
      {error && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          zIndex: 50,
          background: 'rgba(120, 53, 15, 0.9)',
          color: '#fef3c7',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 600,
          pointerEvents: 'none'
        }}>
          {error}
        </div>
      )}

      {/* NGO markers — uses the SAME NGOPinIcon as FoodBridge markers */}
      {places.map((place) => {
        const position = getPlacePosition(place);
        if (!position) return null;

        return (
          <AdvancedMarker
            key={place.id}
            position={position}
            title={getDisplayName(place)}
            onClick={() => setSelectedPlace(place)}
            zIndex={5}
          >
            <NGOPinIcon size={42} />
          </AdvancedMarker>
        );
      })}

      {/* InfoWindow for selected NGO */}
      {selectedPlace && getPlacePosition(selectedPlace) && (
        <InfoWindow
          position={getPlacePosition(selectedPlace)}
          onCloseClick={() => setSelectedPlace(null)}
          pixelOffset={[0, -42]}
        >
          <div style={{
            padding: '8px',
            maxWidth: '260px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              paddingBottom: '6px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#ECFEFF',
                border: '1px solid #A5F3FC',
                borderRadius: '9999px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 800,
                color: '#0E7490',
                textTransform: 'uppercase'
              }}>
                NEARBY NGO
              </span>
            </div>
            <h4 style={{
              fontWeight: 800,
              fontSize: '14px',
              color: '#1e293b',
              margin: '0 0 4px 0'
            }}>
              {getDisplayName(selectedPlace)}
            </h4>
            {selectedPlace.formattedAddress && (
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: '0 0 8px 0',
                lineHeight: 1.4
              }}>
                {selectedPlace.formattedAddress}
              </p>
            )}
            {selectedPlace.googleMapsURI && (
              <a
                href={selectedPlace.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#BD715C',
                  textDecoration: 'none'
                }}
              >
                View on Google Maps →
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default GooglePlacesMarkers;
