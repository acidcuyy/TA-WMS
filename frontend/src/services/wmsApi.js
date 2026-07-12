// src/services/wmsApi.js

const API_URL = "http://localhost:3000/api";

function authHeader() {
  const token = sessionStorage.getItem("reastock_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function fetchApi(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeader(),
    ...(options.headers || {})
  };
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "API request failed");
  }
  return data.data;
}

// Generic polling subscription helper for real-time visual updates
function makePollingSubscription(path, callback, intervalMs = 3000) {
  let active = true;
  const fetchData = async () => {
    try {
      const data = await fetchApi(path);
      if (active) callback(data);
    } catch (e) {
      console.error(`Subscription error for ${path}:`, e);
    }
  };
  
  fetchData();
  const timer = setInterval(fetchData, intervalMs);
  
  return () => {
    active = false;
    clearInterval(timer);
  };
}

/* =========================================================
 * AUTHENTICATION
 * ========================================================= */
export async function registerCompanyAndAdmin(payload) {
  return fetchApi("/auth/register-company", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(identifier, password) {
  return fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password })
  });
}

/* =========================================================
 * READ ENDPOINTS (PROMISE BASED)
 * ========================================================= */
export function getRequests() {
  return fetchApi("/requests");
}

export function getRequestById(id) {
  return fetchApi(`/requests/${id}`);
}

export function getShipment(requestId) {
  return fetchApi(`/driver/shipments/${requestId}`);
}

export function getWarehouseStock() {
  return fetchApi("/stocks");
}

export function getRestockToAdmin() {
  return fetchApi("/restock-admin");
}

export function getNotifications() {
  return fetchApi("/notifications");
}

export function getBranches() {
  return fetchApi("/branches");
}

export function getDriverProfile() {
  return fetchApi("/driver/profile");
}

export function getBranchUsers() {
  return fetchApi("/users");
}

export function getTokoReports() {
  return fetchApi("/reports?branchType=toko");
}

export function getGudangReports() {
  return fetchApi("/reports?branchType=gudang");
}

export function getTokoInventory() {
  return fetchApi("/stocks");
}

export function getTokoOutflow() {
  return fetchApi("/outflows/toko");
}

export function getAdminRestockToGudang() {
  return fetchApi("/admin-restock");
}

/* =========================================================
 * POLLING SUBSCRIPTIONS (LIVE UI INTEGRATION)
 * ========================================================= */
export function subscribeRequests(callback) {
  return makePollingSubscription("/requests", callback);
}

export function subscribeShipment(requestId, callback) {
  return makePollingSubscription(`/driver/shipments/${requestId}`, callback);
}

export function subscribeWarehouseStock(callback) {
  return makePollingSubscription("/stocks", callback);
}

export function subscribeRestockToAdmin(callback) {
  return makePollingSubscription("/restock-admin", callback);
}

export function subscribeNotifications(callback) {
  return makePollingSubscription("/notifications", callback);
}

export function subscribeBranches(callback) {
  return makePollingSubscription("/branches", callback);
}

export function subscribeAdminRestockToGudang(callback) {
  return makePollingSubscription("/admin-restock", callback);
}

export function subscribeDriverProfile(callback) {
  return makePollingSubscription("/driver/profile", callback);
}

export function subscribeTokoOutflow(callback) {
  return makePollingSubscription("/outflows/toko", callback);
}

export function subscribeTokoReports(callback) {
  return makePollingSubscription("/reports?branchType=toko", callback);
}

export function subscribeGudangReports(callback) {
  return makePollingSubscription("/reports?branchType=gudang", callback);
}

export function subscribeBranchUsers(callback) {
  return makePollingSubscription("/users", callback);
}

/* =========================================================
 * MUTATIONS (STOCKS)
 * ========================================================= */
export function addWarehouseStock(item) {
  return fetchApi("/stocks", {
    method: "POST",
    body: JSON.stringify(item)
  });
}

export function editWarehouseStock(sku, branchId, payload) {
  const body = typeof payload === "number" ? { qty: payload, branchId } : { ...payload, branchId };
  return fetchApi(`/stocks/${sku}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

export function deleteWarehouseStock(sku, branchId) {
  return fetchApi(`/stocks/${sku}/${branchId}`, {
    method: "DELETE"
  });
}

/* =========================================================
 * MUTATIONS (DRIVER)
 * ========================================================= */
export function updateDriverProfile(payload) {
  return fetchApi("/driver/profile", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function updateDriverLocation(id, lat, lng, progress) {
  return fetchApi(`/driver/shipments/${id}/location`, {
    method: "PATCH",
    body: JSON.stringify({ lat, lng, progress })
  });
}

/* =========================================================
 * MUTATIONS (TOKO REQUESTS & CONFIRMATIONS)
 * ========================================================= */
export function createTokoRequest(payload) {
  return fetchApi("/requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function gudangDecideRequest(id, decision) {
  return fetchApi(`/requests/${id}/decide`, {
    method: "PATCH",
    body: JSON.stringify({ decision })
  });
}

export function gudangKirimBarang(id) {
  return fetchApi(`/requests/${id}/dispatch`, {
    method: "PATCH",
    body: JSON.stringify({ isExternal: false })
  });
}

export function gudangKirimBarangEksternal(id) {
  return fetchApi(`/requests/${id}/dispatch`, {
    method: "PATCH",
    body: JSON.stringify({ isExternal: true })
  });
}

export function driverAcceptTask(id, driverName) {
  return fetchApi(`/driver/requests/${id}/accept`, {
    method: "PATCH",
    body: JSON.stringify({ driverName })
  });
}

export function driverUploadBuktiSiapKirim(id, driverName, proofData) {
  return fetchApi(`/driver/requests/${id}/upload`, {
    method: "PATCH",
    body: JSON.stringify({ resi: proofData.resi, foto: proofData.foto, driverName })
  });
}

export function tokoSelesaiTerima(id, proofImage, confirmationData) {
  return fetchApi(`/requests/${id}/confirm`, {
    method: "PATCH",
    body: JSON.stringify({ proofImage, confirmationData })
  });
}

export function driverSelesaikanPengiriman(id) {
  return fetchApi(`/driver/requests/${id}/complete`, {
    method: "PATCH"
  });
}

/* =========================================================
 * MUTATIONS (RESTOCK WAREHOUSE ⇄ ADMIN)
 * ========================================================= */
export function createRestockToAdmin(payload) {
  return fetchApi("/restock-admin", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function adminDecideRestock(id, decision) {
  return fetchApi(`/restock-admin/${id}/decide`, {
    method: "PATCH",
    body: JSON.stringify({ decision })
  });
}

export function gudangFinishRestockWithProof(id, proofImage, confirmationData) {
  return fetchApi(`/restock-admin/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ proofImage, confirmationData })
  });
}

/* =========================================================
 * MUTATIONS (ADMIN RESTOCK TO GUDANG)
 * ========================================================= */
export function createAdminRestockToGudang(payload) {
  return fetchApi("/admin-restock", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function gudangAcceptAdminRestock(id) {
  return fetchApi(`/admin-restock/${id}/accept`, {
    method: "PATCH"
  });
}

export function gudangUploadProofAndFinish(id, proofPhotos, confirmationData) {
  return fetchApi(`/admin-restock/${id}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ proofPhotos, confirmationData })
  });
}

/* =========================================================
 * MUTATIONS (BRANCH & USER MANAGEMENT)
 * ========================================================= */
export function createBranchAccount(payload) {
  return fetchApi("/branches", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateBranch(id, payload) {
  return fetchApi(`/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteBranch(id) {
  return fetchApi(`/branches/${id}`, {
    method: "DELETE"
  });
}

export function createBranchUser(payload) {
  return fetchApi("/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteBranchUser(id) {
  return fetchApi(`/users/${id}`, {
    method: "DELETE"
  });
}

export function transferBranchUser(userId, newBranchId, newBranchName, newBranchType) {
  return fetchApi(`/users/${userId}/transfer`, {
    method: "PATCH",
    body: JSON.stringify({ branchId: newBranchId })
  });
}

/* =========================================================
 * MUTATIONS (REPORTS & OUTFLOWS & NOTIFICATIONS)
 * ========================================================= */
export function uploadTokoReport(payload) {
  return fetchApi("/reports", {
    method: "POST",
    body: JSON.stringify({ ...payload, branchType: "toko" })
  });
}

export function uploadGudangReport(payload) {
  return fetchApi("/reports", {
    method: "POST",
    body: JSON.stringify({ ...payload, branchType: "gudang" })
  });
}

export function createTokoOutflow(payload) {
  return fetchApi("/outflows/toko", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function markNotificationAsRead(id) {
  return fetchApi(`/notifications/${id}/read`, {
    method: "PATCH"
  });
}

export function markMultipleNotificationsAsRead(ids) {
  return fetchApi("/notifications/read-multiple", {
    method: "POST",
    body: JSON.stringify({ ids })
  });
}

export function markAllNotificationsAsRead(role) {
  return fetchApi(`/notifications/read-all?role=${role || ""}`, {
    method: "PATCH"
  });
}

/* =========================================================
 * BACKWARD COMPATIBILITY ALIASES & NO-OPS
 * ========================================================= */
export const createRequest = createTokoRequest;
export const completeShipmentByToko = tokoSelesaiTerima;
export const startShipment = gudangKirimBarang;

export function getCompanyProfile() {
  return fetchApi("/auth/company-profile").catch(() => null);
}

export function updateCompanySettings(payload) {
  return fetchApi("/auth/company-profile/settings", {
    method: "PATCH",
    body: JSON.stringify(payload)
  }).catch(() => null);
}

export function sendHeartbeat() {
  return fetchApi("/users/heartbeat", { method: "POST" }).catch(() => null);
}

// Dummy storage Db triggers (compatibility)
export const loadDb = () => ({});
export const saveDb = () => {};
export const updateDb = () => {};
export function subscribeDb(callback) {
  return () => {};
}
