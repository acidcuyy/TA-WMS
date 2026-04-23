import express from "express";
import {
  getStockSummary,
  getStockRequests,
  createStockRequest,
  updateStockRequestStatus,
} from "../controllers/stock.controller.js";

const router = express.Router();

router.get("/summary", getStockSummary);
router.get("/requests", getStockRequests);
router.post("/requests", createStockRequest);
router.put("/requests/:id", updateStockRequestStatus);

export default router;
