"use strict";

let session = null;
let currentUser = null;
let refreshInterval = null;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  bindEvents();
  loadPage();
  startAutoRefresh();
});

function forceLogout() {

  if (typeof logoutSession === "function") {
    logoutSession();
  }

  window.location.replace("admin_auth.html");
}

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

function bindEvents() {

  const refreshBtn =
    document.getElementById("refreshBtn");

  if (refreshBtn) {

    refreshBtn.addEventListener(
      "click",
      loadQueue
    );

  }
}

function loadPage() {
  loadQueue();
}

function escapeHtml(str = "") {

  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadQueue() {

  if (typeof getRegQueue !== "function") {

    console.warn("Queue system missing");
    return;
  }

  const container =
    document.getElementById("queueList");

  if (!container) return;

  const queue =
    (getRegQueue() || []).filter(Boolean);

  if (queue.length === 0) {

    container.innerHTML =
      `<div class="empty-state">No registration requests found</div>`;

    return;
  }

  container.innerHTML =
    queue.map(q => {

      const time =
        q.requestTime
          ? new Date(q.requestTime)
          : null;

      const formattedTime =
        time && !isNaN(time)
          ? time.toLocaleString()
          : "N/A";

      return `
        <div class="item">

          <b>${escapeHtml(q.username || "")}</b><br>

          Mobile:
          ${escapeHtml(q.mobile || "")}<br>

          Status:
          ${escapeHtml(q.status || "UNKNOWN")}<br>

          Request Time:
          ${formattedTime}<br>

          ${
            q.error
              ? `Error: ${escapeHtml(q.error)}<br>`
              : ""
          }

        </div>
      `;

    }).join("");
}

function startAutoRefresh() {

  if (refreshInterval) {

    clearInterval(refreshInterval);

  }

  refreshInterval =
    setInterval(
      loadQueue,
      10000
    );
}

