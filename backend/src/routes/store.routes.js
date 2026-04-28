import express from "express";
import { getStoreSummary } from "../controllers/store.controller.js";

const router = express.Router();

router.get("/summary", getStoreSummary);

export default router;
