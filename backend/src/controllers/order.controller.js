import pool from "../config/db.js";

export const getOrders = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM toko_orders ORDER BY created_at DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getOrders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM toko_orders");
    const total = rows.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const avg   = rows.length > 0 ? total / rows.length : 0;

    const stats = [
      { label: "Total Order",   value: rows.length,                                                    hint: "Semua order",         icon: "🏠",  color: "#e4915a", bg: "#fff8f3" },
      { label: "Pending",       value: rows.filter(o => o.status === "Menunggu").length,               hint: "Menunggu diproses",   icon: "🕒",  color: "#fa8c16", bg: "#fff7e6" },
      { label: "Processing",    value: rows.filter(o => o.status === "Diproses").length,               hint: "Sedang diproses",     icon: "⚙️", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Shipped",       value: rows.filter(o => o.status === "Dikirim").length,                hint: "Dalam pengiriman",    icon: "🚚",  color: "#52c41a", bg: "#f6ffed" },
      { label: "Completed",     value: rows.filter(o => o.status === "Selesai").length,                hint: "Selesai",             icon: "✅",  color: "#52c41a", bg: "#f6ffed" },
    ];

    const analytics = [
      { label: "Rata-rata Nilai Order",  value: `Rp ${avg.toLocaleString("id-ID")}`,                  sub: `Dari ${rows.length} order`, icon: "🏪" },
      { label: "Order Bulan Ini",        value: rows.length.toString(),                                sub: "Total",                      icon: "📊" },
      { label: "Item Terjual",           value: `${rows.length} order`,                                sub: "Dari sales order",            icon: "🛒" },
      { label: "Tingkat Penyelesaian",   value: rows.length > 0
          ? `${((rows.filter(o => o.status === "Selesai").length / rows.length) * 100).toFixed(1)}%`
          : "0%",
        sub: "Completed", icon: "📈" },
    ];

    res.status(200).json({ stats, analytics });
  } catch (err) {
    console.error("Error getOrderStats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { id, client, channel, date, items, total, payment, status } = req.body;
    const orderId = id || `SO-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO toko_orders (id, client, channel, date, items, total, payment, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [orderId, client, channel, date, items, total || 0, payment || "Belum Bayar", status || "Menunggu"]
    );
    res.status(201).json({ message: "Order berhasil dibuat", data: rows[0] });
  } catch (err) {
    console.error("Error createOrder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
