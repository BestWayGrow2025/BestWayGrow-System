/*
========================================
SUPER ADMIN PIN CONTROL V1.0
========================================
✔ Final PIN stock authority
✔ System admin stock request review
✔ PIN create authority
✔ PIN delete authority
✔ Global PIN override authority
✔ Final control layer only
========================================
*/

// ================= HELPERS =================
function getSafeSuperAdmin() {
  if (typeof getCurrentUser !== "function") return null;
  const user = getCurrentUser();
  return user && user.role === "super_admin" ? user : null;
}

function getSuperAdminPinRequests() {
  if (typeof getPinRequests !== "function") return [];
  return (getPinRequests() || []).filter(req =>
    req &&
    req.paymentId &&
    String(req.paymentId).startsWith("SYSTEM_STOCK_")
  );
}

function getPendingSystemStockRequests() {
  return getSuperAdminPinRequests().filter(req => req.status === "PENDING");
}

// ================= REVIEW =================
function canReviewSystemStockRequest(requestId) {
  const admin = getSafeSuperAdmin();
  if (!admin) return false;

  const req = getPendingSystemStockRequests().find(r => r.requestId === requestId);
  return !!req;
}

function approveSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) return null;

  const req = getPendingSystemStockRequests().find(r => r.requestId === requestId);
  if (!req) return null;

  return {
    requestId: req.requestId,
    userId: req.userId,
    type: req.type,
    quantity: Number(req.quantity || 1),
    status: req.status,
    route: "SUPER_ADMIN_PIN_CREATE_REQUIRED"
  };
}

function rejectSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) return false;
  if (typeof rejectPinRequest !== "function") return false;
  return rejectPinRequest(requestId, "SUPER_ADMIN");
}

// ================= PIN AUTHORITY =================
function canCreateGlobalPin(type) {
  return !!getSafeSuperAdmin() && ["upgrade", "repurchase"].includes(type);
}

function canDeleteGlobalPin(pin) {
  return typeof canDeletePin === "function"
    ? canDeletePin(pin, "super_admin")
    : false;
}

function canOverrideGlobalPin() {
  return !!getSafeSuperAdmin();
}
