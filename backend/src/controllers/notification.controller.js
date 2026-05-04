import { readDB, writeDB } from "../services/data.service.js";

/**
 * GET /api/notifications
 * Mengambil semua notifikasi
 */
export const getNotifications = async (req, res) => {
  try {
    const db = await readDB();
    const notifications = db.notifications || [];
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getNotifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Menandai satu notifikasi sebagai dibaca
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    const notifIndex = (db.notifications || []).findIndex(n => n.id === id);
    if (notifIndex !== -1) {
      db.notifications[notifIndex].isRead = true;
      await writeDB(db);
    }
    
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error markAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/notifications/read-all
 * Menandai semua notifikasi sebagai dibaca (bisa difilter berdasarkan role)
 */
export const markAllRead = async (req, res) => {
  try {
    const { role } = req.body;
    const db = await readDB();
    
    if (db.notifications) {
      db.notifications.forEach(n => {
        if (!role || (n.targetRoles && n.targetRoles.includes(role.toLowerCase()))) {
          n.isRead = true;
        }
      });
      await writeDB(db);
    }
    
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error markAllRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
