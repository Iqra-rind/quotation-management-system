import { Router } from "express";
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../controllers/vendorController.js";
import { validateVendor, validateVendorUpdate } from "../middleware/validators.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", validateVendor, createVendor);
router.put("/:id", validateVendorUpdate, updateVendor);
router.delete("/:id", requireRole("admin"), deleteVendor);

export default router;
