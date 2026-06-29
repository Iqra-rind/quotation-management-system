import db from "../db/connection.js";
import { logActivity } from "../utils/activityLogger.js";

// GET /api/vendors?search=&status=
export function getVendors(req, res) {
  const { search, status } = req.query;

  let query = "SELECT * FROM vendors WHERE 1=1";
  const params = [];

  if (search) {
    query += ` AND (vendor_name LIKE ? OR company_name LIKE ? OR email LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (status && status !== "all") {
    query += ` AND status = ?`;
    params.push(status);
  }

  query += " ORDER BY created_at DESC";

  const vendors = db.prepare(query).all(...params);
  res.json(vendors);
}

// GET /api/vendors/:id
export function getVendorById(req, res) {
  const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(req.params.id);
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });

  // Include quotation history for this vendor
  const quotations = db
    .prepare(
      `SELECT q.*, qr.title as request_title
       FROM quotations q
       JOIN quotation_requests qr ON qr.id = q.quotation_request_id
       WHERE q.vendor_id = ?
       ORDER BY q.created_at DESC`
    )
    .all(req.params.id);

  res.json({ ...vendor, quotations });
}

// POST /api/vendors
export function createVendor(req, res) {
  const { vendor_name, company_name, email, contact_number, business_address, status } = req.body;

  try {
    const result = db
      .prepare(
        `INSERT INTO vendors (vendor_name, company_name, email, contact_number, business_address, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(vendor_name, company_name, email, contact_number, business_address, status || "active");

    const newVendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(result.lastInsertRowid);
    logActivity("vendor", newVendor.id, "created", `Vendor '${company_name}' was added.`);
    res.status(201).json(newVendor);
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "A vendor with this email already exists." });
    }
    res.status(500).json({ error: "Failed to create vendor." });
  }
}

// PUT /api/vendors/:id
export function updateVendor(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM vendors WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Vendor not found" });

  const { vendor_name, company_name, email, contact_number, business_address, status } = req.body;

  try {
    db.prepare(
      `UPDATE vendors
       SET vendor_name = ?, company_name = ?, email = ?, contact_number = ?,
           business_address = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      vendor_name ?? existing.vendor_name,
      company_name ?? existing.company_name,
      email ?? existing.email,
      contact_number ?? existing.contact_number,
      business_address ?? existing.business_address,
      status ?? existing.status,
      id
    );

    const updated = db.prepare("SELECT * FROM vendors WHERE id = ?").get(id);
    logActivity("vendor", id, "updated", `Vendor '${updated.company_name}' was updated.`);
    res.json(updated);
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "A vendor with this email already exists." });
    }
    res.status(500).json({ error: "Failed to update vendor." });
  }
}

// DELETE /api/vendors/:id
export function deleteVendor(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM vendors WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Vendor not found" });

  db.prepare("DELETE FROM vendors WHERE id = ?").run(id);
  logActivity("vendor", id, "deleted", `Vendor '${existing.company_name}' was deleted.`);
  res.json({ message: "Vendor deleted successfully." });
}
