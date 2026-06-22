"use strict";

/*
========================================
SYSTEM ADMIN PIN CONTROL V1.1 FINAL CLEAN
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_ADMIN_PIN_CONTROL__) return;

  window.__SYSTEM_ADMIN_PIN_CONTROL__ = true;

  console.log("[SYSTEM ADMIN PIN CONTROL] READY");

})();

// ================= SAFE ADMIN =================
function getSafeSystemAdmin() {

  if (typeof getSession !== "function") return null;

  const session = getSession();

  if (!session || session.role !== "system_admin") return null;

  if (typeof getUserById !== "function") return null;

  const user = getUserById(session.userId);

  if (!user || user.role !== "system_admin") return null;

  return user;
}

// ================= REQUEST FETCH =================
function getSystemAdminPinRequests() {

  if (typeof getPinRequests !== "function") return [];

  return (getPinRequests() || []).filter(req =>
    req &&
    req.paymentId &&
    String(req.paymentId).startsWith("ADMIN_STOCK_")
  );
}

// ================= HELPER =================
function findAdminRequest(requestId) {
  return getSystemAdminPinRequests().find(
    r => r.requestId === requestId
  );
}

// ================= NORMALIZER =================
function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

// ================= PENDING =================
function getPendingAdminStockRequests() {

  return getSystemAdminPinRequests().filter(req =>
    normalizeStatus(req.status) === "pending"
  );
}

// ================= AUTH CHECK =================
function canReviewAdminStockRequest(requestId) {

  const admin = getSafeSystemAdmin();
  if (!admin) return false;

  const req = findAdminRequest(requestId);

  return req && normalizeStatus(req.status) === "pending";
}

// ================= APPROVE =================
function approveAdminStockRequest(requestId) {

  if (!canReviewAdminStockRequest(requestId)) return null;

  const req = findAdminRequest(requestId);
  if (!req) return null;

  return {
    requestId: req.requestId,
    userId: req.userId,
    type: req.type,
    quantity: Number(req.quantity || 1),
    status: "approved",
    route: "SYSTEM_ADMIN_APPROVAL"
  };
}

// ================= REJECT =================
function rejectAdminStockRequest(requestId) {

  if (!canReviewAdminStockRequest(requestId)) return false;

  if (typeof rejectPinRequest !== "function") return false;

  return rejectPinRequest(requestId, "SYSTEM_ADMIN");
}

// ================= ESCALATION =================
function canEscalateToSuperAdmin(type, qty = 1) {

  const admin = getSafeSystemAdmin();
  if (!admin) return false;

  const allowedTypes = ["upgrade", "repurchase"];

  return allowedTypes.includes(type) && Number(qty || 1) > 0;
}

// ================= CREATE REQUEST =================
function createSystemStockRequest(type, qty = 1) {

  const admin = getSafeSystemAdmin();
  if (!admin) return null;

  if (!canEscalateToSuperAdmin(type, qty)) return null;

  if (typeof createPinRequest !== "function") return null;

  return createPinRequest({
    userId: admin.userId,
    type,
    amount: 0,
    quantity: Number(qty || 1),
    paymentId: "SYSTEM_STOCK_" + Date.now()
  });
}

// ================= EXPORTS =================
window.approveAdminStockRequest = approveAdminStockRequest;
window.rejectAdminStockRequest = rejectAdminStockRequest;
window.createSystemStockRequest = createSystemStockRequest;
window.getPendingAdminStockRequests = getPendingAdminStockRequests;
window.canReviewAdminStockRequest = canReviewAdminStockRequest;
window.getSystemAdminPinRequests = getSystemAdminPinRequests;
