import express from "express";
import authController from "./auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public registration for Company + Admin PIC
router.post("/register-company", authController.registerCompany);

// Login for all roles
router.post("/login", authController.login);

// Register branch user (Admin only)
router.post(
  "/register",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  authController.register,
);

// Get company profile details
router.get(
  "/company-profile",
  authenticate,
  authController.getCompanyProfile
);

// Update company profile settings
router.patch(
  "/company-profile/settings",
  authenticate,
  authController.updateCompanySettings
);

export default router;
