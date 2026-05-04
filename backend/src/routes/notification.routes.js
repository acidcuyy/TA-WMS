import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllRead
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", getNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);

export default router;
