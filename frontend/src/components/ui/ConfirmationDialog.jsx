import Modal from './Modal';

const ConfirmationDialog = ({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    footer={
      <div className="flex flex-wrap gap-3">
        <button onClick={onCancel} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
          {cancelLabel}
        </button>
        <button onClick={onConfirm} className="rounded-full bg-danger px-5 py-3 text-sm font-semibold text-white hover:bg-red-700">
          {confirmLabel}
        </button>
      </div>
    }
  >
    <div className="space-y-4">
      {description && <p className="text-sm text-slate-600">{description}</p>}
    </div>
  </Modal>
);

export default ConfirmationDialog;
