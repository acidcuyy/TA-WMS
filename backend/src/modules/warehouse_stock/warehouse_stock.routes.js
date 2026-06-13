import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

import warehouseStockController from "./warehouse_stock.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseStockController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseStockController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseStockController.getById,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseStockController.update,
);

router.put(
  "/delete/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  warehouseStockController.delete,
);

export default router;
