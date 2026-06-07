// src/services/storageDb.js
const KEY = "reastock_db_v2";

/**
 * Skema DB (disimpan di localStorage):
 * - requests: transaksi toko -> gudang
 * - shipments: data pengiriman per requestId
 * - notifications: notifikasi global (admin/gudang/toko)
 * - warehouseStock: stok gudang (buat page stok gudang)
 * - restockToAdmin: request gudang -> admin (restok masuk gudang)
 */
const seed = () => ({
  requests: [
    {
      id: "REQ-020",
      fromRole: "toko",
      fromName: "Toko A",
      createdAt: "2026-02-03",
      items: [{ sku: "BRG-002", qty: 12 }],
      note: "Butuh restock etalase",
      decision: null, // null | Accepted | Declined
      status: "Menunggu", // Menunggu | Pending | Mengirim | Selesai | Ditolak
      toRole: "gudang",
      toName: "Gudang",
    },
    {
      id: "REQ-019",
      fromRole: "toko",
      fromName: "Toko B",
      createdAt: "2026-02-02",
      items: [{ sku: "BRG-010", qty: 5 }],
      note: "Promo akhir pekan",
      decision: "Accepted",
      status: "Mengirim",
      toRole: "gudang",
      toName: "Gudang",
    },
  ],

  shipments: {
    "REQ-019": {
      start: { lat: -6.2, lng: 106.8166 },
      end: { lat: -6.1754, lng: 106.8272 },
      startedAt: Date.now() - 1000 * 60 * 7,
      durationMs: 1000 * 60 * 18,
      driver: { lat: -6.197, lng: 106.8177 },
    },
  },

  notifications: [
    {
      id: "NTF-001",
      type: "info",
      title: "Sistem",
      message: "Skema request: toko → gudang acc → kirim → selesai",
      time: "09:40",
      isRead: false,
    },
  ],

  // Daftar Cabang (Gudang & Toko)
  branches: [
    { id: "BRC-001", name: "Gudang Pusat", type: "gudang", location: "Jakarta" },
    { id: "BRC-002", name: "Gudang Barat", type: "gudang", location: "Tangerang" },
    { id: "BRC-003", name: "Toko Utama", type: "toko", location: "Bandung" },
    { id: "BRC-004", name: "Toko Selatan", type: "toko", location: "Depok" },
  ],

  // Stok gudang (dummy awal)
  warehouseStock: [
    {
      sku: "BRG-002",
      name: "Barang Contoh A",
      type: "Sembako",
      qty: 120,
      minQty: 30,
      image: null,
      branchId: "BRC-001"
    },
    {
      sku: "BRG-010",
      name: "Barang Contoh B",
      type: "Minuman",
      qty: 18,
      minQty: 25,
      image: null,
      branchId: "BRC-001"
    },
    {
      sku: "BRG-002",
      name: "Barang Contoh A",
      type: "Sembako",
      qty: 15,
      minQty: 30,
      image: null,
      branchId: "BRC-003"
    },
    {
      sku: "BRG-010",
      name: "Barang Contoh B",
      type: "Minuman",
      qty: 0,
      minQty: 25,
      image: null,
      branchId: "BRC-004"
    },
  ],

  // Request gudang -> admin (restok masuk gudang)
  restockToAdmin: [
    // { id, createdAt, items:[{sku,qty}], note, decision:null|Approved|Declined, status:"Menunggu"|"Approved"|"Selesai", proofImage:null }
  ],

  // Request admin -> gudang (admin minta gudang tambah stok)
  adminRestockToGudang: [
    // { id, createdAt, cabangGudang, cabangGudangNama, kodeBarang, namaBarang, jenisBarang, jumlah, satuan, supplier, prioritas, catatan, status, proofPhotos }
  ],

  // Laporan Harian Toko -> Admin
  tokoReports: [
    // { id, tokoId, tokoName, type, period, date, format, fileData, status, author }
  ],

  // Profile Driver
  driverProfile: {
    name: "Budi Santoso",
    email: "driver@reastock.com",
    phone: "081234567890",
    role: "Driver Utama",
    joinedAt: "10 Januari 2025",
    vehicle: "Truck Hino (B 1234 ABC)",
    status: "Online",
    lastLogin: "13 Mei 2025, 09:40",
  }
});

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function dbLoad() {
  const raw = localStorage.getItem(KEY);
  const s = seed();

  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }

  const parsed = safeParse(raw);
  if (!parsed) {
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }

  // Schema migration: Pastikan semua key dari seed ada di parsed
  let changed = false;
  Object.keys(s).forEach((key) => {
    // Jika key belum ada ATAU (khusus untuk branches/warehouseStock) jika array-nya kosong
    if (parsed[key] === undefined || (Array.isArray(parsed[key]) && parsed[key].length === 0 && s[key].length > 0)) {
      parsed[key] = s[key];
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(KEY, JSON.stringify(parsed));
  }

  return parsed;
}

export function dbSave(nextDb) {
  localStorage.setItem(KEY, JSON.stringify(nextDb));
  window.dispatchEvent(new Event("reastock_db_changed"));
}

export function dbUpdate(mutator) {
  const current = dbLoad();
  const next = mutator(structuredClone(current));
  dbSave(next);
  return next;
}

export function newId(prefix = "REQ") {
  const n = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${n}`;
}

/* ------------------------------------------------------------------ */
/* Compatibility exports (untuk file lama yang masih pakai nama lain)  */
/* ------------------------------------------------------------------ */

export const loadDb = dbLoad;
export const saveDb = dbSave;
export const updateDb = dbUpdate;

// Event subscribe helper (opsional dipakai hook lain)
export function subscribeDb(callback) {
  const onChange = () => callback(dbLoad());
  window.addEventListener("reastock_db_changed", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("reastock_db_changed", onChange);
    window.removeEventListener("storage", onChange);
  };
}
