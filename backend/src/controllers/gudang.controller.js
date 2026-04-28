import { readDB } from "../services/data.service.js";

/**
 * GET /api/gudang/dashboard
 * Mengembalikan semua data yang dibutuhkan GudangDashboard.js
 */
export const getGudangDashboard = async (req, res) => {
  try {
    const db = await readDB();

    const products  = db.products  || [];
    const orders    = db.orders    || [];
    const movements = db.movements || [];
    const activities= db.activities|| [];

    /* ── STATS ────────────────────────────────────────────── */
    const totalStok   = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai  = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

    // Ambil gerakan hari ini (filter berdasarkan date field — gunakan semua data sebagai "hari ini" untuk prototype)
    const movIn  = movements.filter(m => m.type === "Stok Masuk");
    const movOut = movements.filter(m => m.type === "Stok Keluar");
    const movTr  = movements.filter(m => m.type === "Transfer");

    const totalMasuk   = movIn.reduce((s, m) => s + (m.in  || 0), 0);
    const totalKeluar  = movOut.reduce((s, m) => s + (m.out || 0), 0);
    const totalTransfer= movTr.reduce((s, m) => s + (m.out || m.in || 0), 0);

    const orderPending = orders.filter(o =>
      o.status === "Pending" || o.status === "Menunggu"
    ).length;

    const stats = [
      {
        label: "Total Stok",
        value: totalStok.toLocaleString("id-ID"),
        sub: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}`,
        icon: "📦", color: "#1890ff", bg: "#e6f7ff"
      },
      {
        label: "Barang Masuk (Hari Ini)",
        value: totalMasuk.toString(),
        sub: `${movIn.length} Transaksi`,
        icon: "⬇️", color: "#52c41a", bg: "#f6ffed"
      },
      {
        label: "Barang Keluar (Hari Ini)",
        value: totalKeluar.toString(),
        sub: `${movOut.length} Transaksi`,
        icon: "⬆️", color: "#e4915a", bg: "#fff8f3"
      },
      {
        label: "Transfer (Hari Ini)",
        value: totalTransfer.toString(),
        sub: `${movTr.length} Transaksi`,
        icon: "⇄", color: "#722ed1", bg: "#f9f0ff"
      },
      {
        label: "Order Menunggu Proses",
        value: orderPending.toString(),
        sub: "Order",
        icon: "🕒", color: "#fa8c16", bg: "#fff7e6",
        link: "Lihat detail >"
      },
    ];

    /* ── RECENT ORDERS ────────────────────────────────────── */
    const recentOrders = orders.slice(0, 5).map(o => ({
      id:     o.id,
      from:   o.party,
      date:   o.date,
      items:  o.items,
      status: (() => {
        if (o.status === "Pending")    return "Menunggu";
        if (o.status === "Processing") return "Proses";
        if (o.status === "Completed")  return "Selesai";
        if (o.status === "Shipped")    return "Dikirim";
        return o.status;
      })(),
    }));

    /* ── ACTIVITIES (dari movements) ──────────────────────── */
    const typeColor = {
      "Stok Masuk": "#52c41a",
      "Stok Keluar": "#e4915a",
      "Transfer": "#1890ff",
    };

    const actFromMovements = movements.slice(0, 5).map(m => ({
      time:  m.time,
      title: m.type === "Stok Masuk"
        ? `Penerimaan barang dari ${m.loc}`
        : m.type === "Stok Keluar"
        ? `Pengeluaran barang untuk ${m.loc}`
        : `Transfer ke ${m.loc}`,
      sub:   m.ref,
      tag:   `${m.in || m.out || 0} item`,
      color: typeColor[m.type] || "#888",
    }));

    // Tambahkan dari activities db jika ada
    const actFromDB = activities.slice(0, 2).map(a => ({
      time:  a.time,
      title: a.message,
      sub:   a.sub,
      tag:   "",
      color: a.type === "order" ? "#52c41a" : a.type === "stock" ? "#1890ff" : "#e4915a",
    }));

    const activityList = actFromMovements.length > 0 ? actFromMovements : actFromDB;

    /* ── ALERTS ───────────────────────────────────────────── */
    const lowStock    = products.filter(p => p.stockStatus === "Stok rendah").length;
    const outOfStock  = products.filter(p => p.stock === 0).length;
    const lateOrders  = orders.filter(o =>
      o.status === "Pending" || o.status === "Menunggu"
    ).length;

    const alerts = [
      { label: "Stok Menipis",    val: lowStock.toString(),   sub: "Produk", icon: "⚠️",  color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis",      val: outOfStock.toString(), sub: "Produk", icon: "🚫",  color: "#ff4d4f", bg: "#fff1f0" },
      { label: "Order Terlambat", val: lateOrders.toString(), sub: "Order",  icon: "🕒",  color: "#722ed1", bg: "#f9f0ff" },
    ];

    /* ── RESPONSE ─────────────────────────────────────────── */
    res.status(200).json({ stats, recentOrders, activities: activityList, alerts });
  } catch (error) {
    console.error("Error getGudangDashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
