import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { getVendors, createVendor, updateVendor, deleteVendor, getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import VendorForm from "../components/VendorForm";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";

export default function Vendors() {
  const { isAdmin } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchVendors = useCallback(() => {
    setLoading(true);
    getVendors({ search: search || undefined, status: statusFilter })
      .then(setVendors)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchVendors, 250); // debounce search
    return () => clearTimeout(t);
  }, [fetchVendors]);

  async function handleAdd(values) {
    setSubmitting(true);
    setServerError("");
    try {
      await createVendor(values);
      setShowAddModal(false);
      fetchVendors();
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(values) {
    setSubmitting(true);
    setServerError("");
    try {
      await updateVendor(editingVendor.id, values);
      setEditingVendor(null);
      fetchVendors();
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteVendor(deletingVendor.id);
      setDeletingVendor(null);
      fetchVendors();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Vendors</h1>
          <p>Manage the vendors your organization works with — their contact details, status, and quotation history.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            placeholder="Search by name, company, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading vendors…</div>
      ) : vendors.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <Building2 size={28} color="var(--color-text-faint)" style={{ marginBottom: 10 }} />
            <h3>No vendors found</h3>
            <p>{search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Add your first vendor to get started."}</p>
            {!search && statusFilter === "all" && (
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Vendor
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Company</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td className="cell-primary">{v.vendor_name}</td>
                  <td>{v.company_name}</td>
                  <td className="cell-muted">{v.email}</td>
                  <td className="cell-muted">{v.contact_number}</td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setEditingVendor(v)}
                        aria-label={`Edit ${v.vendor_name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeletingVendor(v)}
                          aria-label={`Delete ${v.vendor_name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="Add Vendor" onClose={() => { setShowAddModal(false); setServerError(""); }}>
          <VendorForm
            onSubmit={handleAdd}
            onCancel={() => { setShowAddModal(false); setServerError(""); }}
            submitting={submitting}
            serverError={serverError}
          />
        </Modal>
      )}

      {editingVendor && (
        <Modal title="Edit Vendor" onClose={() => { setEditingVendor(null); setServerError(""); }}>
          <VendorForm
            initial={editingVendor}
            onSubmit={handleEdit}
            onCancel={() => { setEditingVendor(null); setServerError(""); }}
            submitting={submitting}
            serverError={serverError}
          />
        </Modal>
      )}

      {deletingVendor && (
        <ConfirmDialog
          title="Delete Vendor"
          message={`Are you sure you want to delete '${deletingVendor.company_name}'? This will also remove all of their quotation history. This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingVendor(null)}
        />
      )}
    </div>
  );
}
