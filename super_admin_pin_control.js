/*
========================================
SUPER ADMIN PIN CONTROL V1.1 (FLOW ALIGNED)
========================================
✔ Final PIN stock authority
✔ System admin stock request review
✔ Uses executePinFlow (NO direct engine calls)
✔ Permission-safe
✔ No logic change (only routing fix)
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

// ================= APPROVE =================
function approveSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) return null;

  const req = getPendingSystemStockRequests().find(r => r.requestId === requestId);
  if (!req) return null;

  // 👉 NO direct creation here (design correct)
  // Super admin ONLY approves intent
  return {
    requestId: req.requestId,
    userId: req.userId,
    type: req.type,
    quantity: Number(req.quantity || 1),
    status: req.status,
    route: "SUPER_ADMIN_PIN_CREATE_REQUIRED"
  };
}

// ================= REJECT =================
function rejectSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) return false;

  // ✅ FLOW CONTROL (NO DIRECT CALL)
  if (typeof executePinFlow === "function") {
    executePinFlow("REJECT_REQUEST", {
      requestId
    });
    return true;
  }

  return false;
}

// ================= PIN AUTHORITY =================
function canCreateGlobalPin(type) {
  return !!getSafeSuperAdmin() &&
    ["upgrade", "repurchase"].includes(type);
}

function canDeleteGlobalPin(pin) {
  return typeof canDeletePin === "function"
    ? canDeletePin(pin, "super_admin")
    : false;
}

function canOverrideGlobalPin() {
  return !!getSafeSuperAdmin();
}
