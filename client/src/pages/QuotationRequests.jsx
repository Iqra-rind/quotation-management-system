import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Trash2, ChevronRight, Search } from "lucide-react";
import { getQuotationRequests, createQuotationRequest, deleteQuotationRequest, getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import QuotationRequestForm from "../components/QuotationRequestForm";
import ConfirmDialog from "../components/ConfirmDialog";

export default function QuotationRequests() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchRequests = useCallback(() => {
    setLoading(true);
    getQuotationRequests({ search: search || undefined, status: statusFilter })
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchRequests, 250); // debounce search
    return () => clearTimeout(t);
  }, [fetchRequests]);

  async function handleAdd(values) {
    setSubmitting(true);
    setServerError("");
    try {
      const created = await createQuotationRequest(values);
      setShowAddModal(false);
      navigate(`/quotation-requests/${created.id}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteQuotationRequest(deletingRequest.id);
      setDeletingRequest(null);
      fetchRequests();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Quotation Requests</h1>
          <p>Create requests for quotations and send them to one or more vendors, then compare what comes back.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All requests</option>
          <option value="pending">Has pending responses</option>
          <option value="submitted">Has submitted responses</option>
          <option value="approved">Has approved quotation</option>
          <option value="rejected">Has rejected quotation</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading quotation requests…</div>
      ) : requests.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <FileText size={28} color="var(--color-text-faint)" style={{ marginBottom: 10 }} />
            <h3>No quotation requests {search || statusFilter !== "all" ? "found" : "yet"}</h3>
            <p>
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Create a request and send it to your vendors to start collecting quotations."}
            </p>
            {!search && statusFilter === "all" && (
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> New Request
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Vendors</th>
                <th>Submitted</th>
                <th>Pending</th>
                <th>Approved</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/quotation-requests/${r.id}`)}>
                  <td>
                    <div className="cell-primary">{r.title}</div>
                    {r.description && (
                      <div className="cell-muted" style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td>{r.vendor_count}</td>
                  <td>{r.submitted_count}</td>
                  <td>{r.pending_count}</td>
                  <td>{r.approved_count}</td>
                  <td>
                    <div className="row-actions">
                      {isAdmin && (
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={(e) => { e.stopPropagation(); setDeletingRequest(r); }}
                          aria-label={`Delete ${r.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" aria-label="View">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="New Quotation Request" onClose={() => { setShowAddModal(false); setServerError(""); }} width={560}>
          <QuotationRequestForm
            onSubmit={handleAdd}
            onCancel={() => { setShowAddModal(false); setServerError(""); }}
            submitting={submitting}
            serverError={serverError}
          />
        </Modal>
      )}

      {deletingRequest && (
        <ConfirmDialog
          title="Delete Quotation Request"
          message={`Are you sure you want to delete '${deletingRequest.title}'? All associated vendor quotations will also be removed. This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingRequest(null)}
        />
      )}
    </div>
  );
}
