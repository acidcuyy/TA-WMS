import { readDB } from "../services/data.service.js";

export const getStoreSummary = async (req, res) => {
  const db = await readDB();
  if (!db) return res.status(500).json({ message: "Gagal membaca database" });

  const stores = db.stores || [];
  const reports = db.store_reports || [];
  const shipments = db.shipments || [];
  const transactions = db.store_transactions || [];
  const stockRequests = db.stock_requests || [];

  res.status(200).json({
    summary: {
      tokoAktif: stores.length,
      transaksiHariIni: 76, // Mock
      pendingRestock: stockRequests.filter(r => r.status === 'Pending').length,
      estimasiOmzet: 12500000 // Mock
    },
    reports,
    shipments: shipments.map(s => ({
      ...s,
      progress: s.status === 'Terkirim' ? 100 : 75 // Mock progress
    })),
    transactions,
    requests: stockRequests.map(r => ({
      id: "T-" + r.id,
      toko: "Toko A", // Mock
      tanggal: r.tanggal,
      item: r.jumlah,
      catatan: r.catatan,
      status: r.status === 'Pending' ? 'Pending' : 'Accepted' // Simulating for store view
    }))
  });
};
