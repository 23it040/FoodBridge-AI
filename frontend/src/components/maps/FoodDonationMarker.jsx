import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import FoodDonationPinIcon from './FoodDonationPinIcon';
import { normalizeCoordinates } from '../../services/map.service';

/**
 * FoodDonationMarker
 *
 * Renders a Google Maps AdvancedMarker for Food Donation locations
 * using the FoodDonationPinIcon (vector food box inside amber location pin).
 */
const FoodDonationMarker = ({
  location,
  onClick,
  title = 'Food Donation Location',
  isSelected = false
}) => {
  const position = normalizeCoordinates(location);
  if (!position) return null;

  return (
    <AdvancedMarker
      position={position}
      onClick={() => onClick && onClick(location)}
      title={title}
      zIndex={isSelected ? 100 : 80}
    >
      <FoodDonationPinIcon size={isSelected ? 48 : 42} />
    </AdvancedMarker>
  );
};

export default FoodDonationMarker;
