import { useState } from 'react';

const Accordion = ({ items = [], className = '' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={item.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-slate-900"
          >
            <span className="text-base font-semibold">{item.title}</span>
            <span className="text-xl text-slate-400">{openIndex === index ? '−' : '+'}</span>
          </button>
          {openIndex === index && <div className="border-t border-slate-200 px-5 py-4 text-slate-600">{item.content}</div>}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
