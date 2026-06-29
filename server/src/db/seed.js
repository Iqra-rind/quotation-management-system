import bcrypt from "bcryptjs";
import db from "./connection.js";

const vendorCount = db.prepare("SELECT COUNT(*) as count FROM vendors").get();

if (vendorCount.count > 0) {
  console.log("Database already has data. Skipping seed. (Delete vendor_quotation.db to reset.)");
  process.exit(0);
}

console.log("Seeding database with sample data...");

// ---- Demo users (Authentication & Authorization) ----
const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
`);

insertUser.run("Admin User", "admin@vendorsys.com", bcrypt.hashSync("admin123", 10), "admin");
insertUser.run("Team Member", "member@vendorsys.com", bcrypt.hashSync("member123", 10), "member");

console.log("Seeded 2 demo users:");
console.log("  Admin  -> admin@vendorsys.com  / admin123");
console.log("  Member -> member@vendorsys.com / member123");

const insertVendor = db.prepare(`
  INSERT INTO vendors (vendor_name, company_name, email, contact_number, business_address, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const vendors = [
  ["Arjun Mehta", "Mehta Industrial Supplies", "arjun@mehtasupplies.com", "+91 98765 43210", "Plot 14, MIDC Industrial Area, Pune, Maharashtra", "active"],
  ["Sara Khan", "Khan Electronics Pvt Ltd", "sara@khanelectronics.com", "+92 300 1234567", "Shop 22, Electronics Market, Karachi, Sindh", "active"],
  ["David Lee", "Lee Office Solutions", "david@leeoffice.com", "+1 415 555 0192", "455 Market St, San Francisco, CA", "active"],
  ["Priya Nair", "Nair Packaging Co.", "priya@nairpackaging.in", "+91 90000 11223", "Unit 7, GIDC Estate, Ahmedabad, Gujarat", "active"],
  ["Tom Becker", "Becker Logistics GmbH", "tom@beckerlogistics.de", "+49 30 1234567", "Industriestrasse 9, Berlin, Germany", "inactive"],
];

const vendorIds = vendors.map((v) => insertVendor.run(...v).lastInsertRowid);

const insertRequest = db.prepare(`
  INSERT INTO quotation_requests (title, description) VALUES (?, ?)
`);

const requests = [
  ["Office Furniture - Q3 Procurement", "50 ergonomic chairs and 20 standing desks for the new floor."],
  ["Networking Hardware Upgrade", "Switches, routers, and structured cabling for HQ network refresh."],
  ["Annual Stationery Supply Contract", "Bulk stationery and printing consumables for FY 2026-27."],
];

const requestIds = requests.map((r) => insertRequest.run(...r).lastInsertRowid);

const insertQuotation = db.prepare(`
  INSERT INTO quotations (quotation_request_id, vendor_id, quotation_amount, submission_date, status, notes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Request 1: Office Furniture - 3 vendors responded
insertQuotation.run(requestIds[0], vendorIds[0], 285000, "2026-06-21", "submitted", "Includes delivery and 2-year warranty.");
insertQuotation.run(requestIds[0], vendorIds[2], 312000, "2026-06-22", "submitted", "Premium brand, 3-year warranty.");
insertQuotation.run(requestIds[0], vendorIds[3], 270500, "2026-06-22", "approved", "Best price, local delivery in 5 days.");

// Request 2: Networking Hardware - 2 vendors, one pending
insertQuotation.run(requestIds[1], vendorIds[1], 540000, "2026-06-23", "submitted", "Cisco-grade hardware, includes installation.");
insertQuotation.run(requestIds[1], vendorIds[4], null, null, "pending", null);

// Request 3: Stationery - all pending
insertQuotation.run(requestIds[2], vendorIds[0], null, null, "pending", null);
insertQuotation.run(requestIds[2], vendorIds[3], null, null, "pending", null);

const insertActivity = db.prepare(`
  INSERT INTO activity_log (entity_type, entity_id, action, description) VALUES (?, ?, ?, ?)
`);

insertActivity.run("vendor", vendorIds[0], "created", "Vendor 'Mehta Industrial Supplies' was added.");
insertActivity.run("quotation_request", requestIds[0], "created", "Quotation request 'Office Furniture - Q3 Procurement' was created.");
insertActivity.run("quotation", 3, "status_changed", "Quotation from 'Nair Packaging Co.' was approved.");

console.log(`Seeded ${vendors.length} vendors, ${requests.length} quotation requests, and 7 quotations.`);
console.log("Done.");
