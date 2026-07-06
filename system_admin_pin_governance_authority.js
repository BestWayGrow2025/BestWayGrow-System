 "use strict";

/*
========================================
SYSTEM ADMIN PIN CONTROL v1.2 FINAL SINGLE PATH
========================================
✔ One execution path (DOMContentLoaded only)
✔ One session source (getSession only)
✔ Core system dependency only
✔ No fallback auth chains
✔ Strict request validation
✔ Safe approve/reject flow
✔ Production stable module
========================================
*/

console.log("[SYSTEM ADMIN PIN CONTROL] INIT");

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

  try {

    initPage();
    checkAuth();

    if (
      typeof getPinRequests !== "function" ||
      typeof approvePinRequest !== "function" ||
      typeof rejectPinRequest !== "function"
    ) {
      alert("PIN Governance Engine not initialized.");
      return;
    }

    loadRequests();

  } catch (err) {
    console.error("[SYSTEM ADMIN PIN CONTROL ERROR]", err);
  }

});
// ================= CORE INIT =================
function initPage() {

  if (typeof initCoreSystem !== "function") {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  initCoreSystem();
}

// ================= AUTH (SINGLE PATH ONLY) =================
function checkAuth() {

 const session =
  typeof getSession === "function"
    ? getSession()
    : null;

  if (!session || session.role !== "system_admin") {
    window.location.href = "system_admin_login.html";
    throw new Error("UNAUTHORIZED");
  }

const user =
  typeof getUserById === "function"
    ? getUserById(session.userId)
    : null;

  if (!user || user.role !== "system_admin") {
    window.location.href = "system_admin_login.html";
    throw new Error("INVALID_USER");
  }

  if ((user.status || "active") !== "active") {
    window.location.href = "system_admin_login.html";
    throw new Error("INACTIVE");
  }

  window.__SYSTEM_ADMIN__ = user;
}

// ================= REQUEST FETCH =================
function getSystemAdminPinRequests() {

  const list = getPinRequests?.() || [];

  return list.filter(req =>
    req &&
    req.paymentId &&
    String(req.paymentId).startsWith("ADMIN_STOCK_")
  );
}

// ================= NORMALIZER =================
function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

// ================= LOAD REQUESTS =================
function loadRequests() {

  const pending = getPendingAdminStockRequests();

  const el = document.getElementById("requestBox");
  if (!el) return;

  el.innerHTML = pending.length
    ? pending.map(renderRequest).join("")
    : "<p>No pending requests</p>";
}

// ================= PENDING =================
function getPendingAdminStockRequests() {
  return getSystemAdminPinRequests().filter(req =>
    normalizeStatus(req.status) === "pending"
  );
}

// ================= RENDER =================
function renderRequest(req) {

  return `
    <div class="request-card">
      <p><b>ID:</b> ${req.requestId}</p>
      <p><b>User:</b> ${req.userId}</p>
      <p><b>Type:</b> ${req.type}</p>
      <p><b>Qty:</b> ${req.quantity || 1}</p>

      <button onclick="approve('${req.requestId}')">Approve</button>
      <button onclick="reject('${req.requestId}')">Reject</button>
    </div>
  `;
}

// ================= AUTH CHECK =================
function canReview(requestId) {

  const user = window.__SYSTEM_ADMIN__;
  if (!user) return false;

  const req = getSystemAdminPinRequests()
    .find(r => r.requestId === requestId);

  return !!req && normalizeStatus(req.status) === "pending";
}

// ================= APPROVE =================
function approve(requestId) {

  if (!canReview(requestId)) return;

  const req = getSystemAdminPinRequests()
    .find(r => r.requestId === requestId);

  if (!req) return;

  console.log("[APPROVED]", req);

  if (typeof approvePinRequest === "function") {
    approvePinRequest(requestId, "SYSTEM_ADMIN");
  }

  loadRequests();
}

// ================= REJECT =================
function reject(requestId) {

  if (!canReview(requestId)) return;

  console.log("[REJECTED]", requestId);

  if (typeof rejectPinRequest === "function") {
    rejectPinRequest(requestId, "SYSTEM_ADMIN");
  }

  loadRequests();
}

// ================= CREATE STOCK REQUEST =================
function createSystemStockRequest(type, qty = 1) {

  const user = window.__SYSTEM_ADMIN__;
  if (!user) return null;

  const allowed = ["upgrade", "repurchase"];

  if (!allowed.includes(type)) return null;
  if (qty <= 0) return null;

 if (typeof createPinRequest !== "function") {
  return null;
}

return createPinRequest({
    userId: user.userId,
    type,
    amount: 0,
    quantity: qty,
    paymentId: "SYSTEM_STOCK_" + Date.now()
  });
}

// ================= EXPORTS =================
window.systemAdminPinControl = {
  approve,
  reject,
  createSystemStockRequest,
  getPendingAdminStockRequests
};
