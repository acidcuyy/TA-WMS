import { readDB, writeDB } from "../services/data.service.js";

/**
 * GET /api/driver/dashboard
 * Mengembalikan data untuk DriverDashboard.js
 */
export const getDriverDashboard = async (req, res) => {
  try {
    const db = await readDB();
    const allReq = db.requests || db.stock_requests || [];
    const profile = db.driver_profile || { name: "Budi Santoso", role: "Driver Utama", status: "Online", email: "budi@wms.com", phone: "0812-3456-7890", vehicle: "Truk Box B 1234 GAD" };

    const readyTasks = allReq.filter(r => r.status === "Siap Dikirim");
    const activeTask = allReq.find(r => r.status === "Mengirim" && (r.driverName === profile.name || r.driverName === "Budi Santoso"));
    const historyTasks = allReq.filter(r => r.status === "Selesai" && (r.driverName === profile.name || r.driverName === "Budi Santoso")).slice(0, 5);

    res.status(200).json({
      profile,
      readyTasks,
      activeTask,
      historyTasks
    });
  } catch (error) {
    console.error("Error getDriverDashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/driver/history
 * Mengembalikan data untuk DriverHistory.js
 */
export const getDriverHistory = async (req, res) => {
  try {
    const db = await readDB();
    const allReq = db.requests || db.stock_requests || [];
    const profile = db.driver_profile || { name: "Budi Santoso" };

    const history = allReq.filter(r => r.status === "Selesai" && (r.driverName === profile.name || r.driverName === "Budi Santoso"));

    res.status(200).json({ history });
  } catch (error) {
    console.error("Error getDriverHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/driver/profile
 * Mengembalikan data profil driver
 */
export const getDriverProfile = async (req, res) => {
  try {
    const db = await readDB();
    const profile = db.driver_profile || {
      name: "Budi Santoso",
      email: "budi@wms.com",
      phone: "0812-3456-7890",
      vehicle: "Truk Box B 1234 GAD",
      role: "Driver Utama",
      status: "Online",
      lastLogin: "24 Mei 2025, 08:30",
      joinedAt: "12 Januari 2024"
    };
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error getDriverProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/driver/profile
 * Mengupdate profil driver
 */
export const updateDriverProfile = async (req, res) => {
  try {
    const db = await readDB();
    const payload = req.body;

    db.driver_profile = { ...(db.driver_profile || {}), ...payload };

    // Sinkronisasi nama driver di request/shipment yang sedang aktif
    if (payload.name) {
      const oldName = db.driver_profile.name;
      const requests = db.requests || db.stock_requests || [];
      requests.forEach(r => {
        if (r.driverName === oldName || r.driverName === "Budi Santoso") {
          r.driverName = payload.name;
        }
      });
      if (db.shipments) {
        Object.values(db.shipments).forEach(s => {
          if (s.driverName === oldName || s.driverName === "Budi Santoso") {
            s.driverName = payload.name;
          }
        });
      }
    }

    await writeDB(db);
    res.status(200).json({ message: "Profile updated successfully", profile: db.driver_profile });
  } catch (error) {
    console.error("Error updateDriverProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/driver/accept-task/:id
 * Driver mengambil tugas pengiriman
 */
export const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverName } = req.body;
    const db = await readDB();
    
    const requests = db.requests || db.stock_requests || [];
    const r = requests.find(x => x.id === id);
    
    if (!r) return res.status(404).json({ message: "Task not found" });
    if (r.status !== "Siap Dikirim") return res.status(400).json({ message: "Task is not ready for pickup" });

    db.shipments = db.shipments || {};
    db.notifications = db.notifications || [];

    r.status = "Mengirim";
    r.driverName = driverName || "Budi Santoso";

    db.shipments[id] = {
      id,
      start: { lat: -6.2, lng: 106.8166 },
      end: { lat: -6.1754, lng: 106.8272 },
      startedAt: Date.now(),
      durationMs: 1000 * 60 * 18,
      driver: { lat: -6.197, lng: 106.8177 },
      driverName: r.driverName
    };

    db.notifications.unshift({
      id: `NTF-${Date.now()}`,
      type: "shipping",
      title: "Driver Mengambil Tugas",
      message: `Pesanan ${id} sedang dikirim oleh ${r.driverName}`,
      time: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      targetRoles: ["toko", "gudang", "admin"],
    });

    await writeDB(db);
    res.status(200).json({ message: "Task accepted successfully", shipment: db.shipments[id] });
  } catch (error) {
    console.error("Error acceptTask:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
