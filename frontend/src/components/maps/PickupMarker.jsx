import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const parsePosition = (location) => {
  if (!location) return null;
  const lat = Number(location.latitude ?? location.lat ?? location.position?.[0] ?? location.position?.lat);
  const lng = Number(location.longitude ?? location.lng ?? location.position?.[1] ?? location.position?.lng);
  if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }
  return null;
};

const PickupMarker = ({
  location,
  onDragEnd,
  title = 'Pickup Location (Drag pin to adjust)',
  draggable = true
}) => {
  const position = parsePosition(location);
  if (!position) return null;

  const handleDragEnd = (e) => {
    if (!onDragEnd) return;
    let lat, lng;
    if (e.latLng) {
      lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    } else if (e.detail?.latLng) {
      lat = e.detail.latLng.lat;
      lng = e.detail.latLng.lng;
    } else if (e.target?.position) {
      lat = e.target.position.lat;
      lng = e.target.position.lng;
    }
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      onDragEnd({ lat, lng });
    }
  };

  return (
    <AdvancedMarker
      position={position}
      draggable={draggable}
      gmpDraggable={draggable}
      onDragEnd={handleDragEnd}
      title={title}
      zIndex={150}
    >
      <Pin
        background="#DC2626"
        glyphColor="#FFFFFF"
        borderColor="#FFFFFF"
        scale={1.35}
      />
    </AdvancedMarker>
  );
};

export default PickupMarker;
