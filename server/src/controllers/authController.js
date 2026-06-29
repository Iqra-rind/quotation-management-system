import bcrypt from "bcryptjs";
import db from "../db/connection.js";
import { signToken } from "../utils/token.js";

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at };
}

// POST /api/auth/register  { name, email, password, role? }
// `role` defaults to 'member'. Open registration is kept simple for this internal
// tool / evaluation build — in a real production system, admin role assignment
// would instead be done by an existing admin, not chosen at signup.
export function register(req, res) {
  const { name, email, password, role } = req.body;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`)
      .run(name, email, password_hash, role === "admin" ? "admin" : "member");

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    const token = signToken(user);
    res.status(201).json({ user: toPublicUser(user), token });
  } catch (err) {
    res.status(500).json({ error: "Failed to create account: " + err.message });
  }
}

// POST /api/auth/login  { email, password }
export function login(req, res) {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user);
  res.json({ user: toPublicUser(user), token });
}

// GET /api/auth/me  (requires auth)
export function me(req, res) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: toPublicUser(user) });
}
