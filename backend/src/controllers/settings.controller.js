import pool from "../config/db.js";

const defaultSettings = {
  notifStock: true, notifRequests: true,
  autoSync: true, syncInterval: "5",
  theme: "warm", compact: false,
};

export const getSettings = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ["admin", "gudang", "toko", "driver"];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: "Role tidak valid" });

    const { rows } = await pool.query(
      "SELECT * FROM user_settings WHERE role = $1 LIMIT 1", [role]
    );
    if (!rows[0]) return res.status(200).json({ role, ...defaultSettings });

    res.status(200).json({ role, ...defaultSettings, ...rows[0] });
  } catch (err) {
    console.error("Error getSettings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ["admin", "gudang", "toko", "driver"];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: "Role tidak valid" });

    const { notifStock, notifRequests } = req.body;
    const { rows: existing } = await pool.query(
      "SELECT id FROM user_settings WHERE role = $1", [role]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE user_settings SET notif_stock = $1, notif_requests = $2 WHERE role = $3",
        [notifStock ?? true, notifRequests ?? true, role]
      );
    } else {
      await pool.query(
        "INSERT INTO user_settings (role, notif_stock, notif_requests) VALUES ($1,$2,$3)",
        [role, notifStock ?? true, notifRequests ?? true]
      );
    }

    res.status(200).json({ message: `Settings role '${role}' berhasil disimpan.`, settings: { role, ...req.body } });
  } catch (err) {
    console.error("Error updateSettings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
