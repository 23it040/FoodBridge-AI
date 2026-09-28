import { useEffect, useState } from 'react';
import donationService from '../../services/donation.service';
import ngoService from '../../services/ngo.service';
import { FiBox, FiShield, FiUsers, FiCheckCircle } from 'react-icons/fi';

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
      label: 'MEALS REDISTRIBUTED',
      value: counts.donations > 0 ? `${counts.donations}+` : 'Active Network',
      subtitle: 'Surplus food items listed',
      icon: <FiBox className="h-5 w-5 text-[#79D6B2]" />
    },
    {
      label: 'PARTNER NGOs',
      value: counts.ngos > 0 ? `${counts.ngos}+` : 'Verified Network',
      subtitle: 'Registered non-profit partners',
      icon: <FiShield className="h-5 w-5 text-[#79D6B2]" />
    },
    {
      label: 'ACTIVE DONORS',
      value: counts.donors > 0 ? `${counts.donors}+` : 'Community Donors',
      subtitle: 'Restaurants & event hubs',
      icon: <FiUsers className="h-5 w-5 text-[#79D6B2]" />
    },
    {
      label: 'FOOD PICKUPS',
      value: counts.pickups > 0 ? `${counts.pickups}+` : 'Direct Delivery',
      subtitle: 'Completed redistributions',
      icon: <FiCheckCircle className="h-5 w-5 text-[#79D6B2]" />
    }
  ];

  return (
    <section className="relative z-20 py-8 bg-[#0D2222]/90 backdrop-blur-lg border-y border-white/10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-panel p-5 shadow-xl transition-all duration-300 hover:border-[#79D6B2]/40 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#79D6B2]">
                  {item.label}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#79D6B2]/15 border border-[#79D6B2]/30">
                  {item.icon}
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {item.value}
              </div>
              <p className="text-xs text-[#D7E0DC] font-medium mt-1">
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
