import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ open, onClose, title, children, footer, className = '' }) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#292B29]/60 backdrop-blur-md p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl border border-[#E6DED6] transition-all duration-300 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#E6DED6]/60 pb-3">
          <h2 id="modal-title" className="text-lg font-extrabold text-[#292B29]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#626760] transition hover:bg-[#F3DED6] hover:text-[#BD715C]"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 border-t border-[#E6DED6]/60 pt-4 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
