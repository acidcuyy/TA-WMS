import { readDB } from "../services/data.service.js";

export const getDashboardData = async (req, res) => {
  const db = await readDB();
  if (!db) return res.status(500).json({ message: "Gagal membaca database" });

  const products = db.products || [];
  const orders = db.orders || [];
  const activities = db.activities || [];
  const warehouseSummary = db.warehouse_summary || [];

  // Calculate Stats
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const outOfStockItems = products.filter(p => p.stock === 0).length;
  const lowStockAlerts = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  // Mock trends and rates for now
  const stats = [
    { label: "Total Inventory Value", value: `Rp ${totalInventoryValue.toLocaleString("id-ID")}`, trend: "+12.5%", sub: "vs minggu lalu", icon: "💰", color: "#e4915a" },
    { label: "Total Orders", value: orders.length.toString(), trend: "+8.2%", sub: "vs minggu lalu", icon: "🛍️", color: "#e4915a" },
    { label: "Fulfillment Rate", value: "98.5%", trend: "+2.1%", sub: "vs minggu lalu", icon: "🎯", color: "#e4915a" },
    { label: "Out of Stock Items", value: outOfStockItems.toString(), trend: "↑ 4", sub: "vs minggu lalu", icon: "📦", color: "#e4915a", danger: true },
    { label: "Low Stock Alerts", value: lowStockAlerts.toString(), trend: "↑ 6", sub: "vs minggu lalu", icon: "⚠️", color: "#e4915a", danger: true },
    { label: "Stock Turnover", value: "6.2x", trend: "↑ 1.1x", sub: "vs minggu lalu", icon: "🔄", color: "#e4915a" },
  ];

  // Top 5 Products (Simulated based on existing products)
  const topProducts = products.slice(0, 5).map(p => ({
    name: p.name,
    sold: Math.floor(Math.random() * 1000) + " unit", // Mock sold data
    available: p.stock + " unit"
  }));

  res.status(200).json({
    stats,
    activities,
    recentOrders: orders,
    warehouseSummary,
    topProducts,
    stockMovement: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      stockIn: [30, 40, 35, 50, 45, 60, 55],
      stockOut: [20, 25, 30, 25, 35, 40, 30]
    },
    stockHealth: {
      fastMoving: 35,
      mediumMoving: 40,
      slowMoving: 15,
      deadStock: 10,
      totalItems: products.reduce((acc, p) => acc + p.stock, 0)
    }
  });
};
