const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "var(--color-status-pending-bg)", text: "var(--color-status-pending-text)" },
  submitted: { label: "Submitted", bg: "var(--color-status-submitted-bg)", text: "var(--color-status-submitted-text)" },
  approved: { label: "Approved", bg: "var(--color-status-approved-bg)", text: "var(--color-status-approved-text)" },
  rejected: { label: "Rejected", bg: "var(--color-status-rejected-bg)", text: "var(--color-status-rejected-text)" },
  active: { label: "Active", bg: "var(--color-status-approved-bg)", text: "var(--color-status-approved-text)" },
  inactive: { label: "Inactive", bg: "var(--color-status-pending-bg)", text: "var(--color-status-pending-text)" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        background: config.bg,
        color: config.text,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}
