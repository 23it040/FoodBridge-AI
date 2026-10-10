import { FiHeart } from 'react-icons/fi';

const BrandedLoader = ({ message = 'Loading FoodBridge...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7F2] text-[#292B29] select-none px-4">
      {/* Brand Icon with Warm Glow */}
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3DED6] text-[#BD715C] shadow-[0_4px_25px_rgba(189,113,92,0.2)] border border-[#E6DED6]">
        <FiHeart className="h-8 w-8 animate-pulse text-[#BD715C]" />
      </div>

      {/* Brand Typography */}
      <h1 className="text-2xl font-extrabold tracking-tight text-[#292B29]">
        FoodBridge <span className="text-[#BD715C]">AI</span>
      </h1>
      
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#626760]">
        Sustainable Food Redistribution
      </p>

      {/* Minimal Terracotta Dots Loading Indicator */}
      <div className="mt-6 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#BD715C] animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-[#7D9588] animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-[#BD715C] animate-bounce" />
      </div>

      {message && (
        <span className="mt-3 text-xs font-medium text-[#626760]">{message}</span>
      )}
    </div>
  );
};

export default BrandedLoader;
