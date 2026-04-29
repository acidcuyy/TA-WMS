import { readDB } from "../services/data.service.js";

export const getStockReport = async (req, res) => {
  const db = await readDB();
  if (!db) return res.status(500).json({ message: "Gagal membaca database" });

  const products = db.products || [];
  const warehouseSummary = db.warehouse_summary || [];

  res.status(200).json({
    stats: [
      { label: "Total Stok Saat Ini", value: products.reduce((acc, p) => acc + p.stock, 0).toLocaleString(), hint: "Semua gudang & toko", icon: "🏠", color: "#e4915a", bg: "#fff8f3" },
      { label: "Nilai Inventory", value: `Rp ${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}`, hint: "Total nilai stok saat ini", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
      { label: "Stok Masuk (Periode)", value: "2.860", hint: "↑ 12.5% dari periode lalu", icon: "⬇️", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Stok Keluar (Periode)", value: "2.180", hint: "↑ 8.3% dari periode lalu", icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
      { label: "Item Low Stock", value: products.filter(p => p.stockStatus === "Stok rendah").length.toString(), hint: "Perlu restock", icon: "⚠️", color: "#ff4d4f", bg: "#fff1f0" },
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
      cat: p.category,
      loc: "Gudang Pusat",
      start: p.stock + 10, // Mock
      in: 20,
      out: 30,
      end: p.stock,
      status: p.stockStatus
    }))
  });
};

export const getOrderReport = async (req, res) => {
  const db = await readDB();
  const orders = db.orders || [];

  res.status(200).json({
    stats: [
      { label: "Total Order", value: orders.length.toString(), hint: "↑ 12.5% dari periode lalu", icon: "📊", color: "#e4915a", bg: "#fff8f3" },
      { label: "Sales Order", value: orders.filter(o => o.type === "Sales Order").length.toString(), hint: "↑ 10.2% dari periode lalu", icon: "🛒", color: "#52c41a", bg: "#f6ffed" },
      { label: "Purchase Order", value: orders.filter(o => o.type === "Purchase Order").length.toString(), hint: "↓ 5.1% dari periode lalu", icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Transfer Order", value: orders.filter(o => o.type === "Transfer Order").length.toString(), hint: "↑ 8.7% dari periode lalu", icon: "⇄", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Total Nilai Order", value: `Rp ${orders.reduce((acc, o) => acc + o.value, 0).toLocaleString()}`, hint: "↑ 13.4% dari periode lalu", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
    ],
    orders
  });
};

export const getMovementReport = async (req, res) => {
  const db = await readDB();
  const movements = db.movements || [];

  res.status(200).json({
    movements
  });
};

export const getProductionReport = async (req, res) => {
  const db = await readDB();
  const productions = db.productions || [];

  res.status(200).json({
    productions
  });
};
