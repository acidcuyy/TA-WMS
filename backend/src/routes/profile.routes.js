import express from "express";
import { getAdminProfile, updateAdminProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/admin", getAdminProfile);
router.put("/admin", updateAdminProfile);

export default router;
