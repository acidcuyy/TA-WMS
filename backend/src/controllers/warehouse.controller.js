import { getCollection, readDB } from "../services/data.service.js";

export const getWarehouseOperasional = async (req, res) => {
  const db = await readDB();
  if (!db) return res.status(500).json({ message: "Gagal membaca database" });

  const products = db.products || [];
  const reports = db.reports || [];
  const shipments = db.shipments || [];
  const stockRequests = db.stock_requests || [];

  const totalItem = products.reduce((acc, p) => acc + p.stock, 0);
  const categoriesCount = new Set(products.map(p => p.category)).size;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  res.status(200).json({
    stats: {
      totalItem,
      kategori: categoriesCount,
      lowStock: lowStockCount,
      inboundToday: 120, // Mock
      outboundToday: 78, // Mock
      estimasiNilai: totalValue
    },
    reports,
    shipments,
    requests: stockRequests.map(r => ({
      id: r.id,
      toko: "Toko A", // Mock for now
      tanggal: r.tanggal,
      item: r.barang,
      qty: r.jumlah + " pcs",
      catatan: r.catatan,
      status: r.status
    }))
  });
};
