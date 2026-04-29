import express from "express";
import { getOrders, getOrderStats, createOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/stats", getOrderStats);
router.post("/", createOrder);

export default router;
