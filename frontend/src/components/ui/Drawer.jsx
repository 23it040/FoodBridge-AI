import { useEffect } from 'react';

const Drawer = ({ open, onClose, title, children, position = 'right', className = '' }) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const positionStyles = {
    right: 'right-0 top-0 h-full',
    left: 'left-0 top-0 h-full'
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative ml-auto w-full max-w-md ${positionStyles[position]} rounded-l-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-950 ${className}`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="drawer-title" className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Drawer;
