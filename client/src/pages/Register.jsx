import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import "./Auth.css";

const EMPTY = { name: "", email: "", password: "", role: "member" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(values);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">VQ</div>
          <div className="auth-brand-text">
            <span className="auth-brand-title">Vendor & Quotation</span>
            <span className="auth-brand-sub">Management System</span>
          </div>
        </div>

        <h1 className="auth-heading">Create an account</h1>
        <p className="auth-subheading">Get access to the vendor &amp; quotation workspace.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="banner-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Asha Verma"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={values.role}
              onChange={(e) => update("role", e.target.value)}
            >
              <option value="member">Member — view, create, submit quotations</option>
              <option value="admin">Admin — full access incl. delete &amp; approve/reject</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
