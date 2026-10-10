import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmationDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'default',
  children
}) => {
  const isDanger = variant === 'danger' || variant === 'destructive';

  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      className="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 text-xs"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            className={`px-5 py-2 text-xs ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white border-none'
                : ''
            }`}
          >
            {loading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 font-sans">
        {description && <p className="text-xs text-[#626760] font-medium leading-relaxed">{description}</p>}
        {children}
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
