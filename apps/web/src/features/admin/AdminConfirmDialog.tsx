import { AlertTriangle } from "lucide-react";

type AdminConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function AdminConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: AdminConfirmDialogProps) {
  return (
    <div className="modal-backdrop">
      <section
        className="admin-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        aria-describedby="admin-dialog-description"
      >
        <div className="dialog-heading">
          <span className="dialog-icon" aria-hidden="true">
            <AlertTriangle size={19} />
          </span>
          <div>
            <h2 id="admin-dialog-title">{title}</h2>
            <p id="admin-dialog-description">{description}</p>
          </div>
        </div>
        <div className="dialog-actions">
          <button
            className="secondary-button"
            type="button"
            autoFocus
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdminConfirmDialog;
