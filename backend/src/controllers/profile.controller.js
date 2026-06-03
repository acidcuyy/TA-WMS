import {
  getUserByRole,
  updateUser,
  getAllProducts,
  getAllRequests,
  getTokoActivities,
  getTokoOrders as dbGetTokoOrders,
  getUserSettings,
} from "../services/data.service.js";

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const getAdminProfile = async (req, res) => {
  try {
    const user     = await getUserByRole("admin");
    const products = await getAllProducts();
    const requests = await getAllRequests();

    const pendingRequests = requests.filter(r => r.status !== "Selesai").length;
    const lowStockCount   = products.filter(p => p.status === "Menipis" || p.status === "Habis").length;

    const profile = {
      name:        user?.name      || "Super Admin",
      email:       user?.email     || "admin@gmail.com",
      role:        "Admin",
      lastLogin:   user?.last_login ? new Date(user.last_login).toLocaleString("id-ID") : "-",
      joinedSince: user?.joined_since || "10 Januari 2025",
      preferences: { notifStock: true, notifRequests: true },
    };

    const stats = [
      { label: "Requests Baru", value: pendingRequests.toString(), sub: "Hari ini",       icon: "🗒️" },
      { label: "Stok Menipis",  value: lowStockCount.toString(),   sub: "Butuh perhatian", icon: "📦" },
      { label: "Sinkronisasi",  value: "Aktif",                    sub: "Realtime",        icon: "🔄" },
    ];

    res.status(200).json({ profile, stats, activities: [] });
  } catch (err) {
    console.error("Error getAdminProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const fields = {};
    if (name)  fields.name  = name;
    if (email) fields.email = email;

    const updated = await updateUser("admin", fields);
    res.status(200).json({ message: "Profil admin berhasil diperbarui", user: updated });
  } catch (err) {
    console.error("Error updateAdminProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GUDANG ───────────────────────────────────────────────────────────────────

export const getGudangProfile = async (req, res) => {
  try {
    const user     = await getUserByRole("gudang");
    const products = await getAllProducts();
    const requests = await getAllRequests();
    const settings = await getUserSettings("gudang");

    const profile = {
      name:        user?.name      || "Admin Gudang",
      email:       user?.email     || "gudang@wms.com",
      role:        "Gudang",
      lastLogin:   user?.last_login ? new Date(user.last_login).toLocaleString("id-ID") : "-",
      joinedSince: user?.joined_since || "10 Januari 2025",
      preferences: { notifStock: settings.notif_stock, notifRequests: settings.notif_requests },
    };

    const stats = [
      { label: "Request Baru",  value: requests.filter(r => r.status === "Menunggu").length.toString(), sub: "Hari ini",       icon: "📄" },
      { label: "Stok Menipis",  value: products.filter(p => p.status === "Menipis").length.toString(),  sub: "Butuh perhatian", icon: "📦" },
      { label: "Sinkronisasi",  value: "Aktif",                                                          sub: "Realtime",        icon: "🔄" },
    ];

    const activities = [
      { time: "10:12",  desc: "Request REQ-014 masuk dari Toko A", type: "request" },
      { time: "09:40",  desc: "Stok Barang SKA-001 menipis",       type: "stock"   },
      { time: "Kemarin",desc: "Update profil gudang",               type: "profile" },
    ];

    res.status(200).json({ profile, stats, activities });
  } catch (err) {
    console.error("Error getGudangProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGudangProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const fields = {};
    if (name)  fields.name  = name;
    if (email) fields.email = email;

    const updated = await updateUser("gudang", fields);
    res.status(200).json({ message: "Profil gudang diperbarui", user: updated });
  } catch (err) {
    console.error("Error updateGudangProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── TOKO ─────────────────────────────────────────────────────────────────────

export const getTokoProfile = async (req, res) => {
  try {
    const user       = await getUserByRole("toko");
    const products   = await getAllProducts();
    const orders     = await dbGetTokoOrders();
    const activities = await getTokoActivities();

    const stats = {
      pesananBaru: orders.filter(o => o.status === "Menunggu" || o.status === "Diproses").length,
      stokMenipis: products.filter(p => p.status === "Menipis").length,
      syncStatus:  "Aktif",
    };

    res.status(200).json({ profile: user, stats, activities });
  } catch (err) {
    console.error("Error getTokoProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTokoProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const fields = {};
    if (name)  fields.name  = name;
    if (email) fields.email = email;

    const updated = await updateUser("toko", fields);
    res.status(200).json({ message: "Profil toko diperbarui", profile: updated });
  } catch (err) {
    console.error("Error updateTokoProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
