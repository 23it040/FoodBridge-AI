import { useEffect, useState, useRef } from 'react';
import donationService from '../../services/donation.service';
import ngoService from '../../services/ngo.service';
import { FiBox, FiShield, FiUsers, FiCheckCircle } from 'react-icons/fi';

const CountUpNumber = ({ endValue, fallbackText }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  const numericVal = typeof endValue === 'number' ? endValue : parseInt(endValue, 10);
  const isValidNumber = !isNaN(numericVal) && numericVal > 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayValue(isValidNumber ? numericVal : 0);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          if (!isValidNumber) return;

          let start = 0;
          const duration = 1500;
          const frameTime = 1000 / 60;
          const totalFrames = Math.round(duration / frameTime);
          let frame = 0;

          const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const current = Math.floor(numericVal * Math.sin((progress * Math.PI) / 2));
            
            if (frame >= totalFrames) {
              setDisplayValue(numericVal);
              clearInterval(counter);
            } else {
              setDisplayValue(current);
            }
          }, frameTime);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [endValue, isValidNumber, numericVal, hasAnimated]);

  return (
    <span ref={ref}>
      {isValidNumber ? `${displayValue}+` : fallbackText}
    </span>
  );
};

const MetricStrip = () => {
  const [counts, setCounts] = useState({
    donations: 0,
    ngos: 0,
    donors: 0,
    pickups: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const donList = await donationService.listDonations({ page: 1, limit: 100 });
        const ngoRes = await ngoService.getNgosForMap();
        const ngoList = Array.isArray(ngoRes) ? ngoRes : Array.isArray(ngoRes?.data) ? ngoRes.data : [];
        
        setCounts({
          donations: Array.isArray(donList) ? donList.length : 0,
          ngos: Array.isArray(ngoList) ? ngoList.length : 0,
          donors: Array.isArray(donList) ? new Set(donList.map(d => d.donor || d.donorId)).size : 0,
          pickups: Array.isArray(donList) ? donList.filter(d => d.status === 'COMPLETED' || d.status === 'ACCEPTED').length : 0
        });
      } catch (err) {
        console.warn('Metrics fetch error:', err);
      }
    };

    fetchMetrics();
  }, []);

  const metrics = [
    {
      label: 'ACTIVE NETWORK',
      numeric: counts.donations,
      fallbackText: '10,000+ Items',
      subtitle: 'Surplus food items listed',
      icon: <FiBox className="h-5 w-5 text-[#B86F5B]" />,
      iconBg: 'bg-[#F1DED7]'
    },
    {
      label: 'PARTNER NGOS',
      numeric: counts.ngos,
      fallbackText: '150+ Verified',
      subtitle: 'Registered non-profit partners',
      icon: <FiShield className="h-5 w-5 text-[#7D9588]" />,
      iconBg: 'bg-[#E2EBE5]'
    },
    {
      label: 'COMMUNITY DONORS',
      numeric: counts.donors,
      fallbackText: '500+ Donors',
      subtitle: 'Restaurants & event hubs',
      icon: <FiUsers className="h-5 w-5 text-[#7196A3]" />,
      iconBg: 'bg-[#EAF2F4]'
    },
    {
      label: 'FOOD PICKUPS',
      numeric: counts.pickups,
      fallbackText: '2,500+ Pickups',
      subtitle: 'Completed redistributions',
      icon: <FiCheckCircle className="h-5 w-5 text-[#6F987C]" />,
      iconBg: 'bg-[#E2EBE5]'
    }
  ];

  return (
    <section className="relative z-30 -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white border border-[#E5DED7] p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DED7]">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between ${idx !== 0 ? 'sm:pl-6 pt-4 sm:pt-0' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#73756F]">
                  {item.label}
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconBg} border border-[#E5DED7]`}>
                  {item.icon}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#2E302D] tracking-tight">
                <CountUpNumber endValue={item.numeric} fallbackText={item.fallbackText} />
              </div>
              <p className="text-xs text-[#73756F] font-medium mt-1">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricStrip;
