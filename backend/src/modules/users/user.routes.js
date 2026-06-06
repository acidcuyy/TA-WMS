import express from "express";
import userController from "./user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  userController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  userController.createUser,
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  userController.getUserById,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  userController.updateUser,
);

router.post(
  "/delete/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  userController.deleteUser,
);

export default router;
