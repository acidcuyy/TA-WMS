import express from "express";
import { 
  getTokoDashboard, 
  getTokoStock,
  getTokoOrders,
  getTokoReceipts,
  getTokoDispatches,
  getTokoRequests,
  getTokoTransfers,
  getTokoAdjustments,
  getTokoReturns,
  getTokoHistory,
  getShipment,
  completeShipment
} from "../controllers/toko.controller.js";

const router = express.Router();

router.get("/dashboard", getTokoDashboard);
router.get("/stock", getTokoStock);
router.get("/orders", getTokoOrders);
router.get("/receipts", getTokoReceipts);
router.get("/dispatches", getTokoDispatches);
router.get("/requests", getTokoRequests);
router.get("/transfers", getTokoTransfers);
router.get("/adjustments", getTokoAdjustments);
router.get("/returns", getTokoReturns);
router.get("/history", getTokoHistory);
router.get("/shipment/:id", getShipment);
router.post("/shipment/:id/complete", completeShipment);

export default router;
