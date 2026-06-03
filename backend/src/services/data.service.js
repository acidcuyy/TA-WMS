/**
 * data.service.js
 * Semua query database menggunakan PostgreSQL via pg pool.
 * File db.json tidak lagi digunakan.
 */

import pool from "../config/db.js";

// ─── USERS ────────────────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const { rows } = await pool.query("SELECT * FROM users ORDER BY id");
  return rows;
};

export const getUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  return rows[0] || null;
};

export const getUserByRole = async (role) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE role = $1 LIMIT 1", [role]);
  return rows[0] || null;
};

export const updateUser = async (role, fields) => {
  const sets = Object.keys(fields).map((k, i) => `"${k}" = $${i + 2}`).join(", ");
  const vals = [role, ...Object.values(fields)];
  const { rows } = await pool.query(
    `UPDATE users SET ${sets} WHERE role = $1 RETURNING *`, vals
  );
  return rows[0];
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export const getAllProducts = async () => {
  const { rows } = await pool.query(`
    SELECT id, name, sku, category AS cat, unit, rack, stock, price, status, active, image, sold, icon
    FROM products ORDER BY id
  `);
  return rows;
};

export const getProductBySku = async (sku) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE sku = $1", [sku]);
  return rows[0] || null;
};

export const updateProductStock = async (sku, newStock) => {
  const status = newStock <= 0 ? "Habis" : newStock < 50 ? "Menipis" : "Aman";
  await pool.query(
    "UPDATE products SET stock = $1, status = $2, updated_at = NOW() WHERE sku = $3",
    [newStock, status, sku]
  );
};

// ─── STOCK REQUESTS ───────────────────────────────────────────────────────────

export const getAllRequests = async () => {
  const { rows: reqs } = await pool.query(
    "SELECT * FROM stock_requests ORDER BY created_at DESC"
  );
  for (const r of reqs) {
    const { rows: items } = await pool.query(
      "SELECT sku, qty FROM stock_request_items WHERE request_id = $1", [r.id]
    );
    r.items = items;
    // normalize field names untuk kompatibilitas frontend
    r.fromName = r.from_name;
    r.fromRole = r.from_role;
    r.toName = r.to_name;
    r.toRole = r.to_role;
    r.driverName = r.driver_name;
    r.createdAt = r.created_at;
    r.decision = r.decision;
  }
  return reqs;
};

export const getRequestById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM stock_requests WHERE id = $1", [id]);
  if (!rows[0]) return null;
  const req = rows[0];
  const { rows: items } = await pool.query(
    "SELECT sku, qty FROM stock_request_items WHERE request_id = $1", [id]
  );
  req.items = items;
  req.fromName = req.from_name;
  req.toName = req.to_name;
  req.driverName = req.driver_name;
  return req;
};

export const createRequest = async (data) => {
  const id = `REQ-${Date.now()}`;
  const { rows } = await pool.query(
    `INSERT INTO stock_requests (id, from_role, from_name, to_role, to_name, to_branch_id, note, status, priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'Menunggu',$8) RETURNING *`,
    [id, data.fromRole || "toko", data.fromName, data.toRole || "gudang",
     data.toName || "Gudang Pusat", data.toBranchId || null, data.note || "", data.priority || "Normal"]
  );
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      await pool.query(
        "INSERT INTO stock_request_items (request_id, sku, qty) VALUES ($1,$2,$3)",
        [id, item.sku, item.qty]
      );
    }
  }
  return rows[0];
};

export const updateRequestStatus = async (id, status, extra = {}) => {
  const fields = { status, updated_at: new Date() };
  if (extra.decision !== undefined) fields.decision = extra.decision;
  if (extra.driverName !== undefined) fields.driver_name = extra.driverName;
  if (extra.proofImage !== undefined) fields.proof_image = extra.proofImage;

  const sets = Object.keys(fields).map((k, i) => `"${k}" = $${i + 2}`).join(", ");
  await pool.query(
    `UPDATE stock_requests SET ${sets} WHERE id = $1`,
    [id, ...Object.values(fields)]
  );
};

// ─── SHIPMENTS ────────────────────────────────────────────────────────────────

export const getShipment = async (requestId) => {
  const { rows } = await pool.query(
    "SELECT * FROM shipments WHERE request_id = $1 OR id = $1 LIMIT 1", [requestId]
  );
  if (!rows[0]) return null;
  const s = rows[0];
  return {
    start: { lat: parseFloat(s.start_lat), lng: parseFloat(s.start_lng) },
    end:   { lat: parseFloat(s.end_lat),   lng: parseFloat(s.end_lng)   },
    driver: { lat: parseFloat(s.driver_lat), lng: parseFloat(s.driver_lng) },
    driverName: s.driver_name,
    startedAt: parseInt(s.started_at),
    durationMs: parseInt(s.duration_ms),
  };
};

export const createShipment = async (requestId, driverName) => {
  await pool.query(
    `INSERT INTO shipments (id, request_id, start_lat, start_lng, end_lat, end_lng, driver_lat, driver_lng, driver_name, started_at, duration_ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO NOTHING`,
    [requestId, requestId, -6.2, 106.8166, -6.1754, 106.8272, -6.197, 106.8177, driverName, Date.now(), 1080000]
  );
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getAllNotifications = async () => {
  const { rows } = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
  return rows.map(n => ({
    id: n.id, type: n.type, title: n.title, message: n.message,
    time: n.time, isRead: n.is_read, targetRoles: n.target_roles, link: n.link
  }));
};

export const createNotification = async (data) => {
  const id = `NTF-${Date.now()}`;
  await pool.query(
    `INSERT INTO notifications (id, type, title, message, time, is_read, target_roles, link)
     VALUES ($1,$2,$3,$4,$5,false,$6,$7)`,
    [id, data.type, data.title, data.message,
     new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
     data.targetRoles || [], data.link || null]
  );
};

export const markNotificationRead = async (id) => {
  await pool.query("UPDATE notifications SET is_read = true WHERE id = $1", [id]);
};

export const markAllNotificationsRead = async (role) => {
  if (role) {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE $1 = ANY(target_roles)", [role.toLowerCase()]
    );
  } else {
    await pool.query("UPDATE notifications SET is_read = true");
  }
};

// ─── DRIVER PROFILE ───────────────────────────────────────────────────────────

export const getDriverProfile = async () => {
  const { rows } = await pool.query("SELECT * FROM driver_profile LIMIT 1");
  return rows[0] || null;
};

export const updateDriverProfile = async (data) => {
  const { rows: existing } = await pool.query("SELECT id FROM driver_profile LIMIT 1");
  if (existing.length === 0) {
    await pool.query(
      `INSERT INTO driver_profile (name, email, phone, vehicle, role, status, last_login, joined_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [data.name, data.email, data.phone, data.vehicle, data.role || "Driver Utama",
       data.status || "Online", data.lastLogin, data.joinedAt]
    );
  } else {
    const fields = {};
    if (data.name)      fields.name = data.name;
    if (data.email)     fields.email = data.email;
    if (data.phone)     fields.phone = data.phone;
    if (data.vehicle)   fields.vehicle = data.vehicle;
    fields.updated_at = new Date();

    const sets = Object.keys(fields).map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    await pool.query(
      `UPDATE driver_profile SET ${sets} WHERE id = (SELECT id FROM driver_profile LIMIT 1)`,
      Object.values(fields)
    );
  }
  return getDriverProfile();
};

// ─── TOKO DATA ────────────────────────────────────────────────────────────────

export const getTokoOrders = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_orders ORDER BY created_at DESC");
  return rows;
};

export const getTokoReceipts = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_receipts ORDER BY created_at DESC");
  return rows;
};

export const getTokoDispatches = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_dispatches ORDER BY created_at DESC");
  return rows;
};

export const getTokoTransfers = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_transfers ORDER BY created_at DESC");
  return rows;
};

export const getTokoAdjustments = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_adjustments ORDER BY created_at DESC");
  return rows;
};

export const getTokoReturns = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_returns ORDER BY created_at DESC");
  return rows;
};

export const getTokoHistory = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_history ORDER BY created_at DESC");
  return rows.map(h => ({ ...h, desc: h.description, user: h.user }));
};

export const getTokoActivities = async () => {
  const { rows } = await pool.query("SELECT * FROM toko_activities ORDER BY created_at DESC");
  return rows.map(a => ({
    id: a.id, type: a.type, text: a.text, user: a.user,
    time: a.time, icon: a.icon, iconClass: a.icon_class
  }));
};

export const getTokoSales = async () => {
  const { rows } = await pool.query("SELECT date, total FROM toko_sales ORDER BY id");
  return rows;
};

export const getTokoExpenses = async () => {
  const { rows } = await pool.query("SELECT date, total FROM toko_expenses ORDER BY id DESC LIMIT 1");
  return rows;
};

// ─── GUDANG DATA ──────────────────────────────────────────────────────────────

export const getGudangReceipts = async () => {
  const { rows } = await pool.query("SELECT * FROM gudang_receipts ORDER BY created_at DESC");
  return rows;
};

export const getGudangDispatches = async () => {
  const { rows } = await pool.query("SELECT * FROM gudang_dispatches ORDER BY created_at DESC");
  return rows;
};

export const getGudangTransfers = async () => {
  const { rows } = await pool.query("SELECT * FROM gudang_transfers ORDER BY created_at DESC");
  return rows;
};

export const getGudangOrders = async () => {
  const { rows } = await pool.query("SELECT * FROM gudang_orders ORDER BY created_at DESC");
  return rows;
};

// ─── USER SETTINGS ────────────────────────────────────────────────────────────

export const getUserSettings = async (role) => {
  const { rows } = await pool.query("SELECT * FROM user_settings WHERE role = $1 LIMIT 1", [role]);
  return rows[0] || { notif_stock: true, notif_requests: true };
};

// ─── BACKWARD COMPAT: readDB / writeDB (masih digunakan di beberapa controller lama) ──
// Mengembalikan objek yang menyerupai struktur db.json untuk kompatibilitas

export const readDB = async () => {
  const [
    users, products, requests, notifications,
    tokoOrders, tokoReceipts, tokoDispatches, tokoTransfers,
    tokoAdjustments, tokoReturns, tokoHistory, tokoActivities,
    tokoSales, tokoExpenses,
    gudangReceipts, gudangDispatches, gudangTransfers,
    driverProfileData
  ] = await Promise.all([
    getAllUsers(), getAllProducts(), getAllRequests(), getAllNotifications(),
    getTokoOrders(), getTokoReceipts(), getTokoDispatches(), getTokoTransfers(),
    getTokoAdjustments(), getTokoReturns(), getTokoHistory(), getTokoActivities(),
    getTokoSales(), getTokoExpenses(),
    getGudangReceipts(), getGudangDispatches(), getGudangTransfers(),
    getDriverProfile()
  ]);

  return {
    users,
    products,
    requests,
    orders:           tokoOrders,
    activities:       tokoActivities,
    stock_requests:   requests,
    notifications,
    toko_orders:      tokoOrders,
    toko_receipts:    tokoReceipts,
    toko_dispatches:  tokoDispatches,
    toko_transfers:   tokoTransfers,
    toko_adjustments: tokoAdjustments,
    toko_returns:     tokoReturns,
    toko_history:     tokoHistory,
    toko_activities:  tokoActivities,
    toko_sales:       tokoSales,
    toko_expenses:    tokoExpenses,
    gudang_receipts:  gudangReceipts,
    gudang_dispatches:gudangDispatches,
    gudang_transfers: gudangTransfers,
    driver_profile:   driverProfileData,
    shipment_details: [],
    gudang_orders:    [],
    user_settings:    [],
  };
};

// writeDB sudah tidak digunakan — tiap controller pakai fungsi spesifik di atas
export const writeDB = async () => {
  console.warn("⚠️ writeDB dipanggil — migrasi ke PostgreSQL sudah selesai, gunakan fungsi spesifik.");
};
