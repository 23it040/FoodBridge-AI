import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import FoodDonationPinIcon from './FoodDonationPinIcon';
import { normalizeCoordinates } from '../../services/map.service';

const DonorMarker = ({
  location,
  onClick,
  title = 'Your Current Location',
  variant = 'current'
}) => {
  const position = normalizeCoordinates(location);
  if (!position) return null;

  if (variant === 'food') {
    return (
      <AdvancedMarker
        position={position}
        onClick={() => onClick && onClick(location)}
        title={title}
        zIndex={80}
      >
        <FoodDonationPinIcon size={42} />
      </AdvancedMarker>
    );
  }

  return (
    <AdvancedMarker
      position={position}
      onClick={() => onClick && onClick(location)}
      title={title}
      zIndex={90}
    >
      <Pin
        background="#2563EB"
        glyphColor="#FFFFFF"
        borderColor="#FFFFFF"
        scale={1.15}
      />
    </AdvancedMarker>
  );
};

export default DonorMarker;

