/*
========================================
SYSTEM ADMIN PIN CONTROL V1.0
========================================
✔ System admin stock control
✔ Admin request review layer
✔ Stock escalation to super admin
✔ No direct stock mutation
✔ Safe control routing only
========================================
*/

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

function getPendingAdminStockRequests() {
  return getSystemAdminPinRequests().filter(req => req.status === "PENDING");
}

// ================= REVIEW =================
function canReviewAdminStockRequest(requestId) {
  const admin = getSafeSystemAdmin();
  if (!admin) return false;

  const req = getPendingAdminStockRequests().find(r => r.requestId === requestId);
  return !!req;
}

function approveAdminStockRequest(requestId) {
  if (!canReviewAdminStockRequest(requestId)) return null;

  const req = getPendingAdminStockRequests().find(r => r.requestId === requestId);
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

function rejectAdminStockRequest(requestId) {
  if (!canReviewAdminStockRequest(requestId)) return false;
  if (typeof rejectPinRequest !== "function") return false;
  return rejectPinRequest(requestId, "SYSTEM_ADMIN");
}

// ================= ESCALATION =================
function canEscalateToSuperAdmin(type, qty = 1) {
  const admin = getSafeSystemAdmin();
  if (!admin) return false;

  qty = Number(qty || 1);
  if (qty < 1) qty = 1;

  return ["upgrade", "repurchase"].includes(type) && qty > 0;
}

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
