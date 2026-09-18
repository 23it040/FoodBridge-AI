import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import Button from '../ui/Button';

const MapError = ({
  message = 'Unable to load the map. Please try again.',
  subtext = 'Check your network connection or API configuration.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-8 text-center text-red-950 ${className || 'h-[420px]'}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <FiAlertTriangle className="h-6 w-6" />
      </div>
      <span className="text-sm font-bold">{message}</span>
      <span className="text-xs text-red-700 font-medium max-w-sm">{subtext}</span>
      {onRetry && (
        <Button size="sm" onClick={onRetry} className="mt-2 gap-1.5 bg-red-600 hover:bg-red-700 text-white">
          <FiRefreshCw className="h-3.5 w-3.5" />
          <span>Retry Map Load</span>
        </Button>
      )}
    </div>
  );
};

export default MapError;
