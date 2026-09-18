import React, { useState } from 'react';
import { FiPlus, FiMinus, FiMaximize, FiMinimize, FiCrosshair } from 'react-icons/fi';

const MapControls = ({ map, onResetBounds }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!map) return null;

  const handleZoomIn = () => {
    try {
      map.setZoom((map.getZoom() || 12) + 1);
    } catch (e) {}
  };

  const handleZoomOut = () => {
    try {
      map.setZoom((map.getZoom() || 12) - 1);
    } catch (e) {}
  };

  const toggleFullscreen = () => {
    try {
      const container = map.getDiv()?.parentElement;
      if (!container) return;

      if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    } catch (e) {}
  };

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 shadow-md">
      <button
        type="button"
        onClick={handleZoomIn}
        title="Zoom In"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
      >
        <FiPlus className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleZoomOut}
        title="Zoom Out"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
      >
        <FiMinus className="h-4 w-4" />
      </button>

      {onResetBounds && (
        <button
          type="button"
          onClick={onResetBounds}
          title="Fit All Markers"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"
        >
          <FiCrosshair className="h-4 w-4" />
        </button>
      )}

      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
      >
        {isFullscreen ? <FiMinimize className="h-4 w-4" /> : <FiMaximize className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default MapControls;
