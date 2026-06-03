import { readDB } from "../services/data.service.js";

export const getStockReport = async (req, res) => {
  try {
    const db = await readDB();
    const products = db.products || [];
    const warehouseSummary = db.warehouse_summary || [
      { name: "Gudang Pusat", stock: products.reduce((acc, p) => acc + (p.stock || 0), 0), status: "Normal" }
    ];

    res.status(200).json({
      stats: [
        { label: "Total Stok Saat Ini", value: products.reduce((acc, p) => acc + (p.stock || 0), 0).toLocaleString(), hint: "Semua gudang & toko", icon: "🏠", color: "#e4915a", bg: "#fff8f3" },
        { label: "Nilai Inventory", value: `Rp ${products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString()}`, hint: "Total nilai stok saat ini", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
        { label: "Stok Masuk (Periode)", value: "2.860", hint: "↑ 12.5% dari periode lalu", icon: "⬇️", color: "#1890ff", bg: "#e6f7ff" },
        { label: "Stok Keluar (Periode)", value: "2.180", hint: "↑ 8.3% dari periode lalu", icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
        { label: "Item Low Stock", value: products.filter(p => p.status === "Menipis" || p.status === "Habis").length.toString(), hint: "Perlu restock", icon: "⚠️", color: "#ff4d4f", bg: "#fff1f0" },
      ],
      locations: warehouseSummary.map(w => ({
        name: w.name,
        items: w.stock.toLocaleString(),
        value: w.stock * 15000, // Mock value
        status: w.status,
        statusColor: w.status === 'Normal' ? '#52c41a' : w.status === 'Low Stock' ? '#fa8c16' : '#ff4d4f',
        icon: "🏢",
        bg: "#f0f5ff"
      })),
      products: products.map(p => ({
        name: p.name,
        sku: p.sku,
        cat: p.cat || p.category,
        loc: "Gudang Pusat",
        start: (p.stock || 0) + 10, // Mock
        in: 20,
        out: 30,
        end: p.stock || 0,
        status: p.status
      }))
    });
  } catch (err) {
    console.error("Error getStockReport:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderReport = async (req, res) => {
  try {
    const db = await readDB();
    const orders = db.toko_orders || [];

    res.status(200).json({
      stats: [
        { label: "Total Order", value: orders.length.toString(), hint: "Total periode ini", icon: "📊", color: "#e4915a", bg: "#fff8f3" },
        { label: "Sales Order", value: orders.length.toString(), hint: "Dari Toko", icon: "🛒", color: "#52c41a", bg: "#f6ffed" },
        { label: "Purchase Order", value: "0", hint: "0% dari periode lalu", icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
        { label: "Transfer Order", value: "0", hint: "0% dari periode lalu", icon: "⇄", color: "#fa8c16", bg: "#fff7e6" },
        { label: "Total Nilai Order", value: `Rp ${orders.reduce((acc, o) => acc + Number(o.total || 0), 0).toLocaleString()}`, hint: "Total nilai periode ini", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
      ],
      orders
    });
  } catch (err) {
    console.error("Error getOrderReport:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovementReport = async (req, res) => {
  try {
    res.status(200).json({ movements: [] });
  } catch (err) {
    console.error("Error getMovementReport:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductionReport = async (req, res) => {
  try {
    res.status(200).json({ productions: [] });
  } catch (err) {
    console.error("Error getProductionReport:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
