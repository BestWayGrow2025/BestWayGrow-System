 "use strict";

/*
========================================
PLATFORM REGISTRATION QUEUE MONITOR v2.0
========================================
✔ Read-only registration queue monitor
✔ Uses core_session_authority.js
✔ Compatible with core_registration_queue_manager.js
✔ Auto refresh
✔ Queue status monitoring
✔ Production Final
========================================
*/

let session = null;
let currentUser = null;
let refreshTimer = null;

// ================= START =================
document.addEventListener("DOMContentLoaded", function () {
  authPage();
  loadQueue();
  startAutoRefresh();
});

// ================= LOGOUT =================
function forceLogout() {

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  window.location.replace("admin_auth.html");
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

  currentUser = getCurrentUser();

  if (!currentUser) {
    return forceLogout();
  }

  if (typeof hasRole !== "function" || !hasRole("admin")) {
    return forceLogout();
  }

  const status =
    currentUser.accountStatus ||
    currentUser.status ||
    "active";

  if (status !== "active") {
    return forceLogout();
  }
}

// ================= HTML ESCAPE =================
function escapeHtml(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ================= LOAD QUEUE =================
function loadQueue() {

  const tbody = document.getElementById("list");

  if (!tbody) return;

  if (typeof getRegQueue !== "function") {

    tbody.innerHTML =
      '<tr><td colspan="8">Registration queue system not available.</td></tr>';

    return;
  }

  const queue = getRegQueue() || [];

  if (!queue.length) {

    tbody.innerHTML =
      '<tr><td colspan="8">No registration requests found.</td></tr>';

    return;
  }

  tbody.innerHTML = "";

  queue.forEach(function (item) {

    const requestTime =
      item.requestTime
        ? new Date(item.requestTime).toLocaleString()
        : "N/A";

    const retry =
      item.retry || 0;

    const error =
      item.error || "-";

    tbody.innerHTML += `
      <tr>
        <td>${escapeHtml(item.mobile || "")}</td>
        <td>${escapeHtml(item.username || "")}</td>
        <td>${escapeHtml(item.email || "")}</td>
        <td>${escapeHtml(item.position || "")}</td>
        <td>${escapeHtml(item.status || "")}</td>
        <td>${requestTime}</td>
        <td>${retry}</td>
        <td>${escapeHtml(error)}</td>
      </tr>
    `;
  });
}

// ================= AUTO REFRESH =================
function startAutoRefresh() {

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  refreshTimer = setInterval(loadQueue, 10000);
}

// ================= CLEANUP =================
window.addEventListener("beforeunload", function () {

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

});

// ================= EXPORT =================
window.loadQueue = loadQueue;
