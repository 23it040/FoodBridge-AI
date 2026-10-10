import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { FiNavigation, FiClock, FiMapPin, FiX } from 'react-icons/fi';
import { getDirectionsUrl } from '../../services/map.service';

const RouteDisplay = ({ routeData, onClearRoute }) => {
  const map = useMap();
  const polylineRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return;

    // Clean up previous polyline/renderer
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (rendererRef.current) {
      rendererRef.current.setMap(null);
      rendererRef.current = null;
    }

    if (!routeData) return;

    try {
      if (routeData.directionsResult) {
        // DirectionsRenderer
        const renderer = new window.google.maps.DirectionsRenderer({
          map,
          directions: routeData.directionsResult,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#059669',
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });
        rendererRef.current = renderer;
      } else if (routeData.path && routeData.path.length > 0) {
        // Direct polyline path
        const polyline = new window.google.maps.Polyline({
          path: routeData.path,
          geodesic: true,
          strokeColor: '#059669',
          strokeOpacity: 0.85,
          strokeWeight: 5
        });
        polyline.setMap(map);
        polylineRef.current = polyline;

        try {
          const bounds = new window.google.maps.LatLngBounds();
          routeData.path.forEach((pt) => bounds.extend(pt));
          map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        } catch (fitErr) {
          console.warn('Path fitBounds error:', fitErr);
        }
      }
    } catch (err) {
      console.warn('RouteDisplay render error:', err);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
        rendererRef.current = null;
      }
    };
  }, [map, routeData]);

  if (!routeData) return null;

  return (
    <div className="absolute left-3 top-3 z-10 max-w-sm rounded-2xl border border-[#E6DED6] bg-white/95 p-3.5 shadow-xl backdrop-blur-sm text-[#292B29] font-sans">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#BD715C]">
          <FiNavigation className="h-4 w-4" />
          <span>ROUTE DETAILS</span>
        </div>
        {onClearRoute && (
          <button
            type="button"
            onClick={onClearRoute}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Clear Route"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-medium">
        <div className="flex items-center gap-2 rounded-xl bg-[#E6EEE8] p-2.5 border border-[#7D9588]/20">
          <FiNavigation className="h-4 w-4 text-[#7D9588] shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance</span>
            <span className="font-extrabold text-[#7D9588]">{routeData.distanceText || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#F8EAE3] p-2.5 border border-[#BD715C]/20">
          <FiClock className="h-4 w-4 text-[#BD715C] shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Est. Time</span>
            <span className="font-extrabold text-[#A85F4D]">{routeData.durationText || 'N/A'}</span>
          </div>
        </div>
      </div>

      {routeData.destination && (
        <a
          href={getDirectionsUrl(routeData.origin, routeData.destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-[#BD715C] hover:bg-[#A85F4D] text-white font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
        >
          <FiNavigation className="h-3.5 w-3.5" />
          <span>Start Navigation (Google Maps)</span>
        </a>
      )}
    </div>
  );
};

export default RouteDisplay;
