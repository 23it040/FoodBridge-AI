import { FiHeart } from 'react-icons/fi';

const BrandedLoader = ({ message = 'Loading FoodBridge...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A1A1A] text-white select-none px-4">
      {/* Brand Icon with Pulsing Mint Glow */}
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102A2A] text-[#79D6B2] shadow-[0_0_35px_rgba(121,214,178,0.25)] border border-[#79D6B2]/30">
        <FiHeart className="h-8 w-8 animate-pulse text-[#79D6B2]" />
      </div>

      {/* Brand Typography */}
      <h1 className="text-2xl font-extrabold tracking-tight text-white">
        FoodBridge <span className="text-[#79D6B2]">AI</span>
      </h1>
      
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#A7B8B3]/80">
        Sustainable Food Redistribution
      </p>

      {/* Minimal Mint Dots Loading Indicator */}
      <div className="mt-6 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#79D6B2] animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-[#79D6B2] animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-[#79D6B2] animate-bounce" />
      </div>

      {message && (
        <span className="mt-3 text-xs font-medium text-[#A7B8B3]/70">{message}</span>
      )}
    </div>
  );
};

export default BrandedLoader;
