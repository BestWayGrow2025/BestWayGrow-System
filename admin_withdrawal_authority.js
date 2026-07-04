"use strict";

let session = null;
let admin = null;
let refreshTimer = null;
let actionLock = false;

function forceLogout() {

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  window.location.replace("admin_login.html");
}

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();

  if (!admin?.userId) return;

  bindEvents();
  loadPage();
  startAutoRefresh();
});

// ================= INIT =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

// ================= AUTH =================
function authPage() {

  if (typeof getSession !== "function") {
    return forceLogout();
  }

  session = getSession();

  if (!session) {
    return forceLogout();
  }

  if (typeof getCurrentUser !== "function") {
    return forceLogout();
  }

  admin = getCurrentUser();

  if (!admin) {
    return forceLogout();
  }

  if (typeof hasRole !== "function" || !hasRole("admin")) {
    return forceLogout();
  }

  const status =
    admin.accountStatus ||
    admin.status ||
    "active";

  if (status !== "active") {
    return forceLogout();
  }
}
// ================= EVENTS =================
function bindEvents() {

  const backBtn = document.getElementById("backBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadPage);
  }
}

// ================= PAGE LOAD =================
function loadPage() {
  loadSystemStatus();
  loadRequests();
}

// ================= BACK =================
function goBack() {
  window.location.href = "admin_dashboard.html";
}

// ================= SYSTEM STATUS =================
function loadSystemStatus() {
  let s = typeof getSystemSettings === "function"
    ? getSystemSettings()
    : {};

  const el = document.getElementById("systemStatus");
  if (!el) return;

  el.innerHTML =
    `Withdraw System: ${s.withdrawStop ? "STOPPED 🔴" : "RUNNING 🟢"}`;
}

// ================= STATUS COLOR =================
function getStatusColor(status) {
  if (status === "PENDING") return "orange";
  if (status === "APPROVED") return "green";
  if (status === "REJECTED") return "red";
  return "black";
}

// ================= LOAD REQUESTS =================
function loadRequests() {

  const table = document.getElementById("withdrawTable");
  if (!table) return;

  table.innerHTML = "";

  let requests = typeof getWithdrawals === "function"
    ? getWithdrawals()
    : [];

  if (!requests.length) {
    table.innerHTML = "<tr><td colspan='9'>No requests</td></tr>";
    return;
  }

  table.innerHTML = requests.slice().reverse().map(function (req) {
    return `
      <tr>
        <td>${req.requestId || "-"}</td>
        <td>${req.userId || "-"}</td>
        <td>₹ ${Number(req.amount || 0).toFixed(2)}</td>
        <td>₹ ${Number(req.charge || 0).toFixed(2)}</td>
        <td>₹ ${Number(req.finalAmount || req.amount || 0).toFixed(2)}</td>
        <td style="color:${getStatusColor(req.status)}">${req.status || "-"}</td>
        <td>${req.time ? new Date(req.time).toLocaleString() : "-"}</td>
        <td>${req.processedAt ? new Date(req.processedAt).toLocaleString() : "-"}</td>
        <td>
          ${req.status === "PENDING"
            ? `
              <button onclick="approve('${req.requestId}')">Approve</button>
              <button onclick="reject('${req.requestId}')">Reject</button>
            `
            : "✔ Done"}
        </td>
      </tr>
    `;
  }).join("");

  if (typeof logActivity === "function") {
    logActivity(admin.userId, "ADMIN", "Viewed withdrawals");
  }
}

// ================= APPROVE =================
function approve(id) {
  if (actionLock) return;
  actionLock = true;

  try {
    let s = typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

    if (s.withdrawStop) {
      alert("🚫 Withdraw system OFF");
      return;
    }

    if (typeof approveWithdraw !== "function") {
      alert("Approve system missing");
      return;
    }

    approveWithdraw(id, admin.userId);

    if (typeof logActivity === "function") {
      logActivity(admin.userId, "ADMIN", "Approved withdrawal " + id);
    }

    alert("✅ Approved");
    loadRequests();
  } finally {
    actionLock = false;
  }
}

// ================= REJECT =================
function reject(id) {
  if (actionLock) return;
  actionLock = true;

  try {
    let s = typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

    if (s.withdrawStop) {
      alert("🚫 Withdraw system OFF");
      return;
    }

    if (typeof rejectWithdraw !== "function") {
      alert("Reject system missing");
      return;
    }

    rejectWithdraw(id, admin.userId);

    if (typeof logActivity === "function") {
      logActivity(admin.userId, "ADMIN", "Rejected withdrawal " + id);
    }

    alert("❌ Rejected");
    loadRequests();
  } finally {
    actionLock = false;
  }
}

// ================= AUTO REFRESH =================
function startAutoRefresh() {
  refreshTimer = setInterval(function () {
    loadPage();
  }, 5000);
}
