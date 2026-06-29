import db from "../db/connection.js";

// GET /api/dashboard
export function getDashboardStats(req, res) {
  const totalVendors = db.prepare("SELECT COUNT(*) as count FROM vendors").get().count;

  const activeQuotations = db
    .prepare(`SELECT COUNT(*) as count FROM quotations WHERE status IN ('pending', 'submitted')`)
    .get().count;

  const pendingQuotations = db
    .prepare(`SELECT COUNT(*) as count FROM quotations WHERE status = 'pending'`)
    .get().count;

  const approvedQuotations = db
    .prepare(`SELECT COUNT(*) as count FROM quotations WHERE status = 'approved'`)
    .get().count;

  const submittedQuotations = db
    .prepare(`SELECT COUNT(*) as count FROM quotations WHERE status = 'submitted'`)
    .get().count;

  const rejectedQuotations = db
    .prepare(`SELECT COUNT(*) as count FROM quotations WHERE status = 'rejected'`)
    .get().count;

  const recentActivities = db
    .prepare(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10`)
    .all();

  const statusBreakdown = db
    .prepare(
      `SELECT status, COUNT(*) as count FROM quotations GROUP BY status`
    )
    .all();

  const totalQuotationValue = db
    .prepare(`SELECT COALESCE(SUM(quotation_amount), 0) as total FROM quotations WHERE status = 'approved'`)
    .get().total;

  res.json({
    totalVendors,
    activeQuotations,
    pendingQuotations,
    approvedQuotations,
    submittedQuotations,
    rejectedQuotations,
    totalQuotationValue,
    statusBreakdown,
    recentActivities,
  });
}
