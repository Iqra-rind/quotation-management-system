import Modal from "./Modal";

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, lineHeight: 1.5, margin: "0 0 4px" }}>
        {message}
      </p>
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className={danger ? "btn btn-primary" : "btn btn-primary"} style={danger ? { background: "var(--color-status-rejected-text)" } : {}} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
