import express from "express";
import { 
  getGudangDashboard, 
  getGudangReports, 
  getGudangOrders, 
  getGudangReceipts,
  getGudangDispatches,
  getGudangTransfers,
  getGudangStock,
  getGudangRequests,
  gudangDecideRequest,
  getShipmentTracking
} from "../controllers/gudang.controller.js";

const router = express.Router();

// Dashboard & Reports
router.get("/dashboard", getGudangDashboard);
router.get("/reports", getGudangReports);

// Logistics
router.get("/orders", getGudangOrders);
router.get("/receipts", getGudangReceipts);
router.get("/dispatches", getGudangDispatches);
router.get("/transfers", getGudangTransfers);

// Inventory & Requests
router.get("/stock", getGudangStock);
router.get("/requests", getGudangRequests);
router.put("/requests/:id/decide", gudangDecideRequest);

// Tracking
router.get("/shipment/:id", getShipmentTracking);

export default router;
