import React from 'react';

/**
 * FoodDonationPinIcon — Shared SVG location-pin marker for Food Donation points.
 *
 * Displays a clean, professional Google Maps-style location pin containing a minimal
 * flat vector food donation box package icon inside.
 *
 * Color: Warm Amber/Orange (#F59E0B / #D97706) with crisp white inner disc.
 * Anchor: Pin tip at bottom-center (transform: translate(-50%, -100%)).
 */
const FoodDonationPinIcon = ({ size = 42 }) => {
  const height = Math.round(size * 1.19); // 42x50 aspect ratio

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${height}px`,
        cursor: 'pointer',
        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))',
        transform: 'translate(-50%, -100%)',
        position: 'relative',
        userSelect: 'none',
      }}
      className="food-donation-marker-pin"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 42 50"
        width={size}
        height={height}
        fill="none"
      >
        {/* Outer Pin Body (Dark Amber Outline) */}
        <path
          d="M21 0C9.402 0 0 9.402 0 21c0 14.174 19.21 27.637 20.035 28.217a1.6 1.6 0 0 0 1.93 0C22.79 48.637 42 35.174 42 21 42 9.402 32.598 0 21 0Z"
          fill="#D97706"
        />
        {/* Inner Pin Body (Warm Amber Fill) */}
        <path
          d="M21 2C10.5 2 2 10.5 2 21c0 12.8 17.1 25.1 19 26.5 1.9-1.4 19-13.7 19-26.5C40 10.5 31.5 2 21 2Z"
          fill="#F59E0B"
        />
        {/* Inner White Disc */}
        <circle cx="21" cy="19" r="12.5" fill="#FFFFFF" />

        {/* Vector Food Donation Box / Package Icon */}
        {/* Cardboard Box Body */}
        <rect x="13" y="17" width="16" height="9.5" rx="1.5" fill="#D97706" />
        {/* Box Top Flap / Fold */}
        <path d="M12 17l2.5-4.5h13l2.5 4.5H12Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        {/* Center Tape / Seam Line */}
        <line x1="21" y1="12.5" x2="21" y2="26.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        {/* Top Horizontal Fold Line */}
        <line x1="12" y1="17" x2="30" y2="17" stroke="#B45309" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

export default FoodDonationPinIcon;
