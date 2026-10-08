import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { FiNavigation, FiPackage, FiCheckCircle, FiEye } from 'react-icons/fi';
import GoogleMap from './GoogleMap';
import NGOMarker from './NGOMarker';
import DonorMarker from './DonorMarker';
import NGOInfoCard from './NGOInfoCard';
import RouteDisplay from './RouteDisplay';
import GooglePlacesMarkers from './GooglePlacesMarkers';
import MapLoading from './MapLoading';
import MapError from './MapError';
import ErrorBoundary from '../error/ErrorBoundary';
import Button from '../ui/Button';
import ngoService from '../../services/ngo.service';
import useGoogleMap from '../../hooks/useGoogleMap';
import useRouting from '../../hooks/useRouting';
import { normalizeCoordinates, getDirectionsUrl } from '../../services/map.service';

const parsePosition = (item) => {
  return normalizeCoordinates(item);
};

const NGOMapContent = ({
  ngos = [],
  foodDonations = [],
  pickupLocation = null,
  selectedNgo = null,
  setSelectedNgo,
  selectedFood: controlledSelectedFood = undefined,
  setSelectedFood: controlledSetSelectedFood = undefined,
  onViewNgo,
  className = ''
}) => {
  const navigate = useNavigate();
  const { fitBoundsToMarkers } = useGoogleMap();
  const { routeData, calculateRouteData, clearRoute } = useRouting();
  const [internalSelectedFood, setInternalSelectedFood] = useState(null);

  const selectedFood = controlledSelectedFood !== undefined ? controlledSelectedFood : internalSelectedFood;
  const setSelectedFood = useCallback(
    (food) => {
      if (controlledSetSelectedFood) {
        controlledSetSelectedFood(food);
      } else {
        setInternalSelectedFood(food);
      }
    },
    [controlledSetSelectedFood]
  );

  const handleGetRoute = useCallback(
    (target) => {
      if (!target || !pickupLocation) return;
      const targetPos = parsePosition(target);
      if (targetPos) {
        calculateRouteData(pickupLocation, targetPos);
      }
    },
    [pickupLocation, calculateRouteData]
  );

  const allMarkers = useMemo(() => {
    const list = [];
    ngos.forEach((n) => {
      const pos = parsePosition(n);
      if (pos) list.push({ ...n, position: pos, latitude: pos.lat, longitude: pos.lng });
    });
    if (pickupLocation) {
      const pos = parsePosition(pickupLocation);
      if (pos) list.unshift({ ...pickupLocation, position: pos, latitude: pos.lat, longitude: pos.lng, isPickup: true });
    }
    foodDonations.forEach((f) => {
      const pos = parsePosition(f);
      if (pos) list.push({ ...f, position: pos, latitude: pos.lat, longitude: pos.lng });
    });
    return list;
  }, [ngos, pickupLocation, foodDonations]);

  const handleResetBounds = useCallback(() => {
    fitBoundsToMarkers(allMarkers);
  }, [fitBoundsToMarkers, allMarkers]);

  // When selectedFood changes, calculate route to donor and fit bounds to origin & food pin
  useEffect(() => {
    if (selectedFood) {
      const foodPos = parsePosition(selectedFood);
      if (foodPos) {
        if (pickupLocation) {
          const originPos = parsePosition(pickupLocation);
          if (originPos) {
            fitBoundsToMarkers([originPos, foodPos]);
            handleGetRoute(selectedFood);
            return;
          }
        }
        fitBoundsToMarkers([foodPos]);
      }
    } else if (!selectedNgo) {
      clearRoute();
    }
  }, [selectedFood, pickupLocation, fitBoundsToMarkers, handleGetRoute, selectedNgo, clearRoute]);

  // Fit bounds to all markers only on initial view when no specific food or NGO is selected
  useEffect(() => {
    if (!selectedFood && !selectedNgo && allMarkers.length > 0) {
      fitBoundsToMarkers(allMarkers);
    }
  }, [allMarkers, fitBoundsToMarkers, selectedFood, selectedNgo]);

  const mapCenter = useMemo(() => {
    if (pickupLocation) {
      const pos = parsePosition(pickupLocation);
      if (pos) return pos;
    }
    if (foodDonations.length > 0) {
      const pos = parsePosition(foodDonations[0]);
      if (pos) return pos;
    }
    if (ngos.length > 0) {
      const pos = parsePosition(ngos[0]);
      if (pos) return pos;
    }
    return { lat: 22.6005, lng: 72.8205 }; // Gujarat fallback
  }, [pickupLocation, ngos, foodDonations]);

  const validNgoCount = useMemo(() => ngos.filter(parsePosition).length, [ngos]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info('[NGO MAP] NGO marker coordinates validated:', validNgoCount);
    }
  }, [validNgoCount]);

  return (

    <GoogleMap
      center={mapCenter}
      zoom={12}
      className={className}
      onResetBounds={handleResetBounds}
    >
      {/* User / Pickup Location Marker */}
      {pickupLocation && (
        <DonorMarker location={pickupLocation} title="Your Location" variant="current" />
      )}

      {/* Verified NGO Markers */}
      {ngos.map((ngo) => (
        <NGOMarker
          key={ngo.id || ngo._id}
          ngo={ngo}
          isSelected={selectedNgo?.id === ngo.id || selectedNgo?._id === ngo._id}
          onClick={(clicked) => {
            setSelectedFood(null);
            if (setSelectedNgo) setSelectedNgo(clicked);
          }}
        />
      ))}

      {/* Food Donation Markers */}
      {foodDonations.map((food) => {
        const coords = parsePosition(food);
        if (!coords) return null;
        const foodId = food._id || food.id;
        return (
          <DonorMarker
            key={foodId}
            location={coords}
            variant="food"
            title={`${food.foodName || food.name || 'Food Item'} (${food.quantity || 1} ${food.unit || 'servings'})`}
            onClick={() => {
              if (setSelectedNgo) setSelectedNgo(null);
              setSelectedFood(food);
            }}
          />
        );
      })}

      {/* Selected NGO Info Card */}
      {selectedNgo && (
        <NGOInfoCard
          ngo={selectedNgo}
          distanceText={routeData?.distanceText}
          onClose={() => setSelectedNgo(null)}
          onGetRoute={pickupLocation ? handleGetRoute : null}
          onViewNgo={onViewNgo}
        />
      )}

      {/* Selected Food Donation Info Card */}
      {selectedFood && (
        <InfoWindow
          position={parsePosition(selectedFood)}
          onCloseClick={() => {
            setSelectedFood(null);
            clearRoute();
          }}
          pixelOffset={[0, -32]}
        >
          <div className="p-2.5 max-w-xs text-slate-800 space-y-2 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                <FiPackage className="h-3 w-3 text-amber-600" />
                FOOD DONATION
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {selectedFood.status || 'AVAILABLE'}
              </span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#1A312C]">
                {selectedFood.foodName || selectedFood.name || 'Surplus Food'}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Donor: <span className="font-semibold text-slate-700">{selectedFood.donorId?.name || selectedFood.donorName || 'Verified Donor'}</span>
              </p>
            </div>
            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
              <p><strong className="text-slate-700">Quantity:</strong> {selectedFood.quantity} {selectedFood.unit || 'servings'}</p>
              <p><strong className="text-slate-700">Expiry:</strong> {selectedFood.expiryTime || 'Within 24 Hours'}</p>
              {selectedFood.pickupAddress || selectedFood.address ? (
                <p className="truncate"><strong className="text-slate-700">Pickup:</strong> {selectedFood.pickupAddress || selectedFood.address}</p>
              ) : null}
            </div>

            {/* Route & Distance Info if available */}
            {routeData && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-[#047857]">
                <span className="font-extrabold flex items-center gap-1">
                  <FiNavigation className="h-3.5 w-3.5 text-emerald-600" />
                  {routeData.distanceText}
                </span>
                <span className="font-semibold text-slate-500 text-[11px]">
                  Est. {routeData.durationText}
                </span>
              </div>
            )}

            <div className="pt-1 flex flex-col gap-1.5">
              <a
                href={getDirectionsUrl(pickupLocation, selectedFood)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
              >
                <FiNavigation className="h-3.5 w-3.5" />
                <span>Turn-by-Turn Directions</span>
              </a>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/ngo/food/${selectedFood._id || selectedFood.id}`)}
                className="w-full gap-1 text-xs py-1.5 font-semibold text-slate-700 hover:bg-slate-50 border-slate-200"
              >
                <FiEye className="h-3.5 w-3.5 text-slate-500" />
                <span>View Food Details</span>
              </Button>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* Real-world non-profit organizations discovered via Google Places if not already provided */}
      {!ngos.some((n) => n.source === 'google_places') && (
        <GooglePlacesMarkers foodBridgeNGOs={ngos} />
      )}

      {/* Route Polyline & Overlay */}
      <RouteDisplay routeData={routeData} onClearRoute={clearRoute} />
    </GoogleMap>
  );
};


const NGOMap = ({
  pickupLocation = null,
  initialNgos = null,
  foodDonations = [],
  onSelectNgo = null,
  onViewNgo = null,
  selectedFood = undefined,
  onSelectFood = undefined,
  className = ''
}) => {
  const [ngos, setNgos] = useState(initialNgos || []);
  const [loading, setLoading] = useState(!initialNgos);
  const [error, setError] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState(null);

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ngoService.getNgosForMap();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setNgos(list);
    } catch (err) {
      console.warn('NGOMap fetch error:', err);
      setError('Unable to load partner NGO locations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialNgos) {
      setNgos(initialNgos);
      setLoading(false);
    } else {
      fetchNgos();
    }
  }, [initialNgos, fetchNgos]);

  const handleSelectNgo = (ngo) => {
    setSelectedNgo(ngo);
    if (onSelectNgo) onSelectNgo(ngo);
  };

  if (loading) {
    return <MapLoading message="Loading map markers..." className={className} />;
  }

  return (
    <div className="relative w-full">
      {error && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          {error}
        </div>
      )}
      <ErrorBoundary fallback={<MapError message="Unable to load map" subtext="Interactive map service is currently unavailable." onRetry={fetchNgos} className={className} />}>
        <NGOMapContent
          ngos={ngos}
          foodDonations={foodDonations}
          pickupLocation={pickupLocation}
          selectedNgo={selectedNgo}
          setSelectedNgo={handleSelectNgo}
          selectedFood={selectedFood}
          setSelectedFood={onSelectFood}
          onViewNgo={onViewNgo}
          className={className}
        />
      </ErrorBoundary>
    </div>
  );
};

export default NGOMap;
