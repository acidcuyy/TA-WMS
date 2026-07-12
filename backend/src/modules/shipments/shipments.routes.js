import express from "express";
import shipmentsController from "./shipments.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Driver tasks & actions
router.patch(
  "/requests/:id/accept",
  authenticate,
  authorizeRole("DRIVER"),
  shipmentsController.driverAcceptRequest
);

router.patch(
  "/requests/:id/upload",
  authenticate,
  authorizeRole("DRIVER"),
  shipmentsController.driverUploadBukti
);

router.patch(
  "/requests/:id/complete",
  authenticate,
  authorizeRole("DRIVER"),
  shipmentsController.driverCompleteDelivery
);

// Live GPS coordinate updates
router.patch(
  "/shipments/:id/location",
  authenticate,
  authorizeRole("DRIVER"),
  shipmentsController.updateLocation
);

// Get shipment tracking details
router.get(
  "/shipments/:requestId",
  authenticate,
  shipmentsController.getShipment
);

// Driver profile actions
router.get(
  "/profile",
  authenticate,
  authorizeRole("DRIVER"),
  shipmentsController.getDriverProfile
);

router.put(
  "/profile",
  authenticate,
  authorizeRole("DRIVER"),
  shipmentsController.updateDriverProfile
);

export default router;
