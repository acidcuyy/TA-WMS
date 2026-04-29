import { getCollection, updateCollection } from "../services/data.service.js";

export const getOrders = async (req, res) => {
  const orders = await getCollection("orders");
  res.status(200).json(orders);
};

export const getOrderStats = async (req, res) => {
  const orders = await getCollection("orders");
  
  const stats = [
    { label: "Total Order", value: orders.length, hint: "Semua order", icon: "🏠", color: "#e4915a", bg: "#fff8f3" },
    { label: "Pending", value: orders.filter(o => o.status === 'Pending').length, hint: "Menunggu diproses", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    { label: "Processing", value: orders.filter(o => o.status === 'Processing').length, hint: "Sedang diproses", icon: "⚙️", color: "#1890ff", bg: "#e6f7ff" },
    { label: "Shipped", value: orders.filter(o => o.status === 'Shipped').length, hint: "Dalam pengiriman", icon: "🚚", color: "#52c41a", bg: "#f6ffed" },
    { label: "Completed", value: orders.filter(o => o.status === 'Completed').length, hint: "Selesai", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
  ];

  const totalValue = orders.reduce((acc, o) => acc + o.value, 0);
  const avgValue = orders.length > 0 ? totalValue / orders.length : 0;

  const analytics = [
    { label: "Rata-rata Nilai Order", value: `Rp ${avgValue.toLocaleString("id-ID")}`, sub: `Dari ${orders.length} order`, icon: "🏪" },
    { label: "Order Bulan Ini", value: orders.length.toString(), sub: "↑ 12% dari bulan lalu", icon: "📊" },
    { label: "Item Terjual", value: orders.reduce((acc, o) => acc + o.items, 0) + " item", sub: "Dari sales order", icon: "🛒" },
    { label: "Tingkat Penyelesaian", value: `${((orders.filter(o => ['Completed', 'Shipped'].includes(o.status)).length / orders.length) * 100 || 0).toFixed(1)}%`, sub: "Completed + Shipped", icon: "📈" },
  ];

  res.status(200).json({ stats, analytics });
};

export const createOrder = async (req, res) => {
  const orders = await getCollection("orders");
  const newOrder = {
    ...req.body,
    date: new Date().toLocaleString("id-ID", { day: "2d", month: "short", year: "numeric", hour: "2d", minute: "2d" }),
    status: req.body.status || "Pending",
  };

  orders.unshift(newOrder);
  await updateCollection("orders", orders);

  res.status(201).json({
    message: "Order berhasil dibuat",
    data: newOrder,
  });
};
