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

// GET Profile Gudang
export const getGudangProfile = async (req, res) => {
  try {
    const db = await readDB();
    const user = db.users?.find(u => u.role === 'gudang') || {};
    
    // Stats for ProfileGudang.js
    const products = db.products || [];
    const stockRequests = db.stock_requests || [];

    const profile = {
      name: user.name || "Admin Gudang",
      email: user.email || "gudang@reastock.com",
      role: "Gudang",
      lastLogin: user.lastLogin || "13 Mei 2025, 09:40",
      joinedSince: user.joinedSince || "10 Januari 2025",
      preferences: (db.user_settings || []).find(s => s.role === 'gudang') || { notifStock: true, notifRequests: true }
    };

    const stats = [
      { label: "Request Baru", value: stockRequests.filter(r => r.status === "Pending").length.toString(), sub: "Hari ini", icon: "📄" },
      { label: "Stok Menipis", value: products.filter(p => p.status === "Menipis").length.toString(), sub: "Butuh perhatian", icon: "📦" },
      { label: "Sinkronisasi", value: "Aktif", sub: "Realtime", icon: "🔄" },
    ];

    // Mock activities for ProfileGudang.js
    const activities = [
      { time: "10:12", desc: "Request REQ-014 masuk dari Toko A", type: "request" },
      { time: "09:40", desc: "Stok Barang SKA-001 menipis", type: "stock" },
      { time: "Kemarin", desc: "Update profil gudang", type: "profile" }
    ];

    res.status(200).json({ profile, stats, activities });
  } catch (error) {
    console.error("Error getGudangProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT Update Profile Gudang
export const updateGudangProfile = async (req, res) => {
  try {
    const db = await readDB();
    const idx = db.users?.findIndex(u => u.role === 'gudang');
    if (idx === -1) return res.status(404).json({ message: "Gudang user not found" });

    const { name, email, preferences } = req.body;
    if (name) db.users[idx].name = name;
    if (email) db.users[idx].email = email;

    if (preferences) {
      const sIdx = db.user_settings?.findIndex(s => s.role === 'gudang');
      if (sIdx !== -1) {
        db.user_settings[sIdx] = { ...db.user_settings[sIdx], ...preferences };
      }
    }

    await writeDB(db);
    res.status(200).json({ message: "Profil gudang diperbarui", user: db.users[idx] });
  } catch (error) {
    console.error("Error updateGudangProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
