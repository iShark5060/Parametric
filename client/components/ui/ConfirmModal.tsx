import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      className="glass-modal-surface max-w-md p-5 shadow-2xl"
      ariaLabelledBy="confirm-delete-title"
    >
      <h3
        id="confirm-delete-title"
        className="text-base font-semibold text-foreground"
      >
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-glass-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-glass-border-hover hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg border border-danger/50 bg-danger/10 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/20"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
