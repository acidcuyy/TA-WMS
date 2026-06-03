import {
  getAllProducts,
  getAllRequests,
  updateRequestStatus,
  createRequest,
  createShipment,
  createNotification,
  getGudangReceipts  as dbGetGudangReceipts,
  getGudangDispatches as dbGetGudangDispatches,
  getGudangTransfers  as dbGetGudangTransfers,
  getShipment         as dbGetShipment,
  getGudangOrders     as dataServiceGetGudangOrders,
} from "../services/data.service.js";

// ─── REPORTS ──────────────────────────────────────────────────────────────────

export const getGudangReports = async (req, res) => {
  try {
    const products = await getAllProducts();

    const totalSKU   = products.length;
    const nilaiAset  = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);
    const nilaiLabel = nilaiAset >= 1_000_000
      ? `Rp ${(nilaiAset / 1_000_000).toFixed(2)}M`
      : `Rp ${nilaiAset.toLocaleString("id-ID")}`;

    const reports = [
      {
        title: "Laporan Stok",
        desc: "Ringkasan jumlah stok, nilai aset, dan status ketersediaan barang.",
        icon: "📦", color: "#1890ff", bg: "#e6f7ff",
        stats: [
          { label: "Total SKU",  val: totalSKU.toLocaleString("id-ID") },
          { label: "Nilai Aset", val: nilaiLabel },
        ],
      },
      {
        title: "Laporan Pergerakan",
        desc: "Histori barang masuk, keluar, dan transfer antar lokasi.",
        icon: "⇄", color: "#fa8c16", bg: "#fff7e6",
        stats: [
          { label: "Masuk (Bln)", val: "0" },
          { label: "Keluar (Bln)", val: "0" },
        ],
      },
      {
        title: "Laporan Order",
        desc: "Analisis pemenuhan order pelanggan dan efisiensi picking.",
        icon: "🗒", color: "#52c41a", bg: "#f6ffed",
        stats: [
          { label: "Order Selesai", val: "0" },
          { label: "Avg. Lead Time", val: "45 Min" },
        ],
      },
      {
        title: "Laporan Produksi",
        desc: "Data konversi bahan baku menjadi barang jadi (jika ada).",
        icon: "🛠", color: "#722ed1", bg: "#f9f0ff",
        stats: [
          { label: "Batch Aktif", val: "0" },
          { label: "Yield Rate",  val: "N/A" },
        ],
      },
    ];

    res.status(200).json({ reports });
  } catch (err) {
    console.error("Error getGudangReports:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const getGudangDashboard = async (req, res) => {
  try {
    const products = await getAllProducts();
    const requests = await getAllRequests();

    const totalStok  = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);
    const nilaiLabel = totalNilai >= 1_000_000
      ? `Rp ${(totalNilai / 1_000_000).toFixed(2)}M`
      : `Rp ${totalNilai.toLocaleString("id-ID")}`;

    const stats = [
      { label: "Total Stok",        value: totalStok.toLocaleString("id-ID"), sub: "Item",    hint: nilaiLabel,      icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Produk SKU",        value: products.length.toString(),          sub: "Produk",  hint: "Aktif",         icon: "🏷️", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Stok Menipis",      value: products.filter(p => p.status === "Menipis").length.toString(), sub: "Produk", hint: "Perlu restok", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis",        value: products.filter(p => p.status === "Habis").length.toString(),   sub: "Produk", hint: "Urgent",       icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
      { label: "Request Pending",   value: requests.filter(r => r.status === "Menunggu").length.toString(), sub: "Request", hint: "Perlu tindakan", icon: "📋", color: "#52c41a", bg: "#f6ffed" },
    ];

    const recentActivity = requests.slice(0, 5).map(r => ({
      time: new Date(r.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      message: `${r.id} dari ${r.from_name || r.fromName || "-"}`,
      type: "request",
      icon: "📋",
    }));

    const stockMovement = {
      labels:   ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      stockIn:  [30, 40, 35, 50, 45, 60, 55],
      stockOut: [20, 25, 30, 25, 35, 40, 30],
    };

    const stockHealth = {
      fastMoving:   products.filter(p => (p.sold || 0) > 100).length,
      mediumMoving: products.filter(p => (p.sold || 0) >= 50 && (p.sold || 0) <= 100).length,
      slowMoving:   products.filter(p => (p.sold || 0) > 0 && (p.sold || 0) < 50).length,
      deadStock:    products.filter(p => (p.sold || 0) === 0).length,
      totalItems:   totalStok,
    };

    res.status(200).json({ stats, recentActivity, stockMovement, stockHealth, activities: recentActivity });
  } catch (err) {
    console.error("Error getGudangDashboard:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── REQUESTS (Toko -> Gudang) ────────────────────────────────────────────────

export const getGudangRequests = async (req, res) => {
  try {
    const allReq = await getAllRequests();
    const tokoReq     = allReq.filter(r => r.from_role === "toko");
    const restockAdmin = allReq.filter(r => r.from_role === "gudang");

    const stats = [
      { label: "Request Toko",   value: tokoReq.length,      sub: "Total",         icon: "📥", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Restock Admin",  value: restockAdmin.length,  sub: "Total",         icon: "📤", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Pending",        value: allReq.filter(r => r.status === "Menunggu").length, sub: "Perlu Tindakan", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Selesai",        value: allReq.filter(r => r.status === "Selesai").length,  sub: "Bulan Ini",      icon: "✅", color: "#52c41a", bg: "#f6ffed" },
    ];

    res.status(200).json({ stats, tokoReq, restockAdmin });
  } catch (err) {
    console.error("Error getGudangRequests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DECIDE REQUEST (Gudang ACC / Tolak) ──────────────────────────────────────

export const gudangDecideRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body;

    const allReq = await getAllRequests();
    const r = allReq.find(x => x.id === id);
    if (!r) return res.status(404).json({ message: "Request tidak ditemukan" });

    if (decision === "Accepted") {
      await updateRequestStatus(id, "Siap Dikirim", { decision: "Accepted" });
      await createNotification({
        type: "shipping_ready",
        title: "Barang Siap Dikirim",
        message: `Permintaan ${id} siap dikirim. Driver silakan mengambil tugas.`,
        targetRoles: ["driver", "admin"],
      });
    } else {
      await updateRequestStatus(id, "Declined", { decision: "Declined" });
      await createNotification({
        type: "request_declined",
        title: "Request Ditolak",
        message: `Permintaan ${id} ditolak oleh Gudang`,
        targetRoles: ["toko", "admin"],
      });
    }

    res.status(200).json({ message: `Request ${decision === "Accepted" ? "disetujui" : "ditolak"}` });
  } catch (err) {
    console.error("Error gudangDecideRequest:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── STOK GUDANG ──────────────────────────────────────────────────────────────

export const getGudangStock = async (req, res) => {
  try {
    const products = await getAllProducts();

    const totalStok  = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

    const stats = [
      { label: "Total Produk",   value: products.length.toLocaleString("id-ID"),                                                                           sub: "Produk", hint: "Lihat semua produk ›", icon: "📦", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Total Stok",     value: totalStok.toLocaleString("id-ID"),                                                                                 sub: "Item",   hint: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}`, icon: "🏠", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Stok Tersedia",  value: products.filter(p => p.status === "Aman").reduce((s, p) => s + p.stock, 0).toLocaleString("id-ID"),                sub: "Item",   hint: "● Aman",           icon: "✅", color: "#52c41a", bg: "#f6ffed" },
      { label: "Stok Menipis",   value: products.filter(p => p.status === "Menipis").length.toString(),                                                    sub: "Produk", hint: "● Perhatian",       icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis",     value: products.filter(p => p.status === "Habis").length.toString(),                                                      sub: "Produk", hint: "● Segera restok",   icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
    ];

    res.status(200).json({ stats, products });
  } catch (err) {
    console.error("Error getGudangStock:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PENERIMAAN BARANG GUDANG ─────────────────────────────────────────────────

export const getGudangReceipts = async (req, res) => {
  try {
    const receipts = await dbGetGudangReceipts();

    const totalVal   = receipts.reduce((s, r) => s + Number(r.value || 0), 0);
    const totalItems = receipts.reduce((s, r) => s + Number(r.items || 0), 0);

    const stats = [
      { label: "Total Penerimaan",    value: receipts.length.toLocaleString("id-ID"),       sub: "Transaksi", hint: "↑ 8.3% dari periode lalu",  icon: "📥", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Diterima", value: totalItems.toLocaleString("id-ID"),             sub: "Item",      hint: "↑ 8.3% dari periode lalu",  icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Nilai Penerimaan",    value: `Rp ${totalVal.toLocaleString("id-ID")}`,       sub: "",          hint: "↑ 10.2% dari periode lalu", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
      { label: "Penerimaan Hari Ini", value: receipts.length.toString(),                     sub: "Transaksi", hint: "Lihat detail",               icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Pending",      value: receipts.filter(r => r.status === "Menunggu").length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];

    res.status(200).json({ stats, receipts, activities: [] });
  } catch (err) {
    console.error("Error getGudangReceipts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PENGELUARAN BARANG GUDANG ────────────────────────────────────────────────

export const getGudangDispatches = async (req, res) => {
  try {
    const dispatches = await dbGetGudangDispatches();

    const totalVal   = dispatches.reduce((s, d) => s + Number(d.value || 0), 0);
    const totalItems = dispatches.reduce((s, d) => s + Number(d.items || 0), 0);

    const stats = [
      { label: "Total Pengeluaran",       value: dispatches.length.toLocaleString("id-ID"),  sub: "Transaksi", hint: "↑ 12.5% dari periode lalu", icon: "📤", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Dikeluarkan",  value: totalItems.toLocaleString("id-ID"),          sub: "Item",      hint: "↑ 8.7% dari periode lalu",  icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Total Nilai Pengeluaran", value: `Rp ${totalVal.toLocaleString("id-ID")}`,   sub: "",          hint: "↑ 10.3% dari periode lalu", icon: "💰", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Pengeluaran Hari Ini",    value: dispatches.length.toString(),                sub: "Transaksi", hint: "Lihat detail",               icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Pending",          value: dispatches.filter(d => d.status === "Menunggu").length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];

    res.status(200).json({ stats, transactions: dispatches, activities: [] });
  } catch (err) {
    console.error("Error getGudangDispatches:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── TRANSFER BARANG GUDANG ───────────────────────────────────────────────────

export const getGudangTransfers = async (req, res) => {
  try {
    const transfers = await dbGetGudangTransfers();

    const totalVal   = transfers.reduce((s, t) => s + Number(t.value || 0), 0);
    const totalItems = transfers.reduce((s, t) => s + Number(t.items || 0), 0);

    const stats = [
      { label: "Total Transfer",       value: transfers.length.toString(),           sub: "Transaksi", hint: "↑ 12.4% dari periode lalu", icon: "⇄",  color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Ditransfer",value: totalItems.toLocaleString("id-ID"),    sub: "Item",      hint: "↑ 8.6% dari periode lalu",  icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Total Nilai Transfer", value: `Rp ${totalVal.toLocaleString("id-ID")}`, sub: "",       hint: "↑ 10.1% dari periode lalu", icon: "💰", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Transfer Hari Ini",    value: transfers.length.toString(),            sub: "Transaksi", hint: "Lihat detail",               icon: "🚚", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Dalam Pengiriman",     value: transfers.filter(t => String(t.status).includes("Pengiriman")).length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];

    res.status(200).json({ stats, transfers });
  } catch (err) {
    console.error("Error getGudangTransfers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── TRACKING PENGIRIMAN GUDANG ───────────────────────────────────────────────

export const getShipmentTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await dbGetShipment(id);
    if (!shipment) return res.status(404).json({ message: "Shipment tidak ditemukan" });
    res.status(200).json(shipment);
  } catch (err) {
    console.error("Error getShipmentTracking:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ─── GUDANG ORDERS ──────────────────────────────────────────────────────────

export const getGudangOrders = async (req, res) => {
  try {
    const orders = await dataServiceGetGudangOrders();
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error getGudangOrders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
