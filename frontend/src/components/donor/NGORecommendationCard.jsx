import React from 'react';
import { FiMapPin, FiInfo, FiCheckCircle, FiXCircle, FiActivity, FiAward, FiShield } from 'react-icons/fi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const formatMatchScore = (score) => {
  if (score === undefined || score === null) return '0%';
  const val = Number(score);
  if (isNaN(val)) return '0%';
  if (val <= 1.0 && val > 0) return `${Math.round(val * 100)}%`;
  return `${Math.round(val)}%`;
};

const NGORecommendationCard = ({ ngo, rank, donation, onViewOnMap, onViewDetails }) => {
  const numericScore = Number(ngo.matchScore || 0);
  const isHighMatch = numericScore >= 0.8 || numericScore >= 80;
  const isMedMatch = numericScore >= 0.5 || numericScore >= 50;
  const scoreVariant = isHighMatch ? 'success' : isMedMatch ? 'warning' : 'default';

  return (
    <div className="flex flex-col justify-between rounded-[24px] border border-[#E6DED6] bg-white/90 backdrop-blur-md p-5 shadow-card hover:border-[#BD715C]/40 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Badge variant="terracotta" className="text-[10px]">Rank #{rank}</Badge>
          {ngo.verified ? (
            <Badge variant="sage" className="text-[10px] flex items-center gap-1">
              <FiShield className="h-3 w-3" /> VERIFIED FOODBRIDGE
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px]">NEARBY NGO</Badge>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#292B29]">{ngo.ngoName || ngo.name}</h3>
          {ngo.city && <p className="text-sm text-[#626760] font-medium">{ngo.city}</p>}
        </div>

        {(ngo.matchScore !== undefined && ngo.matchScore !== null) && (
          <div className="flex justify-between items-center bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DED6]">
            <div className="flex items-center gap-2">
              <FiAward className="h-4 w-4 text-[#BD715C]" />
              <span className="text-xs font-bold text-[#292B29] uppercase">Match Score</span>
            </div>
            <Badge variant={scoreVariant}>{formatMatchScore(ngo.matchScore)}</Badge>
          </div>
        )}

        <div className="text-sm font-semibold text-[#292B29] flex items-center gap-2">
          <FiMapPin className="text-[#BD715C]" />
          <span>{ngo.distanceKm != null ? `${ngo.distanceKm} km away` : 'Distance unknown'}</span>
        </div>

        <div className="space-y-2 text-xs">
          {ngo.capacityMatch === true ? (
             <div className="text-emerald-700 font-medium flex items-start gap-1.5">
               <FiCheckCircle className="mt-0.5 shrink-0" />
               <div>
                 <span className="block font-bold">Capacity Compatible</span>
                 <span className="opacity-80">Available: {ngo.availableCapacity} / Your Donation: {donation?.quantity}</span>
               </div>
             </div>
          ) : ngo.capacityMatch === false ? (
             <div className="text-red-600 font-medium flex items-start gap-1.5">
               <FiXCircle className="mt-0.5 shrink-0" />
               <div>
                 <span className="block font-bold">Insufficient Capacity</span>
                 <span className="opacity-80">Available: {ngo.availableCapacity} / Your Donation: {donation?.quantity}</span>
               </div>
             </div>
          ) : (
             <div className="text-slate-500 font-medium flex items-start gap-1.5">
               <FiInfo className="mt-0.5 shrink-0" />
               <span>Capacity information unavailable</span>
             </div>
          )}

          {ngo.categoryMatch === true ? (
             <div className="text-emerald-700 font-medium flex items-center gap-1.5">
               <FiCheckCircle /> <span>Category Accepted</span>
             </div>
          ) : ngo.categoryMatch === false ? (
             <div className="text-red-600 font-medium flex items-center gap-1.5">
               <FiXCircle /> <span>Category Not Accepted</span>
             </div>
          ) : (
             <div className="text-slate-500 font-medium flex items-center gap-1.5">
               <FiInfo /> <span>Category compatibility unknown</span>
             </div>
          )}

          {ngo.currentWorkload != null && (
            <div className="text-amber-700 font-medium flex items-center gap-1.5 pt-1">
              <FiActivity /> <span>Current Workload: {ngo.currentWorkload} active requests</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" onClick={() => onViewOnMap?.(ngo)} className="w-full">
          View on Map
        </Button>
        <Button variant="primary" size="sm" onClick={() => onViewDetails?.(ngo)} className="w-full">
          View Details
        </Button>
      </div>
    </div>
  );
};

export default NGORecommendationCard;
