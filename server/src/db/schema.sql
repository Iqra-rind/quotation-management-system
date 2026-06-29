-- Vendor Management & Quotation System - Database Schema
-- SQLite (via Node's built-in node:sqlite module)

PRAGMA foreign_keys = ON;

-- ============================================================
-- USERS (Authentication & Authorization)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_name     TEXT    NOT NULL,
    company_name    TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    contact_number  TEXT    NOT NULL,
    business_address TEXT   NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- QUOTATION REQUESTS
-- A request is the "ask" sent out; it can be assigned to one or more vendors,
-- each of whom submits their own quotation response.
-- ============================================================
CREATE TABLE IF NOT EXISTS quotation_requests (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    description     TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- QUOTATIONS
-- One row per vendor's response to a quotation request.
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_request_id INTEGER NOT NULL,
    vendor_id           INTEGER NOT NULL,
    quotation_amount    REAL,                       -- NULL until vendor submits a response
    submission_date     TEXT,                       -- NULL until submitted
    status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    notes               TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (quotation_request_id) REFERENCES quotation_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    UNIQUE (quotation_request_id, vendor_id)
);

-- ============================================================
-- ACTIVITY LOG (supports "Recent Activities" on dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,      -- 'vendor' | 'quotation_request' | 'quotation'
    entity_id   INTEGER NOT NULL,
    action      TEXT NOT NULL,      -- e.g. 'created', 'updated', 'deleted', 'status_changed'
    description TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quotations_request ON quotations(quotation_request_id);
CREATE INDEX IF NOT EXISTS idx_quotations_vendor ON quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
