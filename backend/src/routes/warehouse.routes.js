import express from "express";
import { getWarehouseOperasional } from "../controllers/warehouse.controller.js";

const router = express.Router();

router.get("/operasional", getWarehouseOperasional);

export default router;
