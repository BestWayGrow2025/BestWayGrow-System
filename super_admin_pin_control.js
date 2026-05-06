
/*
========================================
SUPER ADMIN PIN CONTROL (FINAL)
========================================
✔ Final PIN authority layer
✔ Uses executePinFlow ONLY
✔ No direct engine calls
✔ No duplicate auth
✔ System-level request control
✔ Global override authority
========================================
*/

// ================= SAFE SUPER ADMIN =================
function getSafeSuperAdmin() {
  if (typeof getSession !== "function") return null;

  const session = getSession();

  if (!session || session.role !== "super_admin") return null;

  if (typeof getUserById === "function") {
    return getUserById(session.userId);
  }

  return session;
}

// ================= REQUEST FILTER =================
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

// ================= VALIDATION =================
function canReviewSystemStockRequest(requestId) {
  const admin = getSafeSuperAdmin();
  if (!admin) return false;

  const requests = getPendingSystemStockRequests();
  const req = requests.find(r => r.requestId === requestId);

  return !!req;
}

// ================= APPROVE =================
function approveSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) {
    alert("Invalid or unauthorized request");
    return;
  }

  if (typeof executePinFlow !== "function") {
    throw new Error("PIN Flow Controller missing");
  }

  return executePinFlow("PROCESS_REQUEST", {
    requestId: requestId
  });
}

// ================= REJECT =================
function rejectSystemStockRequest(requestId) {
  if (!canReviewSystemStockRequest(requestId)) {
    alert("Invalid or unauthorized request");
    return;
  }

  if (typeof executePinFlow !== "function") {
    throw new Error("PIN Flow Controller missing");
  }

  return executePinFlow("REJECT_REQUEST", {
    requestId: requestId
  });
}

// ================= GLOBAL PIN AUTH =================
function canCreateGlobalPin(type) {
  const admin = getSafeSuperAdmin();
  return !!admin && ["upgrade", "repurchase"].includes(type);
}

function canDeleteGlobalPin(pin) {
  if (typeof canDeletePin !== "function") return false;
  return canDeletePin(pin, "super_admin");
}

function canOverrideGlobalPin() {
  return !!getSafeSuperAdmin();
}
