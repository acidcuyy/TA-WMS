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

  // Stok gudang (dummy awal)
  warehouseStock: [
    {
      sku: "BRG-002",
      name: "Barang Contoh A",
      type: "Sembako",
      qty: 120,
      minQty: 30,
      image: null,
    },
    {
      sku: "BRG-010",
      name: "Barang Contoh B",
      type: "Minuman",
      qty: 18,
      minQty: 25,
      image: null,
    },
  ],

  // Request gudang -> admin (restok masuk gudang)
  restockToAdmin: [
    // { id, createdAt, items:[{sku,qty}], note, decision:null|Approved|Declined, status:"Menunggu"|"Approved"|"Selesai", proofImage:null }
  ],
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
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  const parsed = safeParse(raw);
  if (!parsed) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
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
