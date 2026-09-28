import React from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { FiCheckCircle, FiNavigation, FiInfo, FiPhone, FiExternalLink } from 'react-icons/fi';
import Button from '../ui/Button';
import { normalizeCoordinates } from '../../services/map.service';

const NGOInfoCard = ({ ngo, onClose, onGetRoute, onViewNgo, distanceText }) => {
  const position = normalizeCoordinates(ngo);
  if (!ngo || !position) return null;

  const ngoName = ngo.organizationName || ngo.name || 'NGO Partner';
  const isFoodBridge = ngo.source === 'foodbridge' || ngo.isVerified;

  const foodTypes = Array.isArray(ngo.foodTypesAccepted)
    ? ngo.foodTypesAccepted
    : typeof ngo.foodTypesAccepted === 'string'
    ? [ngo.foodTypesAccepted]
    : ['cooked', 'packaged'];

  const effectiveDistance = ngo.distanceKm ? `${ngo.distanceKm} km` : distanceText;
  const directionsUrl = ngo.googleMapsURI || `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;

  return (
    <InfoWindow position={position} onCloseClick={onClose} pixelOffset={[0, -32]}>
      <div className="p-1 max-w-xs text-slate-800 space-y-2.5 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {isFoodBridge ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <FiCheckCircle className="h-3 w-3" />
                  VERIFIED FOODBRIDGE NGO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                  NEARBY NGO
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-sm text-[#1A312C] leading-snug">{ngoName}</h4>
          </div>
        </div>

        {/* Address & Contact & Distance */}
        <div className="text-xs space-y-1">
          <p className="text-slate-600 font-medium leading-normal">{ngo.address || 'Address not listed'}</p>
          {ngo.phone && (
            <p className="text-slate-600 font-medium flex items-center gap-1">
              <FiPhone className="h-3 w-3 text-emerald-600" />
              <span>{ngo.phone}</span>
            </p>
          )}
          {effectiveDistance && (
            <div className="inline-flex items-center gap-1 text-[#047857] font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <FiNavigation className="h-3 w-3" />
              <span>Distance: {effectiveDistance}</span>
            </div>
          )}
        </div>

        {/* Details */}
        {isFoodBridge ? (
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
        ) : (
          <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">Community Organization</span>
            {ngo.rating ? (
              <span className="text-amber-600 font-bold">★ {ngo.rating} {ngo.reviews ? `(${ngo.reviews})` : ''}</span>
            ) : null}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {onGetRoute ? (
            <Button
              size="sm"
              onClick={() => onGetRoute(ngo)}
              className="flex-1 gap-1 text-xs py-1.5 bg-[#047857] hover:bg-[#065F46] text-white"
            >
              <FiNavigation className="h-3.5 w-3.5" />
              <span>Route</span>
            </Button>
          ) : (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1 text-xs py-1.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-lg transition"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              <span>Directions</span>
            </a>
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
