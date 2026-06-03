import { getAllProducts, getAllRequests } from "../services/data.service.js";

export const getWarehouseOperasional = async (req, res) => {
  try {
    const products = await getAllProducts();
    const stockRequests = await getAllRequests();

    const totalItem      = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const categoriesCount = new Set(products.map(p => p.cat || p.category)).size;
    const lowStockCount  = products.filter(p => p.stock > 0 && p.stock <= 50).length;
    const totalValue     = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);

    res.status(200).json({
      stats: {
        totalItem, kategori: categoriesCount,
        lowStock: lowStockCount, inboundToday: 0, outboundToday: 0,
        estimasiNilai: totalValue,
      },
      reports:   [],
      shipments: [],
      requests:  stockRequests.map(r => ({
        id: r.id, toko: r.from_name || r.fromName,
        item: r.items?.length || 0, status: r.status,
      })),
    });
  } catch (err) {
    console.error("Error getWarehouseOperasional:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
