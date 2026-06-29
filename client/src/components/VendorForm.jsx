import { useState } from "react";

const EMPTY = {
  vendor_name: "",
  company_name: "",
  email: "",
  contact_number: "",
  business_address: "",
  status: "active",
};

export default function VendorForm({ initial, onSubmit, onCancel, submitting, serverError }) {
  const [values, setValues] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!values.vendor_name.trim()) e.vendor_name = "Vendor name is required.";
    if (!values.company_name.trim()) e.company_name = "Company name is required.";
    if (!values.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!values.contact_number.trim()) {
      e.contact_number = "Contact number is required.";
    } else if (!/^[\d+\-\s()]{6,20}$/.test(values.contact_number)) {
      e.contact_number = "Enter a valid contact number.";
    }
    if (!values.business_address.trim()) e.business_address = "Business address is required.";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      {serverError && <div className="banner-error">{serverError}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Vendor Name</label>
          <input
            className="form-input"
            value={values.vendor_name}
            onChange={(e) => update("vendor_name", e.target.value)}
            placeholder="e.g. Arjun Mehta"
          />
          {errors.vendor_name && <div className="form-error">{errors.vendor_name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input
            className="form-input"
            value={values.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            placeholder="e.g. Mehta Industrial Supplies"
          />
          {errors.company_name && <div className="form-error">{errors.company_name}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="vendor@company.com"
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Contact Number</label>
          <input
            className="form-input"
            value={values.contact_number}
            onChange={(e) => update("contact_number", e.target.value)}
            placeholder="+91 98765 43210"
          />
          {errors.contact_number && <div className="form-error">{errors.contact_number}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Business Address</label>
        <textarea
          className="form-textarea"
          value={values.business_address}
          onChange={(e) => update("business_address", e.target.value)}
          placeholder="Street, city, state"
        />
        {errors.business_address && <div className="form-error">{errors.business_address}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={values.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save Changes" : "Add Vendor"}
        </button>
      </div>
    </form>
  );
}
