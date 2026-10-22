import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiSliders,
  FiHeart,
  FiDroplet,
  FiCloud,
  FiTrash2,
  FiArrowRight,
  FiAward,
  FiCheckCircle
} from 'react-icons/fi';

const PRESETS = [
  { label: 'Small Gathering', meals: 25, hint: 'Family or small party surplus' },
  { label: 'Restaurant Evening', meals: 60, hint: 'Daily restaurant kitchen surplus' },
  { label: 'Wedding / Banquet', meals: 180, hint: 'Catering & large celebration' },
  { label: 'Corporate Cafeteria', meals: 450, hint: 'Office campus / conference' }
];

const CATEGORIES = [
  { id: 'cooked', label: 'Cooked Meals', co2Factor: 2.1, waterFactor: 160, weightKgFactor: 0.48 },
  { id: 'produce', label: 'Fresh Produce', co2Factor: 1.4, waterFactor: 110, weightKgFactor: 0.42 },
  { id: 'bakery', label: 'Bakery & Grains', co2Factor: 1.6, waterFactor: 135, weightKgFactor: 0.38 },
  { id: 'packaged', label: 'Packaged Food', co2Factor: 1.9, waterFactor: 145, weightKgFactor: 0.44 }
];

const ImpactCalculator = () => {
  const [mealCount, setMealCount] = useState(80);
  const [selectedCategory, setSelectedCategory] = useState('cooked');

  const activeCategory = useMemo(() => {
    return CATEGORIES.find((cat) => cat.id === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  const metrics = useMemo(() => {
    const meals = Number(mealCount) || 0;
    const co2Kg = Math.round(meals * activeCategory.co2Factor);
    const waterLiters = Math.round(meals * activeCategory.waterFactor);
    const wasteDivertedKg = Math.round(meals * activeCategory.weightKgFactor);
    const treeEquivalent = (co2Kg / 22).toFixed(1); // 1 mature tree absorbs ~22kg CO2/year
    const carKmEquivalent = Math.round(co2Kg * 4.2); // ~0.24kg CO2 per passenger car km

    return {
      meals,
      co2Kg,
      waterLiters,
      wasteDivertedKg,
      treeEquivalent,
      carKmEquivalent
    };
  }, [mealCount, activeCategory]);

  return (
    <section id="impact-calculator" className="py-24 bg-[#FAF7F2] border-b border-[#E5DED7] relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-[#F1DED7]/35 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 right-10 w-[420px] h-[300px] bg-[#E2EBE5]/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E2EBE5] border border-[#E5DED7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7D9588]">
            <FiSliders className="h-3.5 w-3.5 text-[#B86F5B]" />
            <span>INTERACTIVE FOOD WASTE CALCULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2E302D] leading-tight">
            See the Difference <br />
            <span className="text-[#B86F5B]">Your Surplus Food Makes</span>
          </h2>
          <p className="text-sm font-normal text-[#73756F] max-w-xl mx-auto leading-relaxed">
            Adjust the slider to discover how many meals can be provided and how much environmental damage is averted when food is redistributed instead of discarded.
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="rounded-3xl bg-white border border-[#E5DED7] shadow-xl p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Controls Column (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#73756F] block mb-3">
                  Quick Event Presets
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRESETS.map((preset) => {
                    const isSelected = mealCount === preset.meals;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setMealCount(preset.meals)}
                        className={`text-left p-3 rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#F1DED7] border-[#B86F5B] shadow-sm'
                            : 'bg-[#FAF7F2] border-[#E5DED7] hover:border-[#B86F5B]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#B86F5B]' : 'text-[#2E302D]'}`}>
                            {preset.label}
                          </span>
                          {isSelected && <FiCheckCircle className="h-3.5 w-3.5 text-[#B86F5B]" />}
                        </div>
                        <span className="text-[11px] font-semibold text-[#73756F] block mt-0.5">
                          ~{preset.meals} servings
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#73756F] block mb-3">
                  Surplus Food Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                          isSelected
                            ? 'bg-[#E2EBE5] border-[#7D9588] text-[#7D9588] shadow-sm'
                            : 'bg-white border-[#E5DED7] text-[#73756F] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meal Count Range Slider */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#73756F]">
                    Estimated Servings / Meals
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DED7]">
                    <span className="text-lg font-black text-[#B86F5B]">{mealCount}</span>
                    <span className="text-xs font-semibold text-[#73756F]">meals</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={mealCount}
                  onChange={(e) => setMealCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#E5DED7] rounded-lg appearance-none cursor-pointer accent-[#B86F5B]"
                />

                <div className="flex justify-between text-[11px] text-[#73756F] font-semibold">
                  <span>5 meals</span>
                  <span>250 meals</span>
                  <span>500 meals</span>
                  <span>1,000+ meals</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5DED7] flex flex-col sm:flex-row gap-3">
                <Link
                  to="/donor/donate"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#B86F5B] hover:bg-[#a05f4d] text-white px-5 py-3 text-xs font-bold tracking-wide shadow-md transition-all duration-200"
                >
                  <span>Donate This Surplus</span>
                  <FiArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#live-discovery"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] hover:bg-[#E2EBE5] text-[#2E302D] px-4 py-3 text-xs font-bold transition-colors"
                >
                  Locate NGOs
                </a>
              </div>
            </div>

            {/* Right Metrics Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Metric 1: Meals Fed */}
                <motion.div
                  key={`meals-${metrics.meals}`}
                  initial={{ scale: 0.96, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] p-6 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#73756F]">
                      NOURISHMENT
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-[#F1DED7] text-[#B86F5B] flex items-center justify-center">
                      <FiHeart className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#2E302D] tracking-tight">
                    {metrics.meals.toLocaleString()}
                  </div>
                  <p className="text-xs text-[#73756F] font-medium leading-relaxed">
                    Wholesome meals delivered to families and individuals experiencing food insecurity.
                  </p>
                </motion.div>

                {/* Metric 2: CO2 Averted */}
                <motion.div
                  key={`co2-${metrics.co2Kg}`}
                  initial={{ scale: 0.96, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] p-6 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#73756F]">
                      EMISSIONS AVERTED
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-[#E2EBE5] text-[#7D9588] flex items-center justify-center">
                      <FiCloud className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#2E302D] tracking-tight">
                    {metrics.co2Kg.toLocaleString()} <span className="text-base font-bold text-[#7D9588]">kg CO₂e</span>
                  </div>
                  <p className="text-xs text-[#73756F] font-medium leading-relaxed">
                    Greenhouse gases prevented by avoiding methane-heavy landfill decomposition.
                  </p>
                </motion.div>

                {/* Metric 3: Water Saved */}
                <motion.div
                  key={`water-${metrics.waterLiters}`}
                  initial={{ scale: 0.96, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] p-6 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#73756F]">
                      WATER PRESERVED
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-[#EAF2F4] text-[#7196A3] flex items-center justify-center">
                      <FiDroplet className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#2E302D] tracking-tight">
                    {metrics.waterLiters.toLocaleString()} <span className="text-base font-bold text-[#7196A3]">Liters</span>
                  </div>
                  <p className="text-xs text-[#73756F] font-medium leading-relaxed">
                    Embedded water resources conserved across agricultural and distribution lifecycles.
                  </p>
                </motion.div>

                {/* Metric 4: Landfill Waste Diverted */}
                <motion.div
                  key={`waste-${metrics.wasteDivertedKg}`}
                  initial={{ scale: 0.96, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] p-6 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#73756F]">
                      ORGANIC WASTE DIVERTED
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-[#F4EFEA] text-[#8C7A6B] flex items-center justify-center">
                      <FiTrash2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#2E302D] tracking-tight">
                    {metrics.wasteDivertedKg.toLocaleString()} <span className="text-base font-bold text-[#8C7A6B]">kg</span>
                  </div>
                  <p className="text-xs text-[#73756F] font-medium leading-relaxed">
                    Solid edible food rescued from municipal waste streams into community dining.
                  </p>
                </motion.div>

              </div>

              {/* Environmental Equivalence Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#E2EBE5]/70 to-[#F1DED7]/70 border border-[#E5DED7] p-5 flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7D9588] shadow-xs">
                  <FiAward className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E302D]">
                    Real-World Equivalency
                  </h4>
                  <p className="text-xs text-[#5E625D] leading-relaxed">
                    Redistributing this surplus equates to planting <strong className="text-[#2E302D]">{metrics.treeEquivalent} mature trees</strong> or taking <strong className="text-[#2E302D]">{metrics.carKmEquivalent.toLocaleString()} km</strong> of gasoline vehicle driving off our roads.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactCalculator;
