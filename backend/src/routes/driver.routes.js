import express from "express";
import {
  getDriverDashboard,
  getDriverHistory,
  getDriverProfile,
  updateDriverProfile,
  acceptTask
} from "../controllers/driver.controller.js";

const router = express.Router();

router.get("/dashboard", getDriverDashboard);
router.get("/history", getDriverHistory);
router.get("/profile", getDriverProfile);
router.put("/profile", updateDriverProfile);
router.post("/accept-task/:id", acceptTask);

export default router;
