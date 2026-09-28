import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import NGOPinIcon from './NGOPinIcon';
import { normalizeCoordinates } from '../../services/map.service';

const NGOMarker = ({ ngo, onClick, isSelected }) => {
  const position = normalizeCoordinates(ngo);
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
