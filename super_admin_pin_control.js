"use strict";

/*
========================================
SUPER ADMIN PIN CONTROL vFINAL CORE LAYER
========================================
✔ PIN approval logic
✔ PIN request governance
✔ Stock control interface
✔ Super admin override layer
✔ No UI / no registry logic
✔ Pure business logic module
========================================
*/

console.log("[SUPER ADMIN PIN CONTROL] INIT");

// ================= STATE =================
let lock = false;

// ================= CORE ACCESS =================
function getCore() {
  return window.ENTERPRISE_CORE_ENGINE || null;
}

// ================= AUTH GUARD =================
function getSuperAdmin() {
  const user = window.getCurrentUser?.();
  return user?.role === "super_admin" ? user : null;
}

// ================= PIN REQUEST FETCH =================
function getPinRequests() {

  const list = window.getPinRequests?.() || [];

  return list.filter(r =>
    r && String(r.paymentId || "").startsWith("PIN_")
  );
}

// ================= PENDING REQUESTS =================
function getPendingRequests() {

  return getPinRequests().filter(r =>
    (r.status || "").toLowerCase() === "pending"
  );
}

// ================= VALIDATION =================
function canProcess(requestId) {

  const admin = getSuperAdmin();
  if (!admin) return false;

  const req = getPinRequests().find(r => r.requestId === requestId);
  if (!req) return false;

  return req.status === "pending";
}

// ================= APPROVE =================
function approveRequest(requestId) {

  if (lock) return;
  lock = true;

  try {

    if (!canProcess(requestId)) return false;

    const req = getPinRequests().find(r => r.requestId === requestId);
    if (!req) return false;

    req.status = "approved";

    window.savePinRequests?.();

    window.logActivity?.(
      getSuperAdmin()?.userId,
      "SUPER_ADMIN",
      "PIN APPROVED: " + requestId
    );

    return true;

  } finally {
    lock = false;
  }
}

// ================= REJECT =================
function rejectRequest(requestId) {

  if (lock) return;
  lock = true;

  try {

    if (!canProcess(requestId)) return false;

    const req = getPinRequests().find(r => r.requestId === requestId);
    if (!req) return false;

    req.status = "rejected";

    window.savePinRequests?.();

    window.logActivity?.(
      getSuperAdmin()?.userId,
      "SUPER_ADMIN",
      "PIN REJECTED: " + requestId
    );

    return true;

  } finally {
    lock = false;
  }
}

// ================= STOCK CONTROL =================
function adjustPinStock(type, qty = 1) {

  const admin = getSuperAdmin();
  if (!admin) return false;

  const stock = window.getPinStock?.() || {};

  stock[type] = (stock[type] || 0) + Number(qty);

  window.savePinStock?.(stock);

  window.logActivity?.(
    admin.userId,
    "SUPER_ADMIN",
    `PIN STOCK UPDATED ${type} +${qty}`
  );

  return true;
}

// ================= ESCALATION RULE =================
function escalateToSystem(type, qty) {

  const allowed = ["upgrade", "repurchase", "admin_stock"];

  if (!allowed.includes(type)) return false;
  if (qty <= 0) return false;

  return window.createPinRequest?.({
    userId: getSuperAdmin()?.userId,
    type,
    quantity: qty,
    amount: 0,
    paymentId: "SUPER_PIN_" + Date.now()
  });
}

// ================= EXPORTS =================
window.superAdminPinControl = {
  approveRequest,
  rejectRequest,
  adjustPinStock,
  escalateToSystem,
  getPendingRequests
};

window.__SUPER_ADMIN_PIN_CONTROL_LOADED__ = true;

console.log("[SUPER ADMIN PIN CONTROL] READY");
