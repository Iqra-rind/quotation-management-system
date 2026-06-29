import { Router } from "express";
import {
  getQuotations,
  getQuotationById,
  submitQuotation,
  updateQuotationStatus,
  deleteQuotation,
  exportQuotationPdf,
} from "../controllers/quotationController.js";
import { validateQuotationSubmit } from "../middleware/validators.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getQuotations);
router.get("/:id", getQuotationById);
router.get("/:id/pdf", exportQuotationPdf);
router.put("/:id/submit", validateQuotationSubmit, submitQuotation);
router.put("/:id/status", requireRole("admin"), updateQuotationStatus);
router.delete("/:id", requireRole("admin"), deleteQuotation);

export default router;
