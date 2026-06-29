import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "vendor_quotation.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

const db = new DatabaseSync(DB_PATH);

// Apply schema (idempotent - uses CREATE TABLE IF NOT EXISTS)
const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
db.exec(schema);

export default db;
