import {
  getAllProducts,
  getTokoOrders      as dbGetTokoOrders,
  getTokoReceipts    as dbGetTokoReceipts,
  getTokoDispatches  as dbGetTokoDispatches,
  getTokoTransfers   as dbGetTokoTransfers,
  getTokoAdjustments as dbGetTokoAdjustments,
  getTokoReturns     as dbGetTokoReturns,
  getTokoHistory     as dbGetTokoHistory,
  getTokoActivities  as dbGetTokoActivities,
  getTokoSales,
  getTokoExpenses,
  getAllRequests,
  getShipment        as dbGetShipment,
  updateRequestStatus,
  createNotification,
} from "../services/data.service.js";

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const getTokoDashboard = async (req, res) => {
  try {
    const products   = await getAllProducts();
    const sales      = await getTokoSales();
    const expenses   = await getTokoExpenses();
    const activities = await dbGetTokoActivities();

    const totalStok   = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai  = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);
    const stokMenipis = products.filter(p => p.status === "Menipis").length;

    const todaySales    = sales.length    > 0 ? sales[sales.length - 1].total : 0;
    const todayExpenses = expenses.length > 0 ? expenses[0].total : 0;

    const summary = {
      totalStok:          { value: totalStok.toLocaleString("id-ID"),                       subtext: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}` },
      stokMenipis:        { value: stokMenipis.toString(),                                  subtext: "Perlu restock segera" },
      pesananPenjualan:   { value: "24",                                                    subtext: "Menunggu diproses" },
      penjualanHariIni:   { value: `Rp ${Number(todaySales).toLocaleString("id-ID")}`,     trend: "▲ 12.5%" },
      pengeluaranHariIni: { value: `Rp ${Number(todayExpenses).toLocaleString("id-ID")}`,  trend: "▼ 5.3%" },
    };

    const bestSellers = [...products]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map(p => ({ id: p.id, name: p.name, sku: p.sku, sold: p.sold || 0, unit: p.unit, stock: p.stock }));

    const stockSummary = {
      aman:    products.filter(p => p.status === "Aman").reduce((s, p) => s + p.stock, 0),
      menipis: products.filter(p => p.status === "Menipis").reduce((s, p) => s + p.stock, 0),
      habis:   products.filter(p => p.status === "Habis").reduce((s, p) => s + p.stock, 0),
      total:   totalStok,
    };

    res.status(200).json({ summary, bestSellers, recentActivities: activities, salesChart: sales, stockSummary });
  } catch (err) {
    console.error("Error getTokoDashboard:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── STOK ────────────────────────────────────────────────────────────────────

export const getTokoStock = async (req, res) => {
  try {
    const products = await getAllProducts();
    const totalStok  = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

    const summary = [
      { label: "Total Produk",  value: products.length.toString(),                                                                                                unit: "Produk", icon: "📦" },
      { label: "Total Stok",    value: totalStok.toLocaleString("id-ID"),                                                                                         unit: "Item",   icon: "🌐", subtext: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}` },
      { label: "Stok Tersedia", value: products.filter(p => p.status === "Aman").reduce((s, p) => s + p.stock, 0).toLocaleString("id-ID"),                        unit: "Item",   icon: "✅" },
      { label: "Stok Menipis",  value: products.filter(p => p.status === "Menipis").length.toString(),                                                            unit: "Item",   icon: "⚠️" },
      { label: "Stok Habis",    value: products.filter(p => p.status === "Habis").length.toString(),                                                              unit: "Item",   icon: "🚫" },
    ];

    res.status(200).json({ summary, products });
  } catch (err) {
    console.error("Error getTokoStock:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PESANAN PENJUALAN ────────────────────────────────────────────────────────

export const getTokoOrders = async (req, res) => {
  try {
    const orders     = await dbGetTokoOrders();
    const allActs    = await dbGetTokoActivities();
    const activities = allActs.filter(a => a.type === "order" || a.type === "payment");
    const totalValue = orders.reduce((s, o) => s + Number(o.total || 0), 0);

    const summary = [
      { label: "Total Pesanan",        value: orders.length.toString(),                                                             unit: "transaksi", icon: "📄" },
      { label: "Pesanan Hari Ini",     value: orders.filter(o => String(o.date).includes("24 Mei")).length.toString(),             unit: "transaksi", icon: "🛒" },
      { label: "Menunggu Pembayaran",  value: orders.filter(o => o.payment === "Belum Bayar").length.toString(),                   unit: "transaksi", icon: "💳" },
      { label: "Nilai Penjualan",      value: `Rp ${totalValue.toLocaleString("id-ID")}`,                                         unit: "",          icon: "📈" },
      { label: "Perlu Diproses",       value: orders.filter(o => o.status === "Menunggu" || o.status === "Diproses").length.toString(), unit: "pesanan", icon: "📦" },
    ];

    res.status(200).json({ summary, orders, recentActivities: activities });
  } catch (err) {
    console.error("Error getTokoOrders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PENERIMAAN BARANG ────────────────────────────────────────────────────────

export const getTokoReceipts = async (req, res) => {
  try {
    const receipts = await dbGetTokoReceipts();
    const summary = [
      { label: "Total Penerimaan",    value: receipts.length.toString(),                                                                                   unit: "transaksi", icon: "📥" },
      { label: "Total Item Diterima", value: "2.450",                                                                                                      unit: "item",      icon: "📦" },
      { label: "Nilai Penerimaan",    value: `Rp ${receipts.reduce((s, r) => s + Number(r.value || 0), 0).toLocaleString("id-ID")}`,                      unit: "",          icon: "💰" },
      { label: "Penerimaan Hari Ini", value: receipts.filter(r => String(r.date).includes("24 Mei")).length.toString(),                                    unit: "transaksi", icon: "📅" },
      { label: "Barang Pending",      value: receipts.filter(r => r.status === "Proses" || r.status === "Menunggu").length.toString(),                     unit: "transaksi", icon: "⏳" },
    ];
    res.status(200).json({ summary, receipts });
  } catch (err) {
    console.error("Error getTokoReceipts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PENGELUARAN BARANG ───────────────────────────────────────────────────────

export const getTokoDispatches = async (req, res) => {
  try {
    const dispatches = await dbGetTokoDispatches();
    const summary = [
      { label: "Total Pengeluaran",    value: dispatches.length.toString(),                                                                                unit: "transaksi", icon: "📤" },
      { label: "Total Item Keluar",    value: "1.180",                                                                                                     unit: "item",      icon: "📦" },
      { label: "Nilai Pengeluaran",    value: `Rp ${dispatches.reduce((s, d) => s + Number(d.value || 0), 0).toLocaleString("id-ID")}`,                   unit: "",          icon: "💰" },
      { label: "Pengeluaran Hari Ini", value: dispatches.filter(d => String(d.date).includes("24 Mei")).length.toString(),                                 unit: "transaksi", icon: "📅" },
      { label: "Barang Pending",       value: dispatches.filter(d => d.status === "Proses" || d.status === "Menunggu").length.toString(),                  unit: "transaksi", icon: "⏳" },
    ];
    res.status(200).json({ summary, dispatches });
  } catch (err) {
    console.error("Error getTokoDispatches:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── REQUEST TOKO ─────────────────────────────────────────────────────────────

export const getTokoRequests = async (req, res) => {
  try {
    const requests = await getAllRequests();
    const tokoReq  = requests.filter(r => r.from_role === "toko");
    const summary  = [
      { label: "Total Permintaan",     value: tokoReq.length.toString(),                                           unit: "transaksi", icon: "📝" },
      { label: "Permintaan Disetujui", value: tokoReq.filter(r => r.decision === "Accepted").length.toString(),   unit: "transaksi", icon: "✅" },
      { label: "Menunggu Persetujuan", value: tokoReq.filter(r => r.status === "Menunggu").length.toString(),     unit: "transaksi", icon: "⏳" },
      { label: "Permintaan Ditolak",   value: tokoReq.filter(r => r.status === "Declined").length.toString(),     unit: "transaksi", icon: "❌" },
    ];
    res.status(200).json({ summary, requests: tokoReq });
  } catch (err) {
    console.error("Error getTokoRequests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── TRANSFER BARANG ──────────────────────────────────────────────────────────

export const getTokoTransfers = async (req, res) => {
  try {
    const transfers = await dbGetTokoTransfers();
    const summary   = [
      { label: "Total Transfer",        value: transfers.length.toString(),                                                                             unit: "transaksi", icon: "⇄" },
      { label: "Total Item Ditransfer", value: "860",                                                                                                  unit: "item",      icon: "📦" },
      { label: "Nilai Transfer",        value: `Rp ${transfers.reduce((s, t) => s + Number(t.value || 0), 0).toLocaleString("id-ID")}`,                unit: "",          icon: "💰" },
      { label: "Transfer Hari Ini",     value: transfers.filter(t => String(t.date).includes("24 Mei")).length.toString(),                             unit: "transaksi", icon: "📅" },
      { label: "Dalam Pengiriman",      value: transfers.filter(t => t.status === "Dikirim").length.toString(),                                        unit: "transaksi", icon: "🚚" },
    ];
    res.status(200).json({ summary, transfers });
  } catch (err) {
    console.error("Error getTokoTransfers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PENYESUAIAN STOK ─────────────────────────────────────────────────────────

export const getTokoAdjustments = async (req, res) => {
  try {
    const adjustments = await dbGetTokoAdjustments();
    res.status(200).json({ adjustments });
  } catch (err) {
    console.error("Error getTokoAdjustments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── RETUR PENJUALAN ──────────────────────────────────────────────────────────

export const getTokoReturns = async (req, res) => {
  try {
    const returns = await dbGetTokoReturns();
    res.status(200).json({ returns });
  } catch (err) {
    console.error("Error getTokoReturns:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── RIWAYAT ──────────────────────────────────────────────────────────────────

export const getTokoHistory = async (req, res) => {
  try {
    const history = await dbGetTokoHistory();
    res.status(200).json({ history });
  } catch (err) {
    console.error("Error getTokoHistory:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PENGIRIMAN ───────────────────────────────────────────────────────────────

export const getShipment = async (req, res) => {
  try {
    const shipment = await dbGetShipment(req.params.id);
    if (!shipment) return res.status(404).json({ message: "Shipment tidak ditemukan" });
    res.status(200).json(shipment);
  } catch (err) {
    console.error("Error getShipment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const completeShipment = async (req, res) => {
  try {
    const { id } = req.params;
    await updateRequestStatus(id, "Selesai");
    await createNotification({
      type: "done", title: "Barang Diterima",
      message: `Permintaan ${id} telah selesai diterima`,
      targetRoles: ["gudang", "admin"],
    });
    res.status(200).json({ message: "Pengiriman berhasil diselesaikan" });
  } catch (err) {
    console.error("Error completeShipment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
