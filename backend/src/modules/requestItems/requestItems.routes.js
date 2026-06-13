import express from "express";
import requestItemsController from "./requestItems.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
  requestItemsController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
  requestItemsController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
  requestItemsController.getById,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
  requestItemsController.update,
);

router.put(
  "/delete/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
  requestItemsController.delete,
);

export default router;
