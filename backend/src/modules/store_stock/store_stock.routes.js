import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

import storeStockController from "./store_stock.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  storeStockController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  storeStockController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  storeStockController.getById,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  storeStockController.update,
);

router.put(
  "/delete/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  storeStockController.delete,
);

export default router;
