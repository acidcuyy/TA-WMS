import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

import transferController from "./transfer.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  transferController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  transferController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  transferController.getById,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  transferController.update,
);

router.put(
  "/delete/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  transferController.delete,
);

export default router;
