import { readDB, writeDB } from "../services/data.service.js";

// Default settings jika role belum ada di db
const defaultSettings = {
  notifStock: true,
  notifRequests: true,
  autoSync: true,
  syncInterval: "5",
  theme: "warm",
  compact: false,
};

/**
 * GET /api/settings/:role
 * Mengambil settings berdasarkan role (admin | gudang | toko)
 */
export const getSettings = async (req, res) => {
  try {
    const { role } = req.params;

    const validRoles = ["admin", "gudang", "toko"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid. Gunakan: admin | gudang | toko" });
    }

    const db = await readDB();
    const userSettings = db.user_settings || [];

    const settings = userSettings.find((s) => s.role === role);

    if (!settings) {
      // Jika belum ada di db, kembalikan default
      return res.status(200).json({ role, ...defaultSettings });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error getSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/settings/:role
 * Menyimpan / memperbarui settings berdasarkan role
 * Body: { notifStock, notifRequests, autoSync, syncInterval, theme, compact }
 */
export const updateSettings = async (req, res) => {
  try {
    const { role } = req.params;

    const validRoles = ["admin", "gudang", "toko"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid. Gunakan: admin | gudang | toko" });
    }

    const db = await readDB();
    if (!db.user_settings) {
      db.user_settings = [];
    }

    const idx = db.user_settings.findIndex((s) => s.role === role);

    // Field yang boleh diupdate (sesuai dengan state di SettingsPage.js)
    const allowed = ["notifStock", "notifRequests", "autoSync", "syncInterval", "theme", "compact"];
    const incoming = req.body;

    // Ambil existing atau buat baru dari default
    const existing = idx !== -1 ? db.user_settings[idx] : { role, ...defaultSettings };

    // Merge hanya field yang diizinkan
    const updated = { ...existing };
    for (const key of allowed) {
      if (incoming[key] !== undefined) {
        updated[key] = incoming[key];
      }
    }

    if (idx !== -1) {
      db.user_settings[idx] = updated;
    } else {
      db.user_settings.push(updated);
    }

    await writeDB(db);

    res.status(200).json({
      message: `Settings untuk role '${role}' berhasil disimpan.`,
      settings: updated,
    });
  } catch (error) {
    console.error("Error updateSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
