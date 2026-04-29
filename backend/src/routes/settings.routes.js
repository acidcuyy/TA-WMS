import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = express.Router();

// GET /api/settings/:role  → ambil settings berdasarkan role
router.get("/:role", getSettings);

// PUT /api/settings/:role  → simpan/update settings berdasarkan role
router.put("/:role", updateSettings);

export default router;
