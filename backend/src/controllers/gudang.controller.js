import { readDB } from "../services/data.service.js";

/**
 * GET /api/gudang/reports
 * Mengembalikan 4 kartu laporan gudang dengan stats dinamis dari db.json
 * Sesuai dengan struktur array `reports` di LaporanGudang.js
 */
export const getGudangReports = async (req, res) => {
  try {
    const db = await readDB();
    const products = db.products || [];
    const movements = db.movements || [];
    const orders = db.orders || [];
    const productions = db.productions || [];

    /* ── 1. LAPORAN STOK ──────────────────────────────────── */
    const totalSKU = products.length;
    const nilaiAset = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);
    const nilaiLabel = nilaiAset >= 1_000_000
      ? `Rp ${(nilaiAset / 1_000_000).toFixed(2)}M`
      : `Rp ${nilaiAset.toLocaleString("id-ID")}`;

    /* ── 2. LAPORAN PERGERAKAN ────────────────────────────── */
    const totalMasuk = movements.filter(m => m.type === "Stok Masuk").reduce((s, m) => s + (m.in || 0), 0);
    const totalKeluar = movements.filter(m => m.type === "Stok Keluar").reduce((s, m) => s + (m.out || 0), 0);

    /* ── 3. LAPORAN ORDER ─────────────────────────────────── */
    const orderSelesai = orders.filter(o => o.status === "Completed" || o.status === "Selesai").length;

    /* ── 4. LAPORAN PRODUKSI ──────────────────────────────── */
    const batchAktif = productions.filter(p => p.status !== "Selesai" && p.status !== "Dibatalkan").length;
    const totalTarget = productions.reduce((s, p) => s + (p.target || 0), 0);
    const totalOutput = productions.reduce((s, p) => s + (p.output || p.actual || 0), 0);
    const yieldRate = totalTarget > 0
      ? ((totalOutput / totalTarget) * 100).toFixed(1) + "%"
      : "N/A";

    const reports = [
      {
        title: "Laporan Stok",
        desc: "Ringkasan jumlah stok, nilai aset, dan status ketersediaan barang.",
        icon: "📦", color: "#1890ff", bg: "#e6f7ff",
        stats: [
          { label: "Total SKU", val: totalSKU.toLocaleString("id-ID") },
          { label: "Nilai Aset", val: nilaiLabel },
        ],
      },
      {
        title: "Laporan Pergerakan",
        desc: "Histori barang masuk, keluar, dan transfer antar lokasi.",
        icon: "⇄", color: "#fa8c16", bg: "#fff7e6",
        stats: [
          { label: "Masuk (Bln)", val: totalMasuk.toLocaleString("id-ID") },
          { label: "Keluar (Bln)", val: totalKeluar.toLocaleString("id-ID") },
        ],
      },
      {
        title: "Laporan Order",
        desc: "Analisis pemenuhan order pelanggan dan efisiensi picking.",
        icon: "🗒", color: "#52c41a", bg: "#f6ffed",
        stats: [
          { label: "Order Selesai", val: orderSelesai.toString() },
          { label: "Avg. Lead Time", val: "45 Min" },
        ],
      },
      {
        title: "Laporan Produksi",
        desc: "Data konversi bahan baku menjadi barang jadi (jika ada).",
        icon: "🛠", color: "#722ed1", bg: "#f9f0ff",
        stats: [
          { label: "Batch Aktif", val: batchAktif.toString() },
          { label: "Yield Rate", val: yieldRate },
        ],
      },
    ];

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error getGudangReports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/dashboard
 * Mengembalikan semua data yang dibutuhkan GudangDashboard.js
 */
export const getGudangDashboard = async (req, res) => {
  try {
    const db = await readDB();
    const products = db.products || [];
    const orders = db.orders || [];
    const movements = db.movements || [];
    const activities = db.activities || [];

    /* ── STATS ────────────────────────────────────────────── */
    const totalStok = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

    const movIn = movements.filter(m => m.type === "Stok Masuk");
    const movOut = movements.filter(m => m.type === "Stok Keluar");
    const movTr = movements.filter(m => m.type === "Transfer");

    const totalMasuk = movIn.reduce((s, m) => s + (m.in || 0), 0);
    const totalKeluar = movOut.reduce((s, m) => s + (m.out || 0), 0);
    const totalTransfer = movTr.reduce((s, m) => s + (m.out || m.in || 0), 0);
    const orderPending = orders.filter(o => o.status === "Pending" || o.status === "Menunggu").length;

    const stats = [
      { label: "Total Stok", value: totalStok.toLocaleString("id-ID"), sub: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}`, icon: "📦", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Masuk (Hari Ini)", value: totalMasuk.toString(), sub: `${movIn.length} Transaksi`, icon: "⬇️", color: "#52c41a", bg: "#f6ffed" },
      { label: "Barang Keluar (Hari Ini)", value: totalKeluar.toString(), sub: `${movOut.length} Transaksi`, icon: "⬆️", color: "#e4915a", bg: "#fff8f3" },
      { label: "Transfer (Hari Ini)", value: totalTransfer.toString(), sub: `${movTr.length} Transaksi`, icon: "⇄", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Order Menunggu Proses", value: orderPending.toString(), sub: "Order", icon: "🕒", color: "#fa8c16", bg: "#fff7e6", link: "Lihat detail >" },
    ];

    /* ── RECENT ORDERS ────────────────────────────────────── */
    const recentOrders = orders.slice(0, 5).map(o => ({
      id: o.id,
      from: o.party,
      date: o.date,
      items: o.items,
      status: o.status === "Pending" ? "Menunggu"
        : o.status === "Processing" ? "Proses"
          : o.status === "Completed" ? "Selesai"
            : o.status,
    }));

    /* ── ACTIVITIES ───────────────────────────────────────── */
    const typeColor = { "Stok Masuk": "#52c41a", "Stok Keluar": "#e4915a", "Transfer": "#1890ff" };
    const actFromMovements = movements.slice(0, 5).map(m => ({
      time: m.time,
      title: m.type === "Stok Masuk" ? `Penerimaan barang dari ${m.loc}`
        : m.type === "Stok Keluar" ? `Pengeluaran barang untuk ${m.loc}`
          : `Transfer ke ${m.loc}`,
      sub: m.ref,
      tag: `${m.in || m.out || 0} item`,
      color: typeColor[m.type] || "#888",
    }));

    const activityList = actFromMovements.length > 0
      ? actFromMovements
      : activities.slice(0, 3).map(a => ({
        time: a.time, title: a.message, sub: a.sub, tag: "",
        color: a.type === "order" ? "#52c41a" : "#1890ff",
      }));

    /* ── ALERTS ───────────────────────────────────────────── */
    const alerts = [
      { label: "Stok Menipis", val: products.filter(p => p.stockStatus === "Stok rendah").length.toString(), sub: "Produk", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis", val: products.filter(p => p.stock === 0).length.toString(), sub: "Produk", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
      { label: "Order Terlambat", val: orders.filter(o => o.status === "Pending").length.toString(), sub: "Order", icon: "🕒", color: "#722ed1", bg: "#f9f0ff" },
    ];

    res.status(200).json({ stats, recentOrders, activities: activityList, alerts });
  } catch (error) {
    console.error("Error getGudangDashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/orders
 * Mengembalikan stats + list orders untuk OrdersGudang.js
 */
export const getGudangOrders = async (req, res) => {
  try {
    const db = await readDB();
    const gudangOrders = db.gudang_orders || [];

    const stats = [
      { label: "Total Order",   value: gudangOrders.length.toString(), sub: "Hari ini",      icon: "🗒",  color: "#1890ff", bg: "#e6f7ff" },
      { label: "Perlu Picking", value: gudangOrders.filter(o => o.status === "New" || o.status === "Picking").length.toString(), sub: "Urgent", icon: "📦", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Siap Kirim",    value: gudangOrders.filter(o => o.status === "Packed").length.toString(), sub: "Sudah Packing", icon: "🚚", color: "#52c41a", bg: "#f6ffed" },
      { label: "Retur",         value: gudangOrders.filter(o => o.status === "Retur").length.toString(), sub: "Masalah", icon: "🔄", color: "#ff4d4f", bg: "#fff1f0" },
    ];

    res.status(200).json({ stats, orders: gudangOrders });
  } catch (error) {
    console.error("Error getGudangOrders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/receipts
 * Mengembalikan data untuk PenerimaanBarang.js
 */
export const getGudangReceipts = async (req, res) => {
  try {
    const db = await readDB();
    const receipts   = db.gudang_receipts || [];
    const activities = db.receipt_activities || [];

    const totalVal = receipts.reduce((s, r) => s + (r.value || 0), 0);
    const totalItems = receipts.reduce((s, r) => s + (r.items || 0), 0);

    const stats = [
      { label: "Total Penerimaan",    value: receipts.length.toLocaleString("id-ID"), sub: "Transaksi", hint: "↑ 12.5% dari periode lalu", icon: "⬇️", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Diterima", value: totalItems.toLocaleString("id-ID"), sub: "Item", hint: "↑ 8.3% dari periode lalu", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Nilai Penerimaan",    value: `Rp ${totalVal.toLocaleString("id-ID")}`, sub: "", hint: "↑ 10.2% dari periode lalu", icon: "💰", color: "#52c41a", bg: "#f6ffed" },
      { label: "Penerimaan Hari Ini", value: receipts.length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Pending",      value: receipts.filter(r => r.status === "Menunggu").length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];

    res.status(200).json({ stats, receipts, activities });
  } catch (error) {
    console.error("Error getGudangReceipts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/dispatches
 * Mengembalikan data untuk PengeluaranBarang.js
 */
export const getGudangDispatches = async (req, res) => {
  try {
    const db = await readDB();
    const dispatches = db.gudang_dispatches || [];
    const activities = db.dispatch_activities || [];

    const totalVal = dispatches.reduce((s, d) => s + (d.value || 0), 0);
    const totalItems = dispatches.reduce((s, d) => s + (d.items || 0), 0);

    const stats = [
      { label: "Total Pengeluaran",       value: dispatches.length.toLocaleString("id-ID"), sub: "Transaksi", hint: "↑ 12.5% dari periode lalu", icon: "📤", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Dikeluarkan",  value: totalItems.toLocaleString("id-ID"), sub: "Item", hint: "↑ 8.7% dari periode lalu", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Total Nilai Pengeluaran", value: `Rp ${totalVal.toLocaleString("id-ID")}`, sub: "", hint: "↑ 10.3% dari periode lalu", icon: "💰", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Pengeluaran Hari Ini",    value: dispatches.length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Barang Pending",          value: dispatches.filter(d => d.status === "Menunggu").length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];

    res.status(200).json({ stats, transactions: dispatches, activities });
  } catch (error) {
    console.error("Error getGudangDispatches:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/transfers
 * Mengembalikan data untuk TransferBarang.js
 */
export const getGudangTransfers = async (req, res) => {
  try {
    const db = await readDB();
    const transfers = db.gudang_transfers || [];
    
    const totalVal = transfers.reduce((s, t) => s + (t.value || 0), 0);
    const totalItems = transfers.reduce((s, t) => s + (t.items || 0), 0);

    const stats = [
      { label: "Total Transfer",      value: transfers.length.toString(), sub: "Transaksi", hint: "↑ 12.4% dari periode lalu", icon: "⇄", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Total Item Ditransfer", value: totalItems.toLocaleString("id-ID"), sub: "Item", hint: "↑ 8.6% dari periode lalu", icon: "📦", color: "#52c41a", bg: "#f6ffed" },
      { label: "Total Nilai Transfer",  value: `Rp ${totalVal.toLocaleString("id-ID")}`, sub: "", hint: "↑ 10.1% dari periode lalu", icon: "💰", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Transfer Hari Ini",    value: transfers.length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🚚", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Dalam Pengiriman",     value: transfers.filter(t => t.status.includes("Pengiriman")).length.toString(), sub: "Transaksi", hint: "Lihat detail", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
    ];

    res.status(200).json({ stats, transfers });
  } catch (error) {
    console.error("Error getGudangTransfers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/stock
 * Mengembalikan data untuk StokGudang.js
 */
export const getGudangStock = async (req, res) => {
  try {
    const db = await readDB();
    const products = db.products || [];

    const totalStok = products.reduce((s, p) => s + (p.stock || 0), 0);
    const totalNilai = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

    const stats = [
      { label: "Total Produk", value: products.length.toLocaleString("id-ID"), sub: "Produk", hint: "Lihat semua produk ›", icon: "📦", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Total Stok",   value: totalStok.toLocaleString("id-ID"), sub: "Item", hint: `Nilai: Rp ${totalNilai.toLocaleString("id-ID")}`, icon: "🏠", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Stok Tersedia", value: products.filter(p => p.status === "Aman").reduce((s, p) => s + p.stock, 0).toLocaleString("id-ID"), sub: "Item", hint: "● Aman", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
      { label: "Stok Menipis", value: products.filter(p => p.status === "Menipis").length.toString(), sub: "Produk", hint: "● Perhatian", icon: "⚠️", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Stok Habis",   value: products.filter(p => p.status === "Habis").length.toString(), sub: "Produk", hint: "● Segera restok", icon: "🚫", color: "#ff4d4f", bg: "#fff1f0" },
    ];

    res.status(200).json({ stats, products });
  } catch (error) {
    console.error("Error getGudangStock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/requests
 * Mengembalikan data untuk RequestsGudang.js
 */
export const getGudangRequests = async (req, res) => {
  try {
    const db = await readDB();
    const allReq = db.stock_requests || [];

    const tokoReq = allReq.filter(r => r.fromRole === "toko");
    const restockAdmin = allReq.filter(r => r.fromRole === "gudang");

    const stats = [
      { label: "Request Toko", value: tokoReq.length, sub: "Total", icon: "📥", color: "#1890ff", bg: "#e6f7ff" },
      { label: "Restock Admin", value: restockAdmin.length, sub: "Total", icon: "📤", color: "#722ed1", bg: "#f9f0ff" },
      { label: "Pending", value: allReq.filter(r => r.status === "Pending").length, sub: "Perlu Tindakan", icon: "🕒", color: "#fa8c16", bg: "#fff7e6" },
      { label: "Selesai", value: allReq.filter(r => r.status === "Selesai").length, sub: "Bulan Ini", icon: "✅", color: "#52c41a", bg: "#f6ffed" },
    ];

    res.status(200).json({ stats, tokoReq, restockAdmin });
  } catch (error) {
    console.error("Error getGudangRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gudang/shipment/:id
 * Mengembalikan data tracking untuk PengirimanGudang.js
 */
export const getShipmentTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const shipment = (db.shipment_details || []).find(s => s.id === id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment tracking not found" });
    }

    res.status(200).json(shipment);
  } catch (error) {
    console.error("Error getShipmentTracking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
