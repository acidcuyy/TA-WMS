import express from "express";
import userController from "./user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Staf and drivers list (Admin, Gudang, Toko)
router.get("/", authenticate, authorizeRole("ADMIN", "SUPER_ADMIN", "GUDANG", "TOKO"), userController.getUsers);

// Heartbeat for online status
router.post("/heartbeat", authenticate, userController.heartbeat);

// Create branch user (Admin only)
router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  userController.createUser,
);

// Delete branch user (Admin only)
router.delete(
  "/:id",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  userController.deleteUser,
);

// Transfer user to a different branch (Admin only)
router.patch(
  "/:id/transfer",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  userController.transferUser,
);

export default router;
