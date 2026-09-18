import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import NGOPinIcon from './NGOPinIcon';

const parsePosition = (ngo) => {
  if (!ngo) return null;
  const lat = Number(ngo.latitude ?? ngo.lat ?? ngo.position?.[0] ?? ngo.position?.lat);
  const lng = Number(ngo.longitude ?? ngo.lng ?? ngo.position?.[1] ?? ngo.position?.lng);
  if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }
  return null;
};

const NGOMarker = ({ ngo, onClick, isSelected }) => {
  const position = parsePosition(ngo);
  if (!position) return null;

  const ngoName = ngo.organizationName || ngo.name || 'NGO Partner';

  return (
    <AdvancedMarker
      position={position}
      onClick={() => onClick && onClick(ngo)}
      title={ngoName}
      zIndex={isSelected ? 100 : 10}
    >
      <NGOPinIcon size={isSelected ? 48 : 42} />
    </AdvancedMarker>
  );
};

export default NGOMarker;
