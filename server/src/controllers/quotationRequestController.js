import db from "../db/connection.js";
import { logActivity } from "../utils/activityLogger.js";

// GET /api/quotation-requests?search=&status=
export function getQuotationRequests(req, res) {
  const { search, status } = req.query;

  let innerWhere = "WHERE 1=1";
  const innerParams = [];
  if (search) {
    innerWhere += " AND (qr.title LIKE ? OR qr.description LIKE ?)";
    const term = `%${search}%`;
    innerParams.push(term, term);
  }

  let outerWhere = "";
  if (status === "pending") outerWhere = "WHERE t.pending_count > 0";
  else if (status === "submitted") outerWhere = "WHERE t.submitted_count > 0";
  else if (status === "approved") outerWhere = "WHERE t.approved_count > 0";
  else if (status === "rejected") outerWhere = "WHERE t.rejected_count > 0";

  const requests = db
    .prepare(
      `SELECT * FROM (
         SELECT qr.*,
                COUNT(q.id) as vendor_count,
                SUM(CASE WHEN q.status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
                SUM(CASE WHEN q.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN q.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN q.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
         FROM quotation_requests qr
         LEFT JOIN quotations q ON q.quotation_request_id = qr.id
         ${innerWhere}
         GROUP BY qr.id
       ) t
       ${outerWhere}
       ORDER BY t.created_at DESC`
    )
    .all(...innerParams);
  res.json(requests);
}

// GET /api/quotation-requests/:id  (includes all vendor quotations for comparison)
export function getQuotationRequestById(req, res) {
  const request = db.prepare("SELECT * FROM quotation_requests WHERE id = ?").get(req.params.id);
  if (!request) return res.status(404).json({ error: "Quotation request not found" });

  const quotations = db
    .prepare(
      `SELECT q.*, v.vendor_name, v.company_name, v.email, v.contact_number
       FROM quotations q
       JOIN vendors v ON v.id = q.vendor_id
       WHERE q.quotation_request_id = ?
       ORDER BY q.quotation_amount ASC`
    )
    .all(req.params.id);

  res.json({ ...request, quotations });
}

// POST /api/quotation-requests  { title, description, vendor_ids: [1,2,3] }
export function createQuotationRequest(req, res) {
  const { title, description, vendor_ids } = req.body;

  if (!Array.isArray(vendor_ids) || vendor_ids.length === 0) {
    return res.status(400).json({ error: "Select at least one vendor to send the request to." });
  }

  const insertRequest = db.prepare(`INSERT INTO quotation_requests (title, description) VALUES (?, ?)`);
  const insertQuotation = db.prepare(
    `INSERT INTO quotations (quotation_request_id, vendor_id, status) VALUES (?, ?, 'pending')`
  );

  const runTransaction = db.transaction
    ? null
    : null; // node:sqlite DatabaseSync doesn't expose a transaction helper; do it manually below

  try {
    db.exec("BEGIN");
    const result = insertRequest.run(title, description || null);
    const requestId = result.lastInsertRowid;

    for (const vendorId of vendor_ids) {
      insertQuotation.run(requestId, vendorId);
    }
    db.exec("COMMIT");

    logActivity("quotation_request", requestId, "created", `Quotation request '${title}' was created and sent to ${vendor_ids.length} vendor(s).`);

    const newRequest = db.prepare("SELECT * FROM quotation_requests WHERE id = ?").get(requestId);
    res.status(201).json(newRequest);
  } catch (err) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: "Failed to create quotation request: " + err.message });
  }
}

// PUT /api/quotation-requests/:id
export function updateQuotationRequest(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM quotation_requests WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Quotation request not found" });

  const { title, description } = req.body;
  db.prepare(
    `UPDATE quotation_requests SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(title ?? existing.title, description ?? existing.description, id);

  const updated = db.prepare("SELECT * FROM quotation_requests WHERE id = ?").get(id);
  logActivity("quotation_request", id, "updated", `Quotation request '${updated.title}' was updated.`);
  res.json(updated);
}

// DELETE /api/quotation-requests/:id
export function deleteQuotationRequest(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM quotation_requests WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Quotation request not found" });

  db.prepare("DELETE FROM quotation_requests WHERE id = ?").run(id);
  logActivity("quotation_request", id, "deleted", `Quotation request '${existing.title}' was deleted.`);
  res.json({ message: "Quotation request deleted successfully." });
}
