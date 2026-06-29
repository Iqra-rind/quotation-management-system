import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middleware/validators.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, me);

export default router;
