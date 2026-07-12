import express from "express";
import reportsController from "./reports.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Reports endpoints
router.get("/reports", authenticate, reportsController.getReports);
router.post("/reports", authenticate, reportsController.uploadReport);

// Outflows endpoints
router.get("/outflows/toko", authenticate, reportsController.getTokoOutflows);
router.post("/outflows/toko", authenticate, reportsController.createTokoOutflow);

// Notifications endpoints
router.get("/notifications", authenticate, reportsController.getNotifications);
router.patch("/notifications/:id/read", authenticate, reportsController.markAsRead);
router.post("/notifications/read-multiple", authenticate, reportsController.markMultipleAsRead);
router.patch("/notifications/read-all", authenticate, reportsController.markAllAsRead);

export default router;
