import express from "express";
import { 
  getAdminProfile, 
  updateAdminProfile,
  getGudangProfile, 
  updateGudangProfile,
  getTokoProfile,
  updateTokoProfile
} from "../controllers/profile.controller.js";

const router = express.Router();

// Admin
router.get("/admin", getAdminProfile);
router.put("/admin", updateAdminProfile);

// Gudang
router.get("/gudang", getGudangProfile);
router.put("/gudang", updateGudangProfile);
router.get("/toko", getTokoProfile);
router.put("/toko", updateTokoProfile);

export default router;
