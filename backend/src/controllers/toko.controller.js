import { readDB, writeDB } from "../services/data.service.js";

/**
 * GET /api/toko/dashboard
 * Mengembalikan data untuk TokoDashboard.js
 */
export const getTokoDashboard = async (req, res) => {
  try {
    const db = await readDB();
    const products = db.products || [];
    const sales = db.toko_sales || [];
    const expenses = db.toko_expenses || [];
    const activities = db.toko_activities || [];

    // 1. Summary Cards
    const totalStok = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);
    const stokMenipis = products.filter(p => p.status === "Menipis").length;
    
    // Penjualan Hari ini (ambil data terakhir)
    const todaySales = sales.length > 0 ? sales[sales.length - 1].total : 0;
    const todayExpenses = expenses.length > 0 ? expenses[expenses.length - 1].total : 0;

    const summary = {
      totalStok: { value: totalStok.toLocaleString("id-ID"), subtext: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}` },
      stokMenipis: { value: stokMenipis.toString(), subtext: "Perlu restock segera" },
      pesananPenjualan: { value: "24", subtext: "Menunggu diproses" }, // Mock or from separate orders table
      penjualanHariIni: { value: `Rp ${todaySales.toLocaleString("id-ID")}`, trend: "▲ 12.5%" },
      pengeluaranHariIni: { value: `Rp ${todayExpenses.toLocaleString("id-ID")}`, trend: "▼ 5.3%" }
    };

    // 2. Best Sellers (Top 5 by 'sold')
    const bestSellers = [...products]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        sold: p.sold || 0,
        unit: p.unit,
        stock: p.stock
      }));

    // 3. Stock Summary (Donut Chart)
    const stockSummary = {
      aman: products.filter(p => p.status === "Aman").reduce((s, p) => s + p.stock, 0),
      menipis: products.filter(p => p.status === "Menipis").reduce((s, p) => s + p.stock, 0),
      habis: products.filter(p => p.status === "Habis").reduce((s, p) => s + p.stock, 0),
      total: totalStok
    };

    res.status(200).json({
      summary,
      bestSellers,
      recentActivities: activities,
      salesChart: sales,
      stockSummary
    });
  } catch (error) {
    console.error("Error getTokoDashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/stock
 * Mengembalikan data untuk StokToko.js
 */
export const getTokoStock = async (req, res) => {
  try {
    const db = await readDB();
    const products = db.products || [];

    const totalStok = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);
    const stokMenipisCount = products.filter(p => p.status === "Menipis").length;
    const stokHabisCount = products.filter(p => p.status === "Habis").length;

    const summary = [
      { label: "Total Produk", value: products.length.toString(), unit: "Produk", icon: "📦" },
      { label: "Total Stok",   value: totalStok.toLocaleString("id-ID"), unit: "Item", icon: "🌐", subtext: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}` },
      { label: "Stok Tersedia", value: products.filter(p => p.status === "Aman").reduce((s, p) => s + p.stock, 0).toLocaleString("id-ID"), unit: "Item", icon: "✅" },
      { label: "Stok Menipis", value: stokMenipisCount.toString(), unit: "Item", icon: "⚠️" },
      { label: "Stok Habis",   value: stokHabisCount.toString(), unit: "Item", icon: "🚫" },
    ];

    res.status(200).json({ summary, products });
  } catch (error) {
    console.error("Error getTokoStock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/orders
 * Mengembalikan data untuk PesananPenjualanToko.js
 */
export const getTokoOrders = async (req, res) => {
  try {
    const db = await readDB();
    const orders = db.toko_orders || [];
    const activities = db.toko_activities.filter(a => a.type === "order" || a.type === "payment");

    const totalValue = orders.reduce((s, o) => s + (o.total || 0), 0);

    const summary = [
      { label: "Total Pesanan", value: orders.length.toString(), unit: "transaksi", icon: "📄" },
      { label: "Pesanan Hari Ini", value: orders.filter(o => o.date.includes("24 Mei")).length.toString(), unit: "transaksi", icon: "🛒" },
      { label: "Menunggu Pembayaran", value: orders.filter(o => o.payment === "Belum Bayar").length.toString(), unit: "transaksi", icon: "💳" },
      { label: "Nilai Penjualan", value: `Rp ${totalValue.toLocaleString("id-ID")}`, unit: "", icon: "📈" },
      { label: "Perlu Diproses", value: orders.filter(o => o.status === "Menunggu" || o.status === "Diproses").length.toString(), unit: "pesanan", icon: "📦" },
    ];

    res.status(200).json({ summary, orders, recentActivities: activities });
  } catch (error) {
    console.error("Error getTokoOrders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/receipts
 * Mengembalikan data untuk PenerimaanBarangToko.js
 */
export const getTokoReceipts = async (req, res) => {
  try {
    const db = await readDB();
    const receipts = db.toko_receipts || [];
    
    const summary = [
      { label: "Total Penerimaan", value: receipts.length.toString(), unit: "transaksi", icon: "📥" },
      { label: "Total Item Diterima", value: "2.450", unit: "item", icon: "📦" }, // Mock sum
      { label: "Nilai Penerimaan", value: `Rp ${receipts.reduce((s, r) => s + r.value, 0).toLocaleString("id-ID")}`, unit: "", icon: "💰" },
      { label: "Penerimaan Hari Ini", value: receipts.filter(r => r.date.includes("24 Mei")).length.toString(), unit: "transaksi", icon: "📅" },
      { label: "Barang Pending", value: receipts.filter(r => r.status === "Proses" || r.status === "Menunggu").length.toString(), unit: "transaksi", icon: "⏳" },
    ];

    res.status(200).json({ summary, receipts });
  } catch (error) {
    console.error("Error getTokoReceipts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/dispatches
 * Mengembalikan data untuk PengeluaranBarangToko.js
 */
export const getTokoDispatches = async (req, res) => {
  try {
    const db = await readDB();
    const dispatches = db.toko_dispatches || [];

    const summary = [
      { label: "Total Pengeluaran", value: dispatches.length.toString(), unit: "transaksi", icon: "📤" },
      { label: "Total Item Keluar", value: "1.180", unit: "item", icon: "📦" }, // Mock sum
      { label: "Nilai Pengeluaran", value: `Rp ${dispatches.reduce((s, d) => s + d.value, 0).toLocaleString("id-ID")}`, unit: "", icon: "💰" },
      { label: "Pengeluaran Hari Ini", value: dispatches.filter(d => d.date.includes("24 Mei")).length.toString(), unit: "transaksi", icon: "📅" },
      { label: "Barang Pending", value: dispatches.filter(d => d.status === "Proses" || d.status === "Menunggu").length.toString(), unit: "transaksi", icon: "⏳" },
    ];

    res.status(200).json({ summary, dispatches });
  } catch (error) {
    console.error("Error getTokoDispatches:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/requests
 * Mengembalikan data untuk RequestToko.js
 */
export const getTokoRequests = async (req, res) => {
  try {
    const db = await readDB();
    const requests = db.stock_requests || [];

    const summary = [
      { label: "Total Permintaan", value: requests.length.toString(), unit: "transaksi", icon: "📝" },
      { label: "Permintaan Disetujui", value: requests.filter(r => r.status === "Disetujui").length.toString(), unit: "transaksi", icon: "✅" },
      { label: "Menunggu Persetujuan", value: requests.filter(r => r.status === "Menunggu").length.toString(), unit: "transaksi", icon: "⏳" },
      { label: "Permintaan Ditolak", value: requests.filter(r => r.status === "Ditolak").length.toString(), unit: "transaksi", icon: "❌" },
    ];

    res.status(200).json({ summary, requests });
  } catch (error) {
    console.error("Error getTokoRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/transfers
 * Mengembalikan data untuk TransferBarangToko.js
 */
export const getTokoTransfers = async (req, res) => {
  try {
    const db = await readDB();
    const transfers = db.toko_transfers || [];
    
    const summary = [
      { label: "Total Transfer", value: transfers.length.toString(), unit: "transaksi", icon: "⇄" },
      { label: "Total Item Ditransfer", value: "860", unit: "item", icon: "📦" }, // Mock
      { label: "Nilai Transfer", value: `Rp ${transfers.reduce((s, t) => s + (t.value || 0), 0).toLocaleString("id-ID")}`, unit: "", icon: "💰" },
      { label: "Transfer Hari Ini", value: transfers.filter(t => t.date.includes("24 Mei")).length.toString(), unit: "transaksi", icon: "📅" },
      { label: "Dalam Pengiriman", value: transfers.filter(t => t.status === "Dikirim").length.toString(), unit: "transaksi", icon: "🚚" },
    ];

    res.status(200).json({ summary, transfers });
  } catch (error) {
    console.error("Error getTokoTransfers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/adjustments
 * Mengembalikan data untuk PenyesuaianStokToko.js
 */
export const getTokoAdjustments = async (req, res) => {
  try {
    const db = await readDB();
    const adjustments = db.toko_adjustments || [];
    res.status(200).json({ adjustments });
  } catch (error) {
    console.error("Error getTokoAdjustments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/returns
 * Mengembalikan data untuk ReturPenjualanToko.js
 */
export const getTokoReturns = async (req, res) => {
  try {
    const db = await readDB();
    const returns = db.toko_returns || [];
    res.status(200).json({ returns });
  } catch (error) {
    console.error("Error getTokoReturns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/history
 * Mengembalikan data untuk RiwayatToko.js
 */
export const getTokoHistory = async (req, res) => {
  try {
    const db = await readDB();
    const history = db.toko_history || [];
    res.status(200).json({ history });
  } catch (error) {
    console.error("Error getTokoHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/toko/shipment/:id
 * Mengembalikan data pengiriman berdasarkan requestId
 */
export const getShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const shipment = db.shipments?.[id] || null;
    
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    
    res.status(200).json(shipment);
  } catch (error) {
    console.error("Error getShipment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/toko/shipment/:id/complete
 * Menyelesaikan pengiriman (barang diterima oleh toko)
 */
export const completeShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    const request = (db.requests || []).find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (request.status !== "Mengirim") {
      return res.status(400).json({ message: "Request is not in shipping state" });
    }
    
    // Update status
    request.status = "Selesai";
    
    // Add activity log
    db.toko_activities = db.toko_activities || [];
    db.toko_activities.unshift({
      id: Date.now(),
      type: "done",
      text: `Pengiriman ${id} telah diterima`,
      user: "Admin Toko",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      icon: "✅",
      iconClass: "activity-icon--green"
    });

    // Write back to DB
    await writeDB(db);
    
    res.status(200).json({ message: "Shipment completed successfully", request });
  } catch (error) {
    console.error("Error completeShipment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
