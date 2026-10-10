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
    <div className="flex flex-col justify-between rounded-[24px] border border-[#E6DED6] bg-white/90 backdrop-blur-md p-5 shadow-card hover:border-[#BD715C]/40 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex justify-start">
          <Badge variant="terracotta" className="text-[10px]">📍 NEARBY NGO</Badge>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#292B29]">{ngo.name}</h3>
          <p className="text-sm text-[#626760] font-medium line-clamp-2">{ngo.address}</p>
        </div>

        <div className="text-sm font-semibold text-[#292B29] flex items-center gap-2">
          <FiMapPin className="text-[#BD715C]" />
          <span>{ngo.distanceKm != null ? `${ngo.distanceKm} km away` : 'Distance unknown'}</span>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-[#626760]">
          {ngo.rating != null && (
            <div className="flex items-center gap-1">
              <FiStar className="text-amber-500 fill-amber-500" />
              <span>{ngo.rating} {ngo.reviews ? `(${ngo.reviews})` : ''}</span>
            </div>
          )}
          {ngo.phone && (
            <div className="flex items-center gap-1">
              <FiPhone className="text-[#BD715C]" />
              <span>{ngo.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-2 bg-[#FAF7F2] border border-[#E6DED6] p-3 rounded-xl flex items-start gap-2 text-[#626760] text-xs font-medium">
          <FiInfo className="shrink-0 mt-0.5 text-[#BD715C]" />
          <p>Capacity information unavailable. Contact NGO to confirm donation capacity.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button variant="outline" size="sm" onClick={handleOpenMap} className="w-full text-[#626760] border-[#E6DED6] hover:bg-[#FAF7F2]">
          <FiExternalLink className="mr-1" /> Google Maps
        </Button>
        {ngo.phone ? (
          <Button size="sm" onClick={() => window.open(`tel:${ngo.phone.replace(/[^0-9+]/g, '')}`, '_self')} className="w-full">
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
