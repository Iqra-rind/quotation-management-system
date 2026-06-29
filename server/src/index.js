import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import quotationRequestRoutes from "./routes/quotationRequestRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-this-to-a-long-random-secret-before-deploying") {
  console.warn(
    "⚠️  JWT_SECRET is missing or still set to the example placeholder. " +
    "This is fine for local development, but set a real secret in server/.env before deploying."
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Vendor Management & Quotation System API is running." });
});

// Public
app.use("/api/auth", authRoutes);

// Everything below requires a logged-in user
app.use("/api/vendors", requireAuth, vendorRoutes);
app.use("/api/quotation-requests", requireAuth, quotationRequestRoutes);
app.use("/api/quotations", requireAuth, quotationRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
