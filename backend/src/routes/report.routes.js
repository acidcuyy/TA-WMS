import express from "express";
import {
  getStockReport,
  getOrderReport,
  getMovementReport,
  getProductionReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/stocks", getStockReport);
router.get("/orders", getOrderReport);
router.get("/movements", getMovementReport);
router.get("/productions", getProductionReport);

export default router;
