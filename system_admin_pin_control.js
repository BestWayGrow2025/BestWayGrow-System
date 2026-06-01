"use strict";

/*
========================================
SYSTEM ADMIN PIN CONTROL V1.1 (FULL FIXED)
========================================
✔ System admin stock control
✔ Safe request review layer
✔ Super admin escalation support
✔ Safe status normalization
✔ No direct stock mutation
✔ FULL RESTORED FILE
✔ Production SAFE
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_ADMIN_PIN_CONTROL__) return;

  window.__SYSTEM_ADMIN_PIN_CONTROL__ = true;

  console.log("[SYSTEM ADMIN PIN CONTROL] READY");

})();

// ================= HELPERS =================
function getSafeSystemAdmin() {

  if (typeof getCurrentUser !== "function") return null;

  const user = getCurrentUser();

  return user && user.role === "system_admin" ? user : null;
}

function getSystemAdminPinRequests() {

  if (typeof getPinRequests !== "function") return [];

  return (getPinRequests() || []).filter(req =>
    req &&
    req.paymentId &&
    String(req.paymentId).startsWith("ADMIN_STOCK_")
  );
}

function normalizeStatus(status) {

  return String(status || "")
    .trim()
    .toLowerCase();
}

// ================= PENDING REQUESTS =================
function getPendingAdminStockRequests() {

  return getSystemAdminPinRequests().filter(req =>
    normalizeStatus(req.status) === "pending"
  );
}

// ================= REVIEW CHECK =================
function canReviewAdminStockRequest(requestId) {

  const admin = getSafeSystemAdmin();

  if (!admin) return false;

  const req = getSystemAdminPinRequests().find(
    r => r.requestId === requestId
  );

  return !!req;
}

// ================= APPROVE =================
function approveAdminStockRequest(requestId) {

  if (!canReviewAdminStockRequest(requestId)) return null;

  const req = getSystemAdminPinRequests().find(
    r => r.requestId === requestId
  );

  if (!req) return null;

  return {
    requestId: req.requestId,
    userId: req.userId,
    type: req.type,
    quantity: Number(req.quantity || 1),
    status: req.status,
    route: "MANUAL_ASSIGN_REQUIRED"
  };
}

// ================= REJECT =================
function rejectAdminStockRequest(requestId) {

  if (!canReviewAdminStockRequest(requestId)) return false;

  if (typeof rejectPinRequest !== "function") return false;

  return rejectPinRequest(requestId, "SYSTEM_ADMIN");
}

// ================= ESCALATION CHECK =================
function canEscalateToSuperAdmin(type, qty = 1) {

  const admin = getSafeSystemAdmin();

  if (!admin) return false;

  qty = Number(qty || 1);

  if (qty < 1) qty = 1;

  const allowedTypes = ["upgrade", "repurchase"];

  return allowedTypes.includes(type) && qty > 0;
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
    paymentId: "SYSTEM_STOCK_" + Date.now(),
    quantity: qty
  });
}

// ================= EXPORT =================
window.approveAdminStockRequest = approveAdminStockRequest;
window.rejectAdminStockRequest = rejectAdminStockRequest;
window.createSystemStockRequest = createSystemStockRequest;
window.getPendingAdminStockRequests = getPendingAdminStockRequests;
window.canReviewAdminStockRequest = canReviewAdminStockRequest;
