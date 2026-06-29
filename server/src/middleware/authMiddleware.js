import { verifyToken } from "../utils/token.js";

// Verifies the JWT sent in the Authorization header (Bearer <token>)
// and attaches the decoded payload to req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  try {
    req.user = verifyToken(token); // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Your session has expired or is invalid. Please log in again." });
  }
}

// Restricts a route to one or more roles. Must be used after requireAuth.
// Usage: router.delete("/:id", requireRole("admin"), deleteVendor)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required. Please log in." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `This action requires ${allowedRoles.join(" or ")} access. Your role is '${req.user.role}'.`,
      });
    }
    next();
  };
}
