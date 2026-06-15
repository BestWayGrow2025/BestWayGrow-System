"use strict";

/*
========================================
SYSTEM ADMIN PIN CONTROL V1.1 FINAL CLEAN
========================================
✔ Single execution path only
✔ Single session source (getSession)
✔ Strict system_admin validation
✔ Safe request review layer
✔ No fallback auth chains
✔ No direct mutation of PIN engine
✔ Super admin escalation ready
✔ Production safe architecture
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_ADMIN_PIN_CONTROL__) return;

  window.__SYSTEM_ADMIN_PIN_CONTROL__ = true;

  console.log("[SYSTEM ADMIN PIN CONTROL] READY");

})();

// ================= SAFE SYSTEM ADMIN =================
function getSafeSystemAdmin() {

  const session = typeof getSession === "function"
    ? getSession()
    : null;

  if (!session || session.role !== "system_admin") return null;

  const user = typeof getUserById === "function"
    ? getUserById(session.userId)
    : null;

  if (!user || user.role !== "system_admin") return null;

  return user;
}

// ================= FETCH PIN REQUESTS =================
function getSystemAdminPinRequests() {

  const list = typeof getPinRequests === "function"
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

  const admin = getSafeSystemAdmin();
  if (!admin) return null;

  const req = getSystemAdminPinRequests().find(
    r => r.requestId === requestId
  );

  if (!req) return null;

  if (!canReviewAdminStockRequest(requestId)) return null;

  // SAFE OUTPUT ONLY (NO DIRECT MUTATION)
  return {
    requestId: req.requestId,
    userId: req.userId,
    type: req.type,
    quantity: Number(req.quantity || 1),
    status: req.status || "pending",
    route: "SYSTEM_ADMIN_APPROVAL",
    approvedBy: admin.userId
  };
}

// ================= REJECT REQUEST =================
function rejectAdminStockRequest(requestId) {

  const admin = getSafeSystemAdmin();
  if (!admin) return false;

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
    type: type,
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
