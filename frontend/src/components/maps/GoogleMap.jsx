import React, { useMemo, useState, useEffect } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import MapError from './MapError';
import MapControls from './MapControls';

const DEFAULT_CENTER = { lat: 21.1702, lng: 72.8311 }; // Surat

const MapInner = ({
  center,
  zoom,
  children,
  className,
  onResetBounds,
  onClick
}) => {
  const map = useMap();
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);

  useEffect(() => {
    if (map && center?.lat && center?.lng) {
      map.panTo(center);
    }
  }, [map, center?.lat, center?.lng]);

  useEffect(() => {
    if (!map) return;

    const dragStartListener = map.addListener('dragstart', () => {
      setIsMapDragging(true);
    });
    const dragEndListener = map.addListener('dragend', () => {
      setIsMapDragging(false);
      setIsMouseDown(false);
    });

    return () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.removeListener(dragStartListener);
        window.google.maps.event.removeListener(dragEndListener);
      }
    };
  }, [map]);

  useEffect(() => {
    const handleGlobalRelease = () => {
      setIsMouseDown(false);
      setIsMapDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);

    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
    };
  }, []);

  const isDragging = isMouseDown || isMapDragging;

  const handleMouseDown = (e) => {
    if (e.button === 0 && !e.target.closest('button, input, select, a, [role="button"], .gm-ui-hover-effect')) {
      setIsMouseDown(true);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsMapDragging(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsMapDragging(false);
  };

  return (
    <div
      className={`foodbridge-map-container relative w-full overflow-hidden rounded-2xl ${className || 'h-[440px]'} ${isDragging ? 'is-dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI={true}
        mapId="DEMO_MAP_ID"
        onClick={onClick}
        className="h-full w-full"
      >
        {children}
      </Map>
      <MapControls map={map} onResetBounds={onResetBounds} />
    </div>
  );
};

const GoogleMap = ({
  center = DEFAULT_CENTER,
  zoom = 12,
  children,
  className = '',
  onResetBounds,
  onClick
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const parsedCenter = useMemo(() => {
    if (!center) return DEFAULT_CENTER;
    if (typeof center.lat === 'number' && typeof center.lng === 'number') return center;
    if (Array.isArray(center) && center.length >= 2) {
      const lat = Number(center[0]);
      const lng = Number(center[1]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    if (typeof center === 'object') {
      const lat = Number(center.lat ?? center.latitude);
      const lng = Number(center.lng ?? center.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return DEFAULT_CENTER;
  }, [center]);

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'marker']}>
      <MapInner
        center={parsedCenter}
        zoom={zoom}
        className={className}
        onResetBounds={onResetBounds}
        onClick={onClick}
      >
        {children}
      </MapInner>
    </APIProvider>
  );
};

export default GoogleMap;
