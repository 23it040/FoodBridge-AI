import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHelpCircle,
  FiChevronDown,
  FiSearch,
  FiX,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiMail
} from 'react-icons/fi';

const FAQ_DATA = [
  {
    id: 'food-safety-standards',
    category: 'safety',
    question: 'What food safety and temperature protocols are required for donations?',
    answer:
      'All donated food must be prepared in licensed, sanitary commercial kitchens or clean event facilities. Cooked food must be cooled below 4°C (40°F) within 2 hours or maintained hot above 60°C (140°F) until collection. Items must be labeled with the preparation date, exact time, and known allergens (nuts, dairy, gluten). Food with compromised packaging or past its safe consumption window cannot be listed.',
    tags: ['Safety', 'Temperature', 'Packaging']
  },
  {
    id: 'pickup-logistics',
    category: 'logistics',
    question: 'Who handles the pickup and transportation of donated food?',
    answer:
      'Verified NGOs and community kitchens coordinate collection directly. When an NGO accepts a donation listing, they dispatch insulated vehicles or volunteer teams with food-grade transport containers. Donors receive automated contact details and estimated pickup arrival windows so personnel can facilitate smooth handoff.',
    tags: ['Logistics', 'NGO Delivery', 'Dispatch']
  },
  {
    id: 'ngo-verification-process',
    category: 'ngos',
    question: 'How does FoodBridge verify NGOs and social dining organizations?',
    answer:
      'Every NGO partner must submit government non-profit registration documents, 80G/12A or regional tax-exempt certification, and proof of operational community kitchen or food distribution premises. FoodBridge administrators review and physically/digitally audit each organization before granting claiming permissions.',
    tags: ['Verification', 'Security', 'NGO Partners']
  },
  {
    id: 'donor-legal-liability',
    category: 'legal',
    question: 'Are surplus food donors legally protected from liability?',
    answer:
      'Yes. In most jurisdictions (such as the Bill Emerson Good Samaritan Food Donation Act and international equivalents), businesses, restaurants, and individuals who donate wholesome food in good faith are shielded from civil and criminal liability arising from the nature, age, packaging, or condition of the donated food.',
    tags: ['Legal', 'Good Samaritan', 'Liability']
  },
  {
    id: 'unacceptable-foods',
    category: 'safety',
    question: 'What items CANNOT be redistributed through FoodBridge?',
    answer:
      'For community health and safety, we do not accept: leftover foods from individual dining plates or open unmonitored buffets, unpasteurized milk or dairy, home-canned preserves without batch testing, expired baby formula, and open or unsealed beverages.',
    tags: ['Restrictions', 'Prohibited Items', 'Hygiene']
  },
  {
    id: 'perishable-timeframes',
    category: 'donors',
    question: 'How quickly must cooked or perishable surplus food be claimed?',
    answer:
      'Cooked and perishable listings feature an active shelf-life countdown. NGOs within a 10 km radius receive instant alerts to claim listings within 2 to 4 hours. Donors can also set custom pickup cutoff deadlines matching their operating schedule.',
    tags: ['Time Window', 'Expiry', 'Notifications']
  },
  {
    id: 'donation-tax-receipts',
    category: 'legal',
    question: 'Do food donors receive tax deduction receipts or impact certificates?',
    answer:
      'Yes! Upon successful completion and digital receipt verification by the claiming NGO, donors can download official tax deduction certificates and annual sustainability impact reports detailing total kilograms saved and carbon reductions achieved.',
    tags: ['Tax Deduction', 'ESG Reporting', 'Certificates']
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'safety', label: 'Food Safety & Hygiene' },
  { id: 'donors', label: 'Donors & Businesses' },
  { id: 'ngos', label: 'NGOs & Kitchens' },
  { id: 'legal', label: 'Legal & Verification' },
  { id: 'logistics', label: 'Pickup Logistics' }
];

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIds, setOpenIds] = useState(['food-safety-standards']);

  const toggleQuestion = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_DATA.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <section id="faq" className="py-24 bg-[#FAF7F2] border-b border-[#E5DED7] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-[#E2EBE5]/35 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#F1DED7]/35 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E2EBE5] border border-[#E5DED7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7D9588]">
            <FiHelpCircle className="h-3.5 w-3.5 text-[#B86F5B]" />
            <span>KNOWLEDGE & SAFETY GUIDELINES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2E302D] leading-tight">
            Frequently Asked <br />
            <span className="text-[#B86F5B]">Questions & Policies</span>
          </h2>
          <p className="text-sm font-normal text-[#73756F] max-w-lg mx-auto leading-relaxed">
            Everything donors and verified community partners need to know about food safety, legal protection, and pickup logistics.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          {/* Search Input Bar */}
          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#73756F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword, topic, or safety rules..."
              className="w-full rounded-2xl bg-white border border-[#E5DED7] pl-12 pr-10 py-3.5 text-xs sm:text-sm text-[#2E302D] placeholder-[#73756F] focus:border-[#B86F5B] focus:outline-none shadow-sm transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#73756F] hover:text-[#2E302D] p-1"
                aria-label="Clear search"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#B86F5B] text-white shadow-sm'
                      : 'bg-white border border-[#E5DED7] text-[#73756F] hover:bg-[#FAF7F2] hover:text-[#2E302D]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-white border border-[#E5DED7] overflow-hidden transition-all duration-200 hover:border-[#B86F5B]/40 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F2] border border-[#E5DED7] px-2 py-0.5 text-[10px] font-bold text-[#73756F]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#2E302D]">
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-[#F1DED7] border-[#B86F5B] text-[#B86F5B]'
                          : 'bg-[#FAF7F2] border-[#E5DED7] text-[#73756F]'
                      }`}
                    >
                      <FiChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#FAF7F2] text-xs sm:text-sm text-[#5E625D] leading-relaxed">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl bg-white border border-dashed border-[#E5DED7] p-10 text-center space-y-3">
              <FiAlertCircle className="mx-auto h-8 w-8 text-[#B86F5B]" />
              <h4 className="text-sm font-bold text-[#2E302D]">No matching questions found</h4>
              <p className="text-xs text-[#73756F] max-w-sm mx-auto">
                No results matched &quot;{searchQuery}&quot;. Clear your search or contact our team for assistance.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="inline-flex items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#E5DED7] px-4 py-2 text-xs font-bold text-[#B86F5B] hover:bg-[#F1DED7]"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Support & Contact Callout Banner */}
        <div className="rounded-3xl bg-white border border-[#E5DED7] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE5] text-[#7D9588]">
              <FiShield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2E302D]">
                Need Custom Donation Guidelines or Commercial Support?
              </h4>
              <p className="text-xs text-[#73756F] mt-0.5">
                Our food safety compliance coordinators are available 24/7 to assist large catering halls, hotel chains, and distributors.
              </p>
            </div>
          </div>

          <a
            href="mailto:support@foodbridge.ai"
            className="inline-flex items-center gap-2 shrink-0 rounded-2xl bg-[#2E302D] hover:bg-[#1a1b1a] text-white px-5 py-3 text-xs font-bold transition shadow-sm"
          >
            <FiMail className="h-4 w-4" />
            <span>Contact Support</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
