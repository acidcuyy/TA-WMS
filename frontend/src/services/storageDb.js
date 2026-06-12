// src/services/storageDb.js
const KEY = "reastock_db_v3";

/**
 * Skema DB (disimpan di localStorage):
 * - requests: transaksi toko -> gudang
 * - shipments: data pengiriman per requestId
 * - notifications: notifikasi global (admin/gudang/toko)
 * - warehouseStock: stok gudang (buat page stok gudang)
 * - restockToAdmin: request gudang -> admin (restok masuk gudang)
 */
const seed = () => ({
  requests: [],
  shipments: {},
  notifications: [],

  // Daftar Cabang (Gudang & Toko)
  branches: [
    { id: "BRC-001", name: "Gudang Pusat", type: "gudang", location: "Jakarta" },
    { id: "BRC-002", name: "Gudang Barat", type: "gudang", location: "Tangerang" },
    { id: "BRC-003", name: "Toko Utama", type: "toko", location: "Bandung" },
    { id: "BRC-004", name: "Toko Selatan", type: "toko", location: "Depok" },
  ],

  // Stok gudang
  warehouseStock: [],

  // Request gudang -> admin (restok masuk gudang)
  restockToAdmin: [],

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
  },

  // Stok inventaris milik toko (bukan gudang)
  // Ditambah manual oleh toko atau otomatis dari request selesai
  tokoInventory: [],

  // Catatan pengeluaran barang dari toko
  tokoOutflow: [],

  // User accounts per branch (gudang/toko)
  // { id, branchId, branchName, branchType, username, password, email, phone, nama, createdAt }
  branchUsers: [],
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

  // --- DATA MIGRATION: Fix out-of-sync stock from old buggy requests ---
  if (!parsed._stockSynced_v1) {
    let stockChanged = false;
    
    // Fix Toko Stock from 'requests'
    if (parsed.requests && parsed.warehouseStock) {
      parsed.requests.forEach(r => {
        // Find requests that are completed and have confirmationData
        if ((r.status === "Selesai" || r.status === "Diterima Toko") && r.confirmationData && r.items && r.items.length === 1) {
          const reqQty = Number(r.items[0].qty) || 0;
          const goodQty = Number(r.confirmationData.qtyGood) || 0;
          
          if (reqQty > goodQty) {
            const diff = reqQty - goodQty;
            const skuToMatch = r.items[0].sku || r.items[0].code || `SKU-${r.items[0].name}`;
            
            // Deduct the difference from the target branch (Toko: r.fromBranchId)
            const targetBranchId = r.fromBranchId || sessionStorage.getItem("reastock_branch_id") || "BRC-003";
            const stockItem = parsed.warehouseStock.find(s => 
              s.branchId === targetBranchId && 
              (s.sku === skuToMatch || s.sku === r.items[0].sku || s.sku === r.items[0].code)
            );
            
            if (stockItem) {
              stockItem.qty = Math.max(0, stockItem.qty - diff);
              stockChanged = true;
            }
          }
        }
      });
    }

    // Fix Gudang Stock from 'restockToAdmin'
    if (parsed.restockToAdmin && parsed.warehouseStock) {
      parsed.restockToAdmin.forEach(r => {
        if (r.status === "Selesai" && r.confirmationData && r.items && r.items.length === 1) {
          const reqQty = Number(r.items[0].qty) || 0;
          const goodQty = Number(r.confirmationData.qtyGood) || 0;
          
          if (reqQty > goodQty) {
            const diff = reqQty - goodQty;
            const skuToMatch = r.items[0].sku || r.items[0].code || `SKU-${r.items[0].name}`;
            
            const targetBranchId = r.fromBranchId || "BRC-001";
            const stockItem = parsed.warehouseStock.find(s => 
              s.branchId === targetBranchId && 
              (s.sku === skuToMatch || s.sku === r.items[0].sku || s.sku === r.items[0].code)
            );
            
            if (stockItem) {
              stockItem.qty = Math.max(0, stockItem.qty - diff);
              stockChanged = true;
            }
          }
        }
      });
    }

    parsed._stockSynced_v1 = true;
    localStorage.setItem(KEY, JSON.stringify(parsed));
  }

  // --- DATA MIGRATION: Clear out specific old dummy requests from adminRestockToGudang ---
  if (!parsed._clearedDummyARST_v1) {
    if (parsed.adminRestockToGudang) {
      const dummyIds = ["ARST-518", "ARST-930", "ARST-442"];
      const originalLength = parsed.adminRestockToGudang.length;
      parsed.adminRestockToGudang = parsed.adminRestockToGudang.filter(r => !dummyIds.includes(r.id));
      
      if (parsed.adminRestockToGudang.length !== originalLength) {
        changed = true;
      }
    }
    parsed._clearedDummyARST_v1 = true;
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
