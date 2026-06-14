// src/services/wmsApi.js
import { dbLoad, dbUpdate, newId } from "./storageDb";

/* ===========================
 * Helpers
 * =========================== */
function nowTimeHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizeItems(payload = {}) {
  // skema utama: items: [{ sku, qty }]
  if (Array.isArray(payload.items) && payload.items.length) {
    return payload.items.map(item => ({
      ...item,
      sku: item.sku || item.code || item.itemCode || `SKU-${Math.floor(Math.random() * 1000)}`
    }));
  }

  // fallback lama: itemCode + qty
  if (payload.itemCode && payload.qty != null) {
    return [{ sku: payload.itemCode, name: payload.name || payload.itemCode, qty: Number(payload.qty) || 0 }];
  }

  return [];
}

function normalizeDecision(decision) {
  // terima: null | "none" | "accepted"/"declined" | "Accepted"/"Declined"
  if (!decision || decision === "none") return null;

  if (typeof decision === "string") {
    const d = decision.trim().toLowerCase();
    if (d === "accepted" || d === "approve" || d === "approved") return "Accepted";
    if (d === "declined" || d === "reject" || d === "rejected") return "Declined";
    if (decision === "Accepted" || decision === "Declined") return decision;
  }

  return decision;
}

/* ===========================
 * READ
 * =========================== */
export function getRequests() {
  return dbLoad().requests || [];
}

export function getRequestById(id) {
  return (dbLoad().requests || []).find((r) => r.id === id) || null;
}

export function getShipment(requestId) {
  return dbLoad().shipments?.[requestId] || null;
}

export function getWarehouseStock() {
  return dbLoad().warehouseStock || [];
}

export function getRestockToAdmin() {
  return dbLoad().restockToAdmin || [];
}

export function getNotifications() {
  return dbLoad().notifications || [];
}

export function getBranches() {
  return dbLoad().branches || [];
}

export function markNotificationAsRead(id) {
  return dbUpdate((db) => {
    const n = (db.notifications || []).find((x) => x.id === id);
    if (n) n.isRead = true;
    return db;
  });
}

export function markMultipleNotificationsAsRead(ids) {
  return dbUpdate((db) => {
    (db.notifications || []).forEach((n) => {
      if (ids.includes(n.id)) {
        n.isRead = true;
      }
    });
    return db;
  });
}

export function markAllNotificationsAsRead(role) {
  return dbUpdate((db) => {
    (db.notifications || []).forEach((n) => {
      if (!role || (n.targetRoles && n.targetRoles.includes(role.toLowerCase()))) {
        n.isRead = true;
      }
    });
    return db;
  });
}

/* ===========================
 * SUBSCRIBE (dummy realtime via storage event)
 * =========================== */
function makeSub(getter, callback) {
  const onChange = () => callback(getter());
  window.addEventListener("reastock_db_changed", onChange);
  window.addEventListener("storage", onChange);
  // initial emit
  onChange();
  return () => {
    window.removeEventListener("reastock_db_changed", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function subscribeRequests(callback) {
  return makeSub(getRequests, callback);
}

export function subscribeShipment(requestId, callback) {
  return makeSub(() => getShipment(requestId), callback);
}

export function subscribeWarehouseStock(callback) {
  return makeSub(getWarehouseStock, callback);
}

export function subscribeRestockToAdmin(callback) {
  return makeSub(getRestockToAdmin, callback);
}

export function subscribeNotifications(callback) {
  return makeSub(getNotifications, callback);
}

export function subscribeBranches(callback) {
  return makeSub(getBranches, callback);
}

export function addWarehouseStock(item) {
  return dbUpdate((db) => {
    db.warehouseStock = db.warehouseStock || [];
    db.warehouseStock.push({
      ...item,
      branchId: item.branchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001" // Default to current branch or fallback
    });
    return db;
  });
}

export function editWarehouseStock(sku, branchId, payload) {
  return dbUpdate((db) => {
    if (!db.warehouseStock) return db;
    // Bulletproof matching logic: allow Gudang items without branchId to match "BRC-001"
    const targetBranch = branchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001";
    const item = db.warehouseStock.find(x => x.sku === sku && (x.branchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001") === targetBranch);
    if (item) {
      if (typeof payload === 'number') {
        item.qty = payload;
      } else {
        if (payload.qty !== undefined) item.qty = payload.qty;
        if (payload.name !== undefined) item.name = payload.name;
        if (payload.type !== undefined) item.type = payload.type;
        if (payload.image !== undefined) item.image = payload.image;
        if (payload.supplier !== undefined) item.supplier = payload.supplier;
        if (payload.notes !== undefined) item.notes = payload.notes;
      }
    }
    return db;
  });
}

export function deleteWarehouseStock(sku, branchId) {
  return dbUpdate((db) => {
    if (!db.warehouseStock) return db;
    const targetBranch = branchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001";
    db.warehouseStock = db.warehouseStock.filter(x => !(x.sku === sku && (x.branchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001") === targetBranch));
    return db;
  });
}

export function getDriverProfile() {
  return dbLoad().driverProfile || {};
}

export function subscribeDriverProfile(callback) {
  return makeSub(getDriverProfile, callback);
}

export function updateDriverProfile(payload) {
  return dbUpdate((db) => {
    db.driverProfile = { ...(db.driverProfile || {}), ...payload };

    // Sinkronisasi nama driver di request/shipment yang sedang aktif
    if (payload.name) {
      (db.requests || []).forEach(r => {
        if (r.driverName === "Budi Santoso" || r.driverName === db.driverProfile.name) {
          r.driverName = payload.name;
        }
      });
      if (db.shipments) {
        Object.values(db.shipments).forEach(s => {
          if (s.driverName === "Budi Santoso" || s.driverName === db.driverProfile.name) {
            s.driverName = payload.name;
          }
        });
      }
    }

    return db;
  });
}

/* =========================================================
 * TOKO -> GUDANG request
 * ========================================================= */
export function createTokoRequest(payload) {
  const fromName = payload?.fromName || payload?.from || "Toko";
  const fromBranchId = payload?.fromBranchId || sessionStorage.getItem("reastock_branch_id") || "BRC-003";
  const toBranchId = payload?.toBranchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001";
  const toBranchName = payload?.toBranchName || sessionStorage.getItem("reastock_branch_name") || "Gudang Pusat";
  const note = payload?.note || "";
  const satuan = payload?.satuan || "pcs";
  const items = normalizeItems(payload);

  return dbUpdate((db) => {
    const id = newId("REQ");
    const createdAt = new Date().toISOString().slice(0, 10);

    db.requests = db.requests || [];
    db.notifications = db.notifications || [];

    db.requests.unshift({
      id,
      fromRole: "toko",
      fromName,
      fromBranchId,
      toRole: "gudang",
      toBranchId,
      toName: toBranchName,
      createdAt,
      items,
      satuan,
      note,
      decision: null,
      status: "Menunggu",
    });

    // notif untuk gudang & admin
    db.notifications.unshift({
      id: newId("NTF"),
      type: "request_toko",
      title: "Request Toko Baru",
      message: `Ada permintaan barang baru dari ${fromName} ke ${toBranchName} (${id})`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin", "gudang"],
      link: "/requests"
    });

    return db;
  });
}

/* ===========================
 * GUDANG decide request (ACC/Decline)
 * Flow sesuai skema:
 * - accept => decision Accepted, status Diproses
 * - decline => decision Declined, status Ditolak
 * =========================== */
export function gudangDecideRequest(id, decision) {
  const dec = normalizeDecision(decision);

  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    db.notifications = db.notifications || [];

    r.decision = dec;

    if (dec === "Accepted") {
      r.status = "Memproses";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "request_accepted",
        title: "Request Disetujui",
        message: `Permintaan ${id} telah disetujui oleh Gudang`,
        time: nowTimeHHMM(),
        isRead: false,
        targetRoles: ["toko", "admin"],
      });
    } else {
      r.status = "Declined";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "request_declined",
        title: "Request Ditolak",
        message: `Permintaan ${id} ditolak oleh Gudang`,
        time: nowTimeHHMM(),
        isRead: false,
        targetRoles: ["toko", "admin"],
      });
    }

    return db;
  });
}

/* ===========================
 * GUDANG kirim barang
 * Flow sesuai skema:
 * - hanya boleh saat status Diproses
 * - ubah status Mengirim + buat shipment
 * =========================== */
export function gudangKirimBarang(id) {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Memproses") return db;

    db.notifications = db.notifications || [];

    r.status = "Siap Dikirim";

    db.notifications.unshift({
      id: newId("NTF"),
      type: "shipping_ready",
      title: "Barang Siap Dikirim",
      message: `Permintaan ${id} siap dikirim. Driver silakan mengambil tugas.`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["driver", "admin"],
    });

    return db;
  });
}

export function gudangKirimBarangEksternal(id) {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Memproses") return db;

    db.notifications = db.notifications || [];

    r.status = "Mengirim";
    r.isExternalDriver = true;

    db.notifications.unshift({
      id: newId("NTF"),
      type: "shipping_dispatch_external",
      title: "Barang Dikirim (Eksternal)",
      message: `Permintaan ${id} telah dikirim menggunakan kurir eksternal.`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["toko", "admin"],
    });

    return db;
  });
}

export function driverAcceptTask(id, driverName = "Driver 01") {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Siap Dikirim") return db;

    db.notifications = db.notifications || [];

    // Status Pickup: driver sudah ambil tugas, belum upload bukti
    r.status = "Pickup";
    r.driverName = driverName;
    r.acceptedAt = new Date().toISOString();

    db.notifications.unshift({
      id: newId("NTF"),
      type: "pickup",
      title: "Driver Mengambil Tugas",
      message: `Pesanan ${id} diambil oleh ${driverName}. Driver sedang menyiapkan bukti barang.`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["toko", "gudang", "admin"],
    });

    return db;
  });
}

/**
 * Driver upload bukti (resi + foto barang) lalu siap mengirim
 * Status: Pickup -> Mengirim, buat shipment
 */
export function driverUploadBuktiSiapKirim(id, driverName = "Driver 01", proofData = {}) {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Pickup") return db;

    db.shipments = db.shipments || {};
    db.notifications = db.notifications || [];

    r.status = "Mengirim";
    r.driverProof = proofData; // { resi: base64, foto: base64 }
    r.shippingStartedAt = new Date().toISOString();

    db.shipments[id] = {
      start: { lat: -6.2, lng: 106.8166 },
      end: { lat: -6.1754, lng: 106.8272 },
      startedAt: Date.now(),
      durationMs: 1000 * 60 * 18,
      driver: { lat: -6.197, lng: 106.8177 },
      driverName: driverName,
    };

    db.notifications.unshift({
      id: newId("NTF"),
      type: "shipping",
      title: "Pengiriman Dimulai",
      message: `Pesanan ${id} sedang dalam perjalanan oleh ${driverName}. Bukti telah diunggah.`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["toko", "gudang", "admin"],
    });

    return db;
  });
}

/* ===========================
 * TOKO terima barang (konfirmasi)
 * Flow:
 * - hanya boleh saat status Mengirim
 * - status -> Diterima Toko (driver masih perlu menyelesaikan)
 * =========================== */
export function tokoSelesaiTerima(id, proofImage = null, confirmationData = null) {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Mengirim") return db;

    db.notifications = db.notifications || [];

    if (r.isExternalDriver) {
      r.status = "Selesai";
      r.completedAt = new Date().toISOString();
    } else {
      r.status = "Diterima Toko";
    }

    r.proofImage = proofImage;
    r.receivedAt = new Date().toISOString();
    
    if (confirmationData) {
      r.confirmationData = confirmationData;
    }

    // ✅ SYNC langsung ke warehouseStock saat toko terima barang
    db.warehouseStock = db.warehouseStock || [];
    (r.items || []).forEach(item => {
      const targetBranchId = sessionStorage.getItem("reastock_branch_id") || "BRC-003";
      const existing = db.warehouseStock.find(x => (x.sku === item.sku || x.sku === item.code) && x.branchId === targetBranchId);
      const sku = item.sku || item.code || `SKU-${item.name}`;
      
      // Gunakan qtyGood jika tersedia (dan asumsi 1 item untuk kemudahan), jika tidak fallback ke item.qty
      const qtyToAdd = r.confirmationData && r.items.length === 1 
        ? Number(r.confirmationData.qtyGood) 
        : (Number(item.qty) || 0);

      if (existing) {
        existing.qty += qtyToAdd;
      } else {
        db.warehouseStock.push({
          sku,
          name: item.name || sku,
          type: item.category || item.type || "Umum",
          category: item.category || item.type || "Umum",
          unit: item.unit || "pcs",
          qty: qtyToAdd,
          minQty: 5,
          price: 0,
          branchId: sessionStorage.getItem("reastock_branch_id") || "BRC-003",
          addedAt: new Date().toISOString().slice(0, 10),
          source: "request",
          requestId: r.id,
        });
      }
    });

    // ✅ Kurangi stok gudang sumber
    db.warehouseStock = db.warehouseStock || [];
    (r.items || []).forEach(item => {
      const gudangStock = db.warehouseStock.find(
        s => s.branchId === r.toBranchId && (s.sku === item.sku || s.sku === item.code)
      );
      if (gudangStock) {
        gudangStock.qty = Math.max(0, gudangStock.qty - (Number(item.qty) || 0));
      }
    });

    db.notifications.unshift({
      id: newId("NTF"),
      type: "received",
      title: "Barang Diterima Toko",
      message: `Toko ${r.fromName} telah mengkonfirmasi penerimaan barang (${id}). Stok toko telah diperbarui.`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["driver", "gudang", "admin"],
    });

    return db;
  });
}


/**
 * Driver menyelesaikan pengiriman (setelah toko konfirmasi penerimaan)
 * Status: Diterima Toko -> Selesai
 */
export function driverSelesaikanPengiriman(id) {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Diterima Toko") return db;

    db.notifications = db.notifications || [];

    r.status = "Selesai";
    r.completedAt = new Date().toISOString();

    // TRANSFER STOK SUDAH DILAKUKAN SAAT TOKO TERIMA (tokoSelesaiTerima)
    // Jadi di sini tidak perlu melakukan pengurangan atau penambahan stok lagi.

    db.notifications.unshift({
      id: newId("NOTIF"),
      date: new Date().toISOString(),
      title: "Pengiriman Selesai",
      message: `Driver telah menyelesaikan pengiriman untuk Request ${r.id}.`,
      isRead: false,
      targetRoles: ["toko", "gudang", "admin"],
    });

    return db;
  });
}


/* =========================================================
 * RESTOCK gudang -> admin
 * ========================================================= */
export function createRestockToAdmin(payload) {
  const fromName = payload?.fromName || payload?.from || "Gudang";
  const fromBranchId = payload?.fromBranchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001";
  const note = payload?.note || "";
  const supplier = payload?.supplier || "";
  const satuan = payload?.satuan || "pcs";
  const items = normalizeItems(payload);

  return dbUpdate((db) => {
    const id = newId("RST");
    const createdAt = new Date().toISOString().slice(0, 10);

    db.restockToAdmin = db.restockToAdmin || [];
    db.notifications = db.notifications || [];

    db.restockToAdmin.unshift({
      id,
      fromRole: "gudang",
      fromName,
      fromBranchId,
      toRole: "admin",
      toName: "Admin",
      createdAt,
      items,
      note,
      supplier,
      satuan,
      decision: null,     // "Accepted" | "Declined" | null
      status: "Menunggu", // "Menunggu" | "Diproses" | "Selesai" | "Ditolak"
      proofImage: null,   // base64
    });

    db.notifications.unshift({
      id: newId("NTF"),
      type: "restock_new",
      title: "Request Restock",
      message: `Gudang mengirim permintaan restock barang (${id})`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin"],
    });

    return db;
  });
}

/* ===========================
 * ADMIN decide restock
 * Flow sesuai skema:
 * - accept => decision Accepted, status Diproses
 * - decline => decision Declined, status Ditolak
 * =========================== */
export function adminDecideRestock(id, decision) {
  const dec = normalizeDecision(decision);

  return dbUpdate((db) => {
    const r = (db.restockToAdmin || []).find((x) => x.id === id);
    if (!r) return db;

    db.notifications = db.notifications || [];

    r.decision = dec;

    if (dec === "Accepted") {
      r.status = "Diproses";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "restock_accepted",
        title: "Restock Disetujui",
        message: `Permintaan restock ${id} telah disetujui Admin`,
        time: nowTimeHHMM(),
        isRead: false,
        targetRoles: ["gudang"],
      });
    } else {
      r.status = "Ditolak";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "restock_declined",
        title: "Restock Ditolak",
        message: `Permintaan restock ${id} ditolak oleh Admin`,
        time: nowTimeHHMM(),
        isRead: false,
        targetRoles: ["gudang"],
      });
    }

    return db;
  });
}

/* ===========================
 * GUDANG upload bukti + selesai restock
 * Flow sesuai skema:
 * - hanya boleh saat status Diproses
 * - upload proofImage -> status Selesai
 * =========================== */
export function gudangFinishRestockWithProof(id, proofImage, confirmationData = null) {
  return dbUpdate((db) => {
    const r = (db.restockToAdmin || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Diproses") return db;

    db.notifications = db.notifications || [];

    r.proofImage = proofImage || null;
    r.status = "Selesai";
    
    if (confirmationData) {
      r.confirmationData = confirmationData;
    }

    // TAMBAH STOK FISIK GUDANG
    db.warehouseStock = db.warehouseStock || [];
    (r.items || []).forEach(item => {
      const stock = db.warehouseStock.find(s => s.branchId === (r.fromBranchId || s.branchId || "BRC-001") && s.sku === item.sku);
      
      // Gunakan qtyGood jika tersedia (dan asumsi 1 item), jika tidak fallback ke item.qty
      const qtyToAdd = r.confirmationData && r.items.length === 1 
        ? Number(r.confirmationData.qtyGood) 
        : (Number(item.qty) || 0);

      if (stock) {
        stock.qty += qtyToAdd;
      } else {
        db.warehouseStock.push({
          sku: item.sku,
          name: item.name || item.sku,
          type: item.category || item.type || "General",
          qty: qtyToAdd,
          minQty: 30,
          image: null,
          branchId: r.fromBranchId || sessionStorage.getItem("reastock_branch_id") || "BRC-001"
        });
      }
    });

    let notifMsg = `Proses restock ${id} telah selesai dengan bukti terlampir`;
    if (confirmationData) {
      notifMsg += ` Diterima baik: ${confirmationData.qtyGood}.`;
      if (Number(confirmationData.qtyBad) > 0) {
        notifMsg += ` Rusak: ${confirmationData.qtyBad}. Catatan: ${confirmationData.notes || '-'}`;
      }
    }

    db.notifications.unshift({
      id: newId("NTF"),
      type: "restock_done",
      title: "Restock Selesai",
      message: notifMsg,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin"],
    });

    return db;
  });
}

/* =========================================================
 * ADMIN -> GUDANG restock (Admin minta gudang menambah stok)
 * ========================================================= */
export function getAdminRestockToGudang() {
  return dbLoad().adminRestockToGudang || [];
}

export function subscribeAdminRestockToGudang(callback) {
  return makeSub(getAdminRestockToGudang, callback);
}

export function createAdminRestockToGudang(payload) {
  const {
    cabangGudang = "BRC-001",
    cabangGudangNama = sessionStorage.getItem("reastock_branch_name") || "Gudang Pusat",
    kodeBarang = "",
    namaBarang = "",
    jenisBarang = "",
    jumlah = 0,
    satuan = "pcs",
    supplier = "",
    prioritas = "Normal",
    catatan = "",
  } = payload || {};

  return dbUpdate((db) => {
    const id = newId("ARST");
    const createdAt = new Date().toISOString().slice(0, 10);

    db.adminRestockToGudang = db.adminRestockToGudang || [];
    db.notifications = db.notifications || [];

    db.adminRestockToGudang.unshift({
      id,
      createdAt,
      cabangGudang,
      cabangGudangNama,
      kodeBarang,
      namaBarang,
      jenisBarang,
      jumlah: Number(jumlah),
      satuan,
      supplier,
      prioritas,
      catatan,
      status: "Pending",
      proofPhotos: null,
    });

    db.notifications.unshift({
      id: newId("NTF"),
      type: "admin_restock_new",
      title: "Request Restock dari Admin",
      message: `Admin mengirim permintaan restock ${namaBarang} (${jumlah} ${satuan}) ke ${cabangGudangNama} (${id})`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["gudang"],
    });

    return db;
  });
}

export function gudangAcceptAdminRestock(id) {
  return dbUpdate((db) => {
    const r = (db.adminRestockToGudang || []).find((x) => x.id === id);
    if (!r) return db;
    if (r.status !== "Pending") return db;

    db.notifications = db.notifications || [];

    r.status = "Diproses";

    db.notifications.unshift({
      id: newId("NTF"),
      type: "admin_restock_accepted",
      title: "Restock Diterima Gudang",
      message: `Request restock ${id} telah diterima oleh Gudang dan sedang diproses`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin"],
    });

    return db;
  });
}

export function gudangUploadProofAndFinish(id, proofPhotos, confirmationData = null) {
  // proofPhotos = { checkBarang: [base64...], resiDriver: [base64...], pemasukanBarang: [base64...] }
  // confirmationData = { qtyGood: 100, qtyBad: 0, notes: "" }
  return dbUpdate((db) => {
    const r = (db.adminRestockToGudang || []).find((x) => x.id === id);
    if (!r) return db;
    if (r.status !== "Diproses") return db;

    db.notifications = db.notifications || [];

    r.proofPhotos = proofPhotos;
    r.status = "Selesai";
    r.completedAt = new Date().toISOString().slice(0, 10);
    
    if (confirmationData) {
      r.confirmationData = confirmationData;
    }

    const qtyToAdd = confirmationData ? Number(confirmationData.qtyGood || 0) : Number(r.jumlah || 0);

    // TAMBAH STOK FISIK GUDANG
    db.warehouseStock = db.warehouseStock || [];
    const stock = db.warehouseStock.find(s => s.branchId === r.cabangGudang && s.sku === r.kodeBarang);
    if (stock) {
      stock.qty += qtyToAdd;
    } else {
      db.warehouseStock.push({
        sku: r.kodeBarang,
        name: r.namaBarang || r.kodeBarang,
        type: r.jenisBarang || "General",
        qty: qtyToAdd,
        minQty: 30,
        image: null,
        branchId: r.cabangGudang
      });
    }

    let notifMsg = `Proses restock ${id} (${r.namaBarang}) telah selesai. Bukti foto telah diunggah oleh Gudang.`;
    if (confirmationData) {
      notifMsg += ` Diterima baik: ${confirmationData.qtyGood}.`;
      if (Number(confirmationData.qtyBad) > 0) {
        notifMsg += ` Rusak: ${confirmationData.qtyBad}. Catatan: ${confirmationData.notes || '-'}`;
      }
    }

    db.notifications.unshift({
      id: newId("NTF"),
      type: "admin_restock_done",
      title: "Restock Selesai",
      message: notifMsg,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin"],
    });

    return db;
  });
}

/* =======================================================================
 * BACKWARD COMPATIBILITY ALIASES
 * ======================================================================= */
export const createRequest = createTokoRequest;
export const completeShipmentByToko = tokoSelesaiTerima;
export const startShipment = gudangKirimBarang;

export function createBranchAccount(payload) {
  return dbUpdate((db) => {
    db.branches = db.branches || [];
    const id = newId("BRC");
    db.branches.push({
      id,
      ...payload
    });
    return db;
  });
}

export function deleteBranch(id) {
  return dbUpdate((db) => {
    db.branches = (db.branches || []).filter((b) => b.id !== id);
    return db;
  });
}

/* =======================================================================
 * BRANCH USERS (User accounts per cabang gudang/toko)
 * ======================================================================= */
export function getBranchUsers() {
  return dbLoad().branchUsers || [];
}

export function getCompanyProfile() {
  return dbLoad().companyProfile || null;
}

export function subscribeBranchUsers(callback) {
  return makeSub(getBranchUsers, callback);
}

export function createBranchUser(payload) {
  return dbUpdate((db) => {
    db.branchUsers = db.branchUsers || [];
    const id = newId("USR");
    db.branchUsers.push({
      id,
      branchId: payload.branchId,
      branchName: payload.branchName || "",
      branchType: payload.branchType || "gudang",
      nama: payload.nama || "",
      username: payload.username,
      password: payload.password,
      email: payload.email || "",
      phone: payload.phone || "",
      role: payload.role || "",
      vehicle: payload.vehicle || "",
      nomorSim: payload.nomorSim || "",
      alamatDomisili: payload.alamatDomisili || "",
      statusMitra: payload.statusMitra || "",
      joinedAt: payload.joinedAt || "",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    return db;
  });
}

export function registerCompanyAndAdmin(payload) {
  return dbUpdate((db) => {
    db.companyProfile = payload.company;
    
    db.branchUsers = db.branchUsers || [];
    db.branchUsers.push({
      id: newId("USR"),
      branchId: "", 
      branchName: "Kantor Pusat",
      branchType: "admin",
      nama: payload.admin.name,
      username: payload.admin.email,
      password: payload.admin.password,
      email: payload.admin.email,
      phone: payload.admin.phone,
      role: "admin",
      joinedAt: new Date().toISOString().slice(0, 10),
    });

    return db;
  });
}

export function deleteBranchUser(id) {
  return dbUpdate((db) => {
    db.branchUsers = (db.branchUsers || []).filter((u) => u.id !== id);
    return db;
  });
}

export function transferBranchUser(userId, newBranchId, newBranchName, newBranchType) {
  return dbUpdate((db) => {
    db.branchUsers = db.branchUsers || [];
    const user = db.branchUsers.find((u) => u.id === userId);
    if (user) {
      user.branchId = newBranchId;
      user.branchName = newBranchName;
      user.branchType = newBranchType;
    }
    return db;
  });
}

/* =======================================================================
 * LAPORAN TOKO -> ADMIN
 * ======================================================================= */
export function getTokoReports() {
  return dbLoad().tokoReports || [];
}

export function subscribeTokoReports(callback) {
  return makeSub(getTokoReports, callback);
}

export function uploadTokoReport(payload) {
  const {
    tokoId = sessionStorage.getItem("reastock_branch_id") || "BRC-003",
    tokoName = "Toko Utama",
    type = "Laporan Harian",
    period = "",
    date = new Date().toISOString().slice(0, 10),
    format = "PDF",
    fileData = null,
    author = "Admin Toko"
  } = payload || {};

  return dbUpdate((db) => {
    const id = newId("RPT");

    db.tokoReports = db.tokoReports || [];
    db.notifications = db.notifications || [];

    db.tokoReports.unshift({
      id,
      tokoId,
      tokoName,
      type,
      period,
      date,
      format,
      fileData,
      status: "Tersedia",
      author
    });

    db.notifications.unshift({
      id: newId("NTF"),
      type: "toko_report_new",
      title: "Laporan Toko Baru",
      message: `${tokoName} telah mengunggah ${type} (${id})`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin"],
    });

    return db;
  });
}

/* =======================================================================
 * LAPORAN GUDANG -> ADMIN
 * ======================================================================= */
export function getGudangReports() {
  return dbLoad().gudangReports || [];
}

export function subscribeGudangReports(callback) {
  return makeSub(getGudangReports, callback);
}

export function uploadGudangReport(payload) {
  const {
    gudangId = "WH-001",
    gudangName = sessionStorage.getItem("reastock_branch_name") || "Gudang Pusat",
    type = "Laporan Harian",
    period = "",
    date = new Date().toISOString().slice(0, 10),
    format = "PDF",
    fileData = null,
    author = "Admin Gudang"
  } = payload || {};

  return dbUpdate((db) => {
    const id = newId("RPT-GDG-");

    db.gudangReports = db.gudangReports || [];
    db.notifications = db.notifications || [];

    db.gudangReports.unshift({
      id,
      gudangId,
      gudangName,
      type,
      period,
      date,
      format,
      fileData,
      status: "Tersedia",
      author
    });

    db.notifications.unshift({
      id: newId("NTF"),
      type: "gudang_report_new",
      title: "Laporan Gudang Baru",
      message: `${gudangName} telah mengunggah ${type} (${id})`,
      time: nowTimeHHMM(),
      isRead: false,
      targetRoles: ["admin"],
    });

    return db;
  });
}

/* =======================================================================
 * TOKO INVENTORY (Stok Barang di Toko Sendiri)
 * ======================================================================= */

export function getTokoInventory() {
  const stock = dbLoad().warehouseStock || [];
  return stock
    .filter(s => s.branchId === (sessionStorage.getItem("reastock_branch_id") || "BRC-003"))
    .map(s => ({
      ...s,
      category: s.type || s.category || "Umum",
      unit: s.unit || "pcs",
      price: s.price || 0
    }));
}


/* =======================================================================
 * TOKO OUTFLOW (Pengeluaran Barang dari Toko)
 * ======================================================================= */

export function getTokoOutflow() {
  return dbLoad().tokoOutflow || [];
}

export function subscribeTokoOutflow(callback) {
  return makeSub(getTokoOutflow, callback);
}

/**
 * Catat pengeluaran barang dari toko
 * @param {Object} payload - { items: [{sku, name, qty}], tujuan, jenis, catatan }
 */
export function createTokoOutflow(payload) {
  const {
    items = [],
    tujuan = "",
    jenis = "Penjualan",
    catatan = "",
    tokoId = sessionStorage.getItem("reastock_branch_id") || "BRC-003",
    tokoName = "Toko Utama",
  } = payload || {};

  return dbUpdate((db) => {
    const id = newId("OUT");
    const createdAt = new Date().toISOString();

    db.tokoOutflow = db.tokoOutflow || [];
    db.warehouseStock = db.warehouseStock || [];

    // Kurangi stok dari inventaris toko (warehouseStock untuk cabang BRC-003)
    items.forEach(item => {
      const inv = db.warehouseStock.find(x => x.sku === item.sku && x.branchId === tokoId);
      if (inv) {
        inv.qty = Math.max(0, inv.qty - (Number(item.qty) || 0));
      }
    });

    const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);

    db.tokoOutflow.unshift({
      id,
      createdAt,
      tokoId,
      tokoName,
      items,
      totalQty,
      tujuan,
      jenis,
      catatan,
      status: "Selesai",
    });

    return db;
  });
}

