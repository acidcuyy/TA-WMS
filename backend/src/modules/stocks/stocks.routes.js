import express from "express";
import stocksController from "./stocks.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  stocksController.getStocks
);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN", "GUDANG", "TOKO"),
  stocksController.createStock
);

router.put(
  "/:sku",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN", "GUDANG", "TOKO"),
  stocksController.updateStock
);

router.delete(
  "/:sku/:branchId",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN", "GUDANG"),
  stocksController.deleteStock
);

export default router;
