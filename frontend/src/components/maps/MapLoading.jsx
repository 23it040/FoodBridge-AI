import React from 'react';
import Spinner from '../ui/Spinner';

const MapLoading = ({ message = 'Loading FoodBridge map...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E6DED6] bg-[#FAF7F2] p-8 text-center text-[#292B29] ${className || 'h-[420px]'}`}>
      <Spinner size={40} />
      <span className="text-sm font-bold tracking-wide">{message}</span>
      <span className="text-xs text-slate-500 font-medium">Fetching interactive coordinates and registered partners...</span>
    </div>
  );
};

export default MapLoading;
