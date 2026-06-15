"use strict";

/*
========================================
SYSTEM ADMIN PIN CONTROL V1.1 FINAL
========================================
✔ System admin stock control
✔ Safe request review layer
✔ Super admin escalation support
✔ Safe status normalization
✔ No direct stock mutation
✔ Production safe
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
  if (typeof getCurrentUser !== "function") return null;

  const user = getCurrentUser();
  if (!user) return null;

  return user.role === "system_admin" ? user : null;
}

// ================= REQUEST FETCH =================
function getSystemAdminPinRequests() {

  const list =
    typeof getPinRequests === "function"
      ? getPinRequests()
      : [];

  return (list || []).filter(req =>
    req &&
    req.paymentId &&
    String(req.paymentId).startsWith("ADMIN_STOCK_")
  );
}

// ================= NORMALIZER =================
function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

// ================= PENDING REQUESTS =================
function getPendingAdminStockRequests() {
  return getSystemAdminPinRequests().filter(req =>
    normalizeStatus(req.status) === "pending"
  );
}

// ================= AUTH CHECK =================
function canReviewAdminStockRequest(requestId) {

  const admin = getSafeSystemAdmin();
  if (!admin) return false;

  const req = getSystemAdminPinRequests().find(
    r => r.requestId === requestId
  );

  return !!req && normalizeStatus(req.status) === "pending";
}

// ================= APPROVE REQUEST =================
function approveAdminStockRequest(requestId) {

  const req = getSystemAdminPinRequests().find(
    r => r.requestId === requestId
  );

  if (!req) return null;

  if (!canReviewAdminStockRequest(requestId)) return null;

  return {
    requestId: req.requestId,
    userId: req.userId,
    type: req.type,
    quantity: Number(req.quantity || 1),
    status: req.status || "pending",
    route: "SYSTEM_ADMIN_APPROVAL"
  };
}

// ================= REJECT REQUEST =================
function rejectAdminStockRequest(requestId) {

  if (!canReviewAdminStockRequest(requestId)) return false;

  if (typeof rejectPinRequest !== "function") return false;

  return rejectPinRequest(requestId, "SYSTEM_ADMIN");
}

// ================= ESCALATION RULE =================
function canEscalateToSuperAdmin(type, qty = 1) {

  const admin = getSafeSystemAdmin();
  if (!admin) return false;

  const allowedTypes = ["upgrade", "repurchase"];

  return allowedTypes.includes(type) && Number(qty || 1) > 0;
}

// ================= CREATE STOCK REQUEST =================
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
