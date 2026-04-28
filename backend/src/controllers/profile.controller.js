import { readDB, writeDB } from "../services/data.service.js";

// GET Profile Admin
export const getAdminProfile = async (req, res) => {
  try {
    const db = await readDB();
    
    // Cari user admin
    const adminUser = db.users?.find(u => u.role === 'admin') || {};
    
    // Hitung request baru (misal status belum Selesai)
    const stockRequests = db.stock_requests || [];
    const pendingRequests = stockRequests.filter(r => r.status !== 'Selesai').length;
    
    // Hitung stok menipis
    const products = db.products || [];
    const lowStockCount = products.filter(p => p.stockStatus === 'Stok rendah' || p.stockStatus === 'Critical').length;

    // Ambil aktivitas
    const rawActivities = db.activities || [];
    const activities = rawActivities.slice(0, 3).map(a => ({
      time: a.time,
      text: a.message,
      icon: a.icon || "👤",
      color: a.type === 'order' ? '#e6f7ff' : a.type === 'stock' ? '#f6ffed' : '#fff7e6'
    }));

    // Data profile
    const profile = {
      name: adminUser.name || "Admin",
      email: adminUser.email || "admin@gmail.com",
      role: "Admin",
      lastLogin: adminUser.lastLogin || "13 Mei 2026, 09:40",
      joinedSince: adminUser.joinedSince || "10 Januari 2025",
      preferences: adminUser.preferences || { notifStock: true, notifRequests: true }
    };

    const stats = [
      { label: "Requests Baru", value: pendingRequests.toString(), sub: "Hari ini", icon: "🗒️" },
      { label: "Stok Menipis", value: lowStockCount.toString(), sub: "Butuh perhatian", icon: "📦" },
      { label: "Sinkronisasi", value: "Aktif", sub: "Realtime", icon: "🔄" },
    ];

    res.status(200).json({
      profile,
      stats,
      activities
    });
  } catch (error) {
    console.error("Error getAdminProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT / UPDATE Profile Admin (termasuk preferensi)
export const updateAdminProfile = async (req, res) => {
  try {
    const db = await readDB();
    const adminIndex = db.users?.findIndex(u => u.role === 'admin');
    
    if (adminIndex === -1 || adminIndex === undefined) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Update field yang diperbolehkan
    const { name, email, preferences } = req.body;
    
    if (name) db.users[adminIndex].name = name;
    if (email) db.users[adminIndex].email = email;
    if (preferences) {
      db.users[adminIndex].preferences = {
        ...db.users[adminIndex].preferences,
        ...preferences
      };
    }

    await writeDB(db);
    
    res.status(200).json({ 
      message: "Profil admin berhasil diperbarui", 
      user: db.users[adminIndex] 
    });
  } catch (error) {
    console.error("Error updateAdminProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
