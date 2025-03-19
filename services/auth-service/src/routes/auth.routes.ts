import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshToken
);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);
router.patch(
  "/profile",
  authenticate,
  validateRequest(updateProfileSchema),
  updateProfile
);
router.post(
  "/change-password",
  authenticate,
  validateRequest(changePasswordSchema),
  changePassword
);

export default router;
