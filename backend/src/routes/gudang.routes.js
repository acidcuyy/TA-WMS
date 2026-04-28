import express from "express";
import { getGudangDashboard } from "../controllers/gudang.controller.js";

const router = express.Router();

// GET /api/gudang/dashboard
router.get("/dashboard", getGudangDashboard);

export default router;
