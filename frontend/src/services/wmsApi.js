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
  if (Array.isArray(payload.items) && payload.items.length) return payload.items;

  // fallback lama: itemCode + qty
  if (payload.itemCode && payload.qty != null) {
    return [{ sku: payload.itemCode, qty: Number(payload.qty) || 0 }];
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

/* =========================================================
 * TOKO -> GUDANG request
 * ========================================================= */
export function createTokoRequest(payload) {
  const fromName = payload?.fromName || payload?.from || "Toko";
  const note = payload?.note || "";
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
      toRole: "gudang",
      toName: "Gudang",
      createdAt,
      items,
      note,
      decision: null,
      status: "Menunggu",
    });

    // notif untuk gudang/admin (global)
    db.notifications.unshift({
      id: newId("NTF"),
      type: "request_toko",
      title: "Request Toko",
      message: `${id} request dari ${fromName} ke Gudang`,
      time: nowTimeHHMM(),
      isRead: false,
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
      r.status = "Diproses";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "request_accepted",
        title: "Gudang ACC",
        message: `${id} disetujui Gudang`,
        time: nowTimeHHMM(),
        isRead: false,
      });
    } else {
      r.status = "Ditolak";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "request_declined",
        title: "Gudang Decline",
        message: `${id} ditolak Gudang`,
        time: nowTimeHHMM(),
        isRead: false,
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

    if (r.status !== "Diproses") return db;

    db.shipments = db.shipments || {};
    db.notifications = db.notifications || [];

    r.status = "Mengirim";

    db.shipments[id] = {
      start: { lat: -6.2, lng: 106.8166 }, // gudang dummy
      end: { lat: -6.1754, lng: 106.8272 }, // toko dummy
      startedAt: Date.now(),
      durationMs: 1000 * 60 * 18,
      driver: { lat: -6.197, lng: 106.8177 },
    };

    db.notifications.unshift({
      id: newId("NTF"),
      type: "shipping",
      title: "Pengiriman",
      message: `${id} sedang dikirim`,
      time: nowTimeHHMM(),
      isRead: false,
    });

    return db;
  });
}

/* ===========================
 * TOKO selesai terima barang
 * Flow sesuai skema:
 * - hanya boleh saat status Mengirim
 * - status Selesai (dua sisi sama karena data 1 sumber)
 * =========================== */
export function tokoSelesaiTerima(id) {
  return dbUpdate((db) => {
    const r = (db.requests || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Mengirim") return db;

    db.notifications = db.notifications || [];

    r.status = "Selesai";

    db.notifications.unshift({
      id: newId("NTF"),
      type: "done",
      title: "Selesai",
      message: `${id} selesai (barang diterima ${r.fromName})`,
      time: nowTimeHHMM(),
      isRead: false,
    });

    return db;
  });
}

/* =========================================================
 * RESTOCK gudang -> admin
 * ========================================================= */
export function createRestockToAdmin(payload) {
  const fromName = payload?.fromName || payload?.from || "Gudang";
  const note = payload?.note || "";
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
      toRole: "admin",
      toName: "Admin",
      createdAt,
      items,
      note,
      decision: null,     // "Accepted" | "Declined" | null
      status: "Menunggu", // "Menunggu" | "Diproses" | "Selesai" | "Ditolak"
      proofImage: null,   // base64
    });

    db.notifications.unshift({
      id: newId("NTF"),
      type: "restock_new",
      title: "Request Restock",
      message: `${id} request restock dari Gudang`,
      time: nowTimeHHMM(),
      isRead: false,
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
        title: "Admin Accept",
        message: `${id} disetujui Admin`,
        time: nowTimeHHMM(),
        isRead: false,
      });
    } else {
      r.status = "Ditolak";

      db.notifications.unshift({
        id: newId("NTF"),
        type: "restock_declined",
        title: "Admin Decline",
        message: `${id} ditolak Admin`,
        time: nowTimeHHMM(),
        isRead: false,
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
export function gudangFinishRestockWithProof(id, proofImage) {
  return dbUpdate((db) => {
    const r = (db.restockToAdmin || []).find((x) => x.id === id);
    if (!r) return db;

    if (r.status !== "Diproses") return db;

    db.notifications = db.notifications || [];

    r.proofImage = proofImage || null;
    r.status = "Selesai";

    db.notifications.unshift({
      id: newId("NTF"),
      type: "restock_done",
      title: "Restock Selesai",
      message: `${id} selesai (bukti diupload Gudang)`,
      time: nowTimeHHMM(),
      isRead: false,
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
