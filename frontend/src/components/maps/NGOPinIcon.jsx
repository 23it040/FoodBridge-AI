import React from 'react';

/**
 * NGOPinIcon — Shared SVG location-pin marker for all NGO/non-profit organizations.
 *
 * Displays a clean, professional Google Maps-style location pin containing a minimal
 * flat vector building icon for NGO locations.
 *
 * Color: FoodBridge Terracotta (#BD715C / #A85F4D) with crisp white inner disc.
 * Anchor: Pin tip at bottom-center (transform: translate(-50%, -100%)).
 */
const NGOPinIcon = ({ size = 42 }) => {
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
      className="ngo-map-marker-pin"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 42 50"
        width={size}
        height={height}
        fill="none"
      >
        {/* Outer Pin Body (Terracotta Dark Outline) */}
        <path
          d="M21 0C9.402 0 0 9.402 0 21c0 14.174 19.21 27.637 20.035 28.217a1.6 1.6 0 0 0 1.93 0C22.79 48.637 42 35.174 42 21 42 9.402 32.598 0 21 0Z"
          fill="#A85F4D"
        />
        {/* Inner Pin Body (FoodBridge Terracotta Fill) */}
        <path
          d="M21 2C10.5 2 2 10.5 2 21c0 12.8 17.1 25.1 19 26.5 1.9-1.4 19-13.7 19-26.5C40 10.5 31.5 2 21 2Z"
          fill="#BD715C"
        />
        {/* Inner White Disc */}
        <circle cx="21" cy="19" r="12.5" fill="#FFFFFF" />

        {/* Vector NGO Organization Building Icon */}
        <path d="M14 26V13.5l7-3.5 7 3.5V26H14Z" fill="#BD715C" />
        <rect x="16.5" y="16" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
        <rect x="23" y="16" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
        <rect x="16.5" y="20.5" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
        <rect x="23" y="20.5" width="2.5" height="2.5" rx="0.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export default NGOPinIcon;


