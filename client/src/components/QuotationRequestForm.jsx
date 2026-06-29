import { useEffect, useState } from "react";
import { getVendors } from "../api/client";

export default function QuotationRequestForm({ onSubmit, onCancel, submitting, serverError }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vendors, setVendors] = useState([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getVendors({ status: "active" }).then(setVendors);
  }, []);

  function toggleVendor(id) {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
    if (errors.vendor_ids) setErrors((e) => ({ ...e, vendor_ids: null }));
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = {};
    if (!title.trim()) e.title = "Quotation title is required.";
    if (selectedVendorIds.length === 0) e.vendor_ids = "Select at least one vendor to send this request to.";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      onSubmit({ title, description, vendor_ids: selectedVendorIds });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <div className="banner-error">{serverError}</div>}

      <div className="form-group">
        <label className="form-label">Quotation Title</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Office Furniture - Q3 Procurement"
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you need quoted — items, quantities, specifications…"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Send To Vendors</label>
        {vendors.length === 0 ? (
          <p className="form-hint">No active vendors available. Add a vendor first.</p>
        ) : (
          <div className="vendor-checklist">
            {vendors.map((v) => (
              <label key={v.id} className="vendor-check-item">
                <input
                  type="checkbox"
                  checked={selectedVendorIds.includes(v.id)}
                  onChange={() => toggleVendor(v.id)}
                />
                <div>
                  <div className="vendor-check-name">{v.company_name}</div>
                  <div className="vendor-check-sub">{v.vendor_name} · {v.email}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.vendor_ids && <div className="form-error">{errors.vendor_ids}</div>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Sending…" : "Create & Send Request"}
        </button>
      </div>
    </form>
  );
}
