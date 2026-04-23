import express from "express";
import { getBarang, addBarang } from "../controllers/barang.controller.js";

const router = express.Router();

router.get("/", getBarang);
router.post("/", addBarang);

export default router;