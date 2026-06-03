import {
  getAllNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../services/data.service.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await getAllNotifications();
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error getNotifications:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await markNotificationRead(req.params.id);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error markAsRead:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const { role } = req.body;
    await markAllNotificationsRead(role);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error markAllRead:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
