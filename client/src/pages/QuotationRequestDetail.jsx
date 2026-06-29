import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Check, X, Award } from "lucide-react";
import {
  getQuotationRequest,
  submitQuotation,
  updateQuotationStatus,
  getQuotationPdfUrl,
  getErrorMessage,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import "./QuotationRequestDetail.css";

export default function QuotationRequestDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingFor, setSubmittingFor] = useState(null); // quotation object being responded to
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchRequest = useCallback(() => {
    setLoading(true);
    getQuotationRequest(id).then(setRequest).finally(() => setLoading(false));
  }, [id]);

  useEffect(fetchRequest, [fetchRequest]);

  const lowestSubmittedAmount = request
    ? Math.min(
        ...request.quotations
          .filter((q) => q.quotation_amount != null)
          .map((q) => q.quotation_amount),
        Infinity
      )
    : Infinity;

  async function handleSubmitQuotation(ev) {
    ev.preventDefault();
    setSaving(true);
    setServerError("");
    try {
      await submitQuotation(submittingFor.id, { quotation_amount: parseFloat(amount), notes });
      setSubmittingFor(null);
      setAmount("");
      setNotes("");
      fetchRequest();
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(quotationId, status) {
    try {
      await updateQuotationStatus(quotationId, status);
      fetchRequest();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  if (loading) return <div className="loading-state">Loading quotation request…</div>;
  if (!request) return <div className="loading-state">Quotation request not found.</div>;

  return (
    <div>
      <Link to="/quotation-requests" className="back-link">
        <ArrowLeft size={15} /> All Quotation Requests
      </Link>

      <div className="page-header">
        <div>
          <h1>{request.title}</h1>
          {request.description && <p>{request.description}</p>}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Submission Date</th>
              <th>Notes</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {request.quotations.map((q) => {
              const isBestValue =
                q.quotation_amount != null &&
                q.quotation_amount === lowestSubmittedAmount &&
                q.status !== "rejected";
              return (
                <tr key={q.id} className={isBestValue ? "row-highlight" : ""}>
                  <td>
                    <div className="cell-primary">{q.company_name}</div>
                    <div className="cell-muted">{q.vendor_name}</div>
                  </td>
                  <td className="tabular">
                    {q.quotation_amount != null ? (
                      <>
                        Rs. {Number(q.quotation_amount).toLocaleString()}
                        {isBestValue && (
                          <span className="best-value-tag">
                            <Award size={11} /> Best Value
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </td>
                  <td className="cell-muted">{q.submission_date || "—"}</td>
                  <td className="cell-muted" style={{ maxWidth: 220 }}>
                    {q.notes || "—"}
                  </td>
                  <td>
                    <StatusBadge status={q.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      {q.status === "pending" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setSubmittingFor(q); setAmount(""); setNotes(""); setServerError(""); }}
                        >
                          Submit Response
                        </button>
                      )}
                      {q.status === "submitted" && (
                        isAdmin ? (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleStatusChange(q.id, "approved")}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleStatusChange(q.id, "rejected")}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="cell-muted" style={{ fontSize: 12 }}>Awaiting admin review</span>
                        )
                      )}
                      {q.quotation_amount != null && (
                        <a
                          className="btn btn-ghost btn-icon btn-sm"
                          href={getQuotationPdfUrl(q.id)}
                          download
                          aria-label="Download PDF"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {submittingFor && (
        <Modal title={`Submit Quotation — ${submittingFor.company_name}`} onClose={() => setSubmittingFor(null)} width={440}>
          <form onSubmit={handleSubmitQuotation}>
            {serverError && <div className="banner-error">{serverError}</div>}
            <div className="form-group">
              <label className="form-label">Quotation Amount (Rs.)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 285000"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Warranty terms, delivery timeline, etc."
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setSubmittingFor(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Submitting…" : "Submit Quotation"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
