import express from "express";
import authController from "./auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/register",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  authController.register,
);

router.post("/login", authController.login);

export default router;
