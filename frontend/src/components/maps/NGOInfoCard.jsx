import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { FiCheckCircle, FiNavigation, FiInfo, FiX, FiPackage } from 'react-icons/fi';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const parsePosition = (ngo) => {
  if (!ngo) return null;
  const lat = Number(ngo.latitude ?? ngo.lat ?? ngo.position?.[0] ?? ngo.position?.lat);
  const lng = Number(ngo.longitude ?? ngo.lng ?? ngo.position?.[1] ?? ngo.position?.lng);
  if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }
  return null;
};

const NGOInfoCard = ({ ngo, onClose, onGetRoute, onViewNgo, distanceText }) => {
  const position = parsePosition(ngo);
  if (!ngo || !position) return null;

  const ngoName = ngo.organizationName || ngo.name || 'NGO Partner';
  const foodTypes = Array.isArray(ngo.foodTypesAccepted)
    ? ngo.foodTypesAccepted
    : typeof ngo.foodTypesAccepted === 'string'
    ? [ngo.foodTypesAccepted]
    : ['cooked', 'packaged'];

  return (
    <InfoWindow position={position} onCloseClick={onClose} pixelOffset={[0, -32]}>
      <div className="p-1 max-w-xs text-slate-800 space-y-2.5 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <FiCheckCircle className="h-3 w-3" />
                VERIFIED NGO
              </span>
              {ngo.isDemoData && (
                <span className="rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                  DEMO DATA
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-sm text-[#1A312C] leading-snug">{ngoName}</h4>
          </div>
        </div>

        {/* Address & Distance */}
        <div className="text-xs space-y-1">
          <p className="text-slate-600 font-medium leading-normal">{ngo.address || 'Address not listed'}</p>
          {distanceText && (
            <div className="inline-flex items-center gap-1 text-[#047857] font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <FiNavigation className="h-3 w-3" />
              <span>Distance: {distanceText}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Accepted Food</span>
            <span className="font-semibold text-slate-700 capitalize">{foodTypes.join(', ')}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Capacity</span>
            <span className="font-extrabold text-[#047857]">{ngo.capacity || 150} meals</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {onGetRoute && (
            <Button
              size="sm"
              onClick={() => onGetRoute(ngo)}
              className="flex-1 gap-1 text-xs py-1.5 bg-[#047857] hover:bg-[#065F46] text-white"
            >
              <FiNavigation className="h-3.5 w-3.5" />
              <span>Get Route</span>
            </Button>
          )}
          {onViewNgo && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewNgo(ngo)}
              className="gap-1 text-xs py-1.5 border-slate-200 text-slate-700"
            >
              <FiInfo className="h-3.5 w-3.5" />
              <span>View</span>
            </Button>
          )}
        </div>
      </div>
    </InfoWindow>
  );
};

export default NGOInfoCard;
