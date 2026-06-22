// src/services/storageDb.js

export function getDbKey() {
  let companyId = sessionStorage.getItem("reastock_company_id");
  
  // Jika companyId masih COMP-LEGACY atau kosong, coba resolve dari globalUsers
  if (!companyId || companyId === "COMP-LEGACY") {
    const globalUsers = safeParse(localStorage.getItem("reastock_global_users")) || {};
    const identifier = sessionStorage.getItem("reastock_user_email");
    if (identifier) {
      const u = Object.values(globalUsers).find(
        user => user.email === identifier || user.username === identifier
      );
      if (u && u.companyId && u.companyId !== "COMP-LEGACY") {
        sessionStorage.setItem("reastock_company_id", u.companyId);
        companyId = u.companyId;
      }
    }
  }

  return companyId ? `reastock_db_v3_${companyId}` : "reastock_db_v3";
}


export function getGlobalUsers() {
  return safeParse(localStorage.getItem("reastock_global_users")) || {};
}

export function saveGlobalUsers(users) {
  localStorage.setItem("reastock_global_users", JSON.stringify(users));
}
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
  branches: [],

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
  // --- MIGRATION MULTI-TENANCY ---
  const legacyRaw = localStorage.getItem("reastock_db_v3");
  if (legacyRaw) {
    const legacyParsed = safeParse(legacyRaw);
    if (legacyParsed && !legacyParsed._migrated_multi) {
       const globalUsers = getGlobalUsers();
       const compId = "COMP-LEGACY";
       (legacyParsed.branchUsers || []).forEach(u => {
         globalUsers[u.id] = { ...u, companyId: compId };
       });
       saveGlobalUsers(globalUsers);
       
       legacyParsed._migrated_multi = true;
       localStorage.setItem(`reastock_db_v3_${compId}`, JSON.stringify(legacyParsed));
       localStorage.setItem("reastock_db_v3", JSON.stringify(legacyParsed)); // mark legacy as migrated
    }
  }

  // --- MIGRATION MULTI-TENANCY SPLIT: BURA & CAVABINS (v3) ---
  const legacyMultiRaw = localStorage.getItem("reastock_db_v3_COMP-LEGACY");
  if (legacyMultiRaw) {
    const legacyMulti = safeParse(legacyMultiRaw);
    if (legacyMulti && !legacyMulti._split_bura_cavabins_v3) {
       const globalUsers = getGlobalUsers();
       let hanantaId = null, ilhamId = null;
       
       Object.values(globalUsers).forEach(u => {
         if (u.nama && u.nama.toLowerCase().includes("hananta")) {
           u.companyId = "COMP-BURA";
           hanantaId = u.id;
         }
         if (u.nama && u.nama.toLowerCase().includes("ilham")) {
           u.companyId = "COMP-CAVABINS";
           ilhamId = u.id;
         }
       });
       saveGlobalUsers(globalUsers);

       // Restore Cavabins DB from whatever it currently has (to not lose newly added stuff)
       const currentCavaRaw = localStorage.getItem("reastock_db_v3_COMP-CAVABINS");
       let cavaDb = currentCavaRaw ? safeParse(currentCavaRaw) : structuredClone(legacyMulti);
       
       // Ensure all users are kept except Hananta
       if (!currentCavaRaw) {
         cavaDb.branchUsers = (cavaDb.branchUsers || []).filter(u => u.id !== hanantaId);
       }

       // Recover any missing branches based on branchUsers
       cavaDb.branches = cavaDb.branches || [];
       (cavaDb.branchUsers || []).forEach(u => {
         if (u.branchId && u.branchType !== "admin") {
           const exists = cavaDb.branches.find(b => b.id === u.branchId || b.name === u.branchName);
           if (!exists) {
             cavaDb.branches.push({
               id: u.branchId,
               name: u.branchName || "Gudang Utama",
               type: u.branchType || "gudang",
               address: "Bandung, Jawa Barat",
               phone: "021-000000",
               picName: u.nama,
               status: "Active"
             });
           }
         }
       });

       cavaDb._split_bura_cavabins_v3 = true;
       localStorage.setItem("reastock_db_v3_COMP-CAVABINS", JSON.stringify(cavaDb));

       legacyMulti._split_bura_cavabins_v3 = true;
       localStorage.setItem("reastock_db_v3_COMP-LEGACY", JSON.stringify(legacyMulti));
    }
    
    // Fix: Move stuck legacy users to Cavabins and merge their data
    if (legacyMulti && !legacyMulti._fix_cavabins_users_v4) {
       const globalUsers = getGlobalUsers();
       let changedUsers = false;
       Object.values(globalUsers).forEach(u => {
         if (u.companyId === "COMP-LEGACY" && u.nama && !u.nama.toLowerCase().includes("hananta")) {
           u.companyId = "COMP-CAVABINS";
           changedUsers = true;
         }
       });
       if (changedUsers) {
         saveGlobalUsers(globalUsers);
       }

       const currentCavaRaw = localStorage.getItem("reastock_db_v3_COMP-CAVABINS");
       if (currentCavaRaw) {
         let cavaDb = safeParse(currentCavaRaw);
         if (cavaDb) {
           ['restockToAdmin', 'requests', 'notifications', 'adminRestockToGudang', 'warehouseStock', 'branches', 'branchUsers'].forEach(key => {
             if (legacyMulti[key] && Array.isArray(legacyMulti[key])) {
               cavaDb[key] = cavaDb[key] || [];
               legacyMulti[key].forEach(item => {
                 if (key === 'warehouseStock') {
                   const exists = cavaDb[key].find(x => x.sku === item.sku && x.branchId === item.branchId);
                   if (!exists) cavaDb[key].push(item);
                   else exists.qty = Math.max(exists.qty, item.qty);
                 } else {
                   if (!cavaDb[key].find(x => x.id === item.id)) {
                     cavaDb[key].push(item);
                   }
                 }
               });
             }
           });
           localStorage.setItem("reastock_db_v3_COMP-CAVABINS", JSON.stringify(cavaDb));
         }
       }

       legacyMulti._fix_cavabins_users_v4 = true;
       localStorage.setItem("reastock_db_v3_COMP-LEGACY", JSON.stringify(legacyMulti));
    }
  }

  const KEY = getDbKey();
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

  // --- RUNTIME SYNC: Ensure branches are reconstructed from branchUsers if missing ---
  // This runs every load (cheap & idempotent) to prevent missing branches caused by any migration issue
  if (parsed.branchUsers && parsed.branchUsers.length > 0) {
    parsed.branches = parsed.branches || [];
    let branchesSynced = false;
    parsed.branchUsers.forEach(u => {
      if (u.branchId && u.branchType && u.branchType !== 'admin' && u.role !== 'driver') {
        const exists = parsed.branches.find(b => b.id === u.branchId);
        if (!exists) {
          parsed.branches.push({
            id: u.branchId,
            name: u.branchName || u.branchId,
            type: u.branchType,
            location: u.location || '',
          });
          branchesSynced = true;
        }
      }
    });
    if (branchesSynced) {
      localStorage.setItem(KEY, JSON.stringify(parsed));
    }
  }

  if (changed) {
    localStorage.setItem(KEY, JSON.stringify(parsed));
  }

  // --- DATA MIGRATION: Fix missing images in Toko stock ---
  let patchedImages = false;
  if (parsed.warehouseStock) {
    parsed.warehouseStock.forEach(item => {
      if (!item.image) {
        // Find an item with the same SKU or Name that has an image
        const sourceWithImage = parsed.warehouseStock.find(x => 
          (x.sku === item.sku || (x.name && item.name && x.name.toLowerCase() === item.name.toLowerCase())) && x.image
        );
        if (sourceWithImage) {
          item.image = sourceWithImage.image;
          patchedImages = true;
        }
      }
    });
  }
  if (patchedImages) {
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

  // --- DATA MIGRATION: Clear old dummy branches ---
  if (!parsed._clearedDummyBranches_v1) {
    if (parsed.branches) {
      const dummyIds = ["BRC-001", "BRC-002", "BRC-003", "BRC-004"];
      const originalLength = parsed.branches.length;
      parsed.branches = parsed.branches.filter(b => !dummyIds.includes(b.id));
      if (parsed.branches.length !== originalLength) {
        changed = true;
      }
    }
    parsed._clearedDummyBranches_v1 = true;
    localStorage.setItem(KEY, JSON.stringify(parsed));
  }

  return parsed;
}

export function dbSave(nextDb) {
  const KEY = getDbKey();
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
