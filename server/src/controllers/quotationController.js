import db from "../db/connection.js";
import { logActivity } from "../utils/activityLogger.js";
import PDFDocument from "pdfkit";

// GET /api/quotations?status=
export function getQuotations(req, res) {
  const { status } = req.query;
  let query = `
    SELECT q.*, v.vendor_name, v.company_name, qr.title as request_title
    FROM quotations q
    JOIN vendors v ON v.id = q.vendor_id
    JOIN quotation_requests qr ON qr.id = q.quotation_request_id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== "all") {
    query += " AND q.status = ?";
    params.push(status);
  }

  query += " ORDER BY q.created_at DESC";
  res.json(db.prepare(query).all(...params));
}

// GET /api/quotations/:id
export function getQuotationById(req, res) {
  const quotation = db
    .prepare(
      `SELECT q.*, v.vendor_name, v.company_name, v.email, v.contact_number, qr.title as request_title, qr.description as request_description
       FROM quotations q
       JOIN vendors v ON v.id = q.vendor_id
       JOIN quotation_requests qr ON qr.id = q.quotation_request_id
       WHERE q.id = ?`
    )
    .get(req.params.id);

  if (!quotation) return res.status(404).json({ error: "Quotation not found" });
  res.json(quotation);
}

// PUT /api/quotations/:id/submit  { quotation_amount, notes }
// Vendor submits their response to a quotation request.
export function submitQuotation(req, res) {
  const { id } = req.params;
  const { quotation_amount, notes } = req.body;

  const existing = db.prepare("SELECT * FROM quotations WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Quotation not found" });

  if (quotation_amount === undefined || quotation_amount === null || isNaN(quotation_amount)) {
    return res.status(400).json({ error: "A valid quotation amount is required." });
  }

  db.prepare(
    `UPDATE quotations
     SET quotation_amount = ?, notes = ?, status = 'submitted',
         submission_date = date('now'), updated_at = datetime('now')
     WHERE id = ?`
  ).run(quotation_amount, notes || null, id);

  const updated = db.prepare("SELECT * FROM quotations WHERE id = ?").get(id);
  const vendor = db.prepare("SELECT company_name FROM vendors WHERE id = ?").get(updated.vendor_id);
  logActivity("quotation", id, "status_changed", `Quotation from '${vendor.company_name}' was submitted.`);
  res.json(updated);
}

// PUT /api/quotations/:id/status  { status: 'approved' | 'rejected' | 'pending' | 'submitted' }
export function updateQuotationStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "submitted", "approved", "rejected"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const existing = db.prepare("SELECT * FROM quotations WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Quotation not found" });

  db.prepare(`UPDATE quotations SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);

  const vendor = db.prepare("SELECT company_name FROM vendors WHERE id = ?").get(existing.vendor_id);
  logActivity("quotation", id, "status_changed", `Quotation from '${vendor.company_name}' marked as ${status}.`);

  const updated = db.prepare("SELECT * FROM quotations WHERE id = ?").get(id);
  res.json(updated);
}

// DELETE /api/quotations/:id
export function deleteQuotation(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM quotations WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Quotation not found" });

  db.prepare("DELETE FROM quotations WHERE id = ?").run(id);
  res.json({ message: "Quotation deleted successfully." });
}

// GET /api/quotations/:id/pdf  -> streams a PDF document
export function exportQuotationPdf(req, res) {
  const quotation = db
    .prepare(
      `SELECT q.*, v.vendor_name, v.company_name, v.email, v.contact_number, v.business_address,
              qr.title as request_title, qr.description as request_description
       FROM quotations q
       JOIN vendors v ON v.id = q.vendor_id
       JOIN quotation_requests qr ON qr.id = q.quotation_request_id
       WHERE q.id = ?`
    )
    .get(req.params.id);

  if (!quotation) return res.status(404).json({ error: "Quotation not found" });

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="quotation-${quotation.id}.pdf"`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor("#1F3A2E").text("Quotation Summary", { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#6B7280").text(`Generated on ${new Date().toLocaleDateString()}`);
  doc.moveDown(1);
  doc.strokeColor("#E5E7EB").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Request info
  doc.fontSize(13).fillColor("#111827").text("Quotation Request", { underline: false });
  doc.fontSize(11).fillColor("#374151").moveDown(0.3);
  doc.text(`Title: ${quotation.request_title}`);
  if (quotation.request_description) {
    doc.text(`Description: ${quotation.request_description}`);
  }
  doc.moveDown(1);

  // Vendor info
  doc.fontSize(13).fillColor("#111827").text("Vendor Details");
  doc.fontSize(11).fillColor("#374151").moveDown(0.3);
  doc.text(`Vendor Name: ${quotation.vendor_name}`);
  doc.text(`Company: ${quotation.company_name}`);
  doc.text(`Email: ${quotation.email}`);
  doc.text(`Contact: ${quotation.contact_number}`);
  doc.text(`Address: ${quotation.business_address}`);
  doc.moveDown(1);

  // Quotation details box
  doc.fontSize(13).fillColor("#111827").text("Quotation Details");
  doc.moveDown(0.3);

  const boxY = doc.y;
  doc.rect(50, boxY, 495, 90).fillAndStroke("#F4F6F4", "#E5E7EB");
  doc.fillColor("#111827").fontSize(11);
  doc.text(`Status: ${quotation.status.toUpperCase()}`, 65, boxY + 12);
  doc.text(
    `Quotation Amount: ${quotation.quotation_amount != null ? "Rs. " + Number(quotation.quotation_amount).toLocaleString() : "Not yet submitted"}`,
    65,
    boxY + 32
  );
  doc.text(`Submission Date: ${quotation.submission_date || "—"}`, 65, boxY + 52);
  if (quotation.notes) {
    doc.text(`Notes: ${quotation.notes}`, 65, boxY + 72, { width: 460 });
  }

  doc.moveDown(7);
  doc.fontSize(9).fillColor("#9CA3AF").text("Generated by Vendor Management & Quotation System", 50, 760, {
    align: "center",
    width: 495,
  });

  doc.end();
}
