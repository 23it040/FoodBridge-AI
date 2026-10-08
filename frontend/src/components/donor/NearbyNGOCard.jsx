import React from 'react';
import { FiMapPin, FiPhone, FiStar, FiExternalLink, FiInfo } from 'react-icons/fi';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const NearbyNGOCard = ({ ngo, donationLocation }) => {
  const mapUrl = ngo.googleMapsURI || ngo.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${ngo.latitude || ngo.lat},${ngo.longitude || ngo.lng}`;
  
  const handleOpenMap = () => {
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex justify-start">
          <Badge variant="warning" className="text-[10px]">📍 NEARBY NGO</Badge>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1A312C]">{ngo.name}</h3>
          <p className="text-sm text-slate-500 font-medium line-clamp-2">{ngo.address}</p>
        </div>

        <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <FiMapPin className="text-amber-600" />
          <span>{ngo.distanceKm != null ? `${ngo.distanceKm} km away` : 'Distance unknown'}</span>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {ngo.rating != null && (
            <div className="flex items-center gap-1">
              <FiStar className="text-amber-500 fill-amber-500" />
              <span>{ngo.rating} {ngo.reviews ? `(${ngo.reviews})` : ''}</span>
            </div>
          )}
          {ngo.phone && (
            <div className="flex items-center gap-1">
              <FiPhone className="text-amber-600" />
              <span>{ngo.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-2 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-amber-800 text-xs font-medium">
          <FiInfo className="shrink-0 mt-0.5 text-amber-600" />
          <p>Capacity information unavailable. Contact NGO to confirm donation capacity.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button variant="outline" size="sm" onClick={handleOpenMap} className="w-full text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-800">
          <FiExternalLink className="mr-1" /> Google Maps
        </Button>
        {ngo.phone ? (
          <Button variant="secondary" size="sm" onClick={() => window.open(`tel:${ngo.phone.replace(/[^0-9+]/g, '')}`, '_self')} className="w-full !bg-amber-100 !text-amber-900 hover:!bg-amber-200 !border-amber-300">
            <FiPhone className="mr-1" /> Call NGO
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default NearbyNGOCard;
