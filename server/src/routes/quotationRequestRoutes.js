import { Router } from "express";
import {
  getQuotationRequests,
  getQuotationRequestById,
  createQuotationRequest,
  updateQuotationRequest,
  deleteQuotationRequest,
} from "../controllers/quotationRequestController.js";
import { validateQuotationRequest } from "../middleware/validators.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getQuotationRequests);
router.get("/:id", getQuotationRequestById);
router.post("/", validateQuotationRequest, createQuotationRequest);
router.put("/:id", updateQuotationRequest);
router.delete("/:id", requireRole("admin"), deleteQuotationRequest);

export default router;
