let session = null;
let currentUser = null;
let refreshInterval = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
  startAutoRefresh();
});

function initPage() {
  if (typeof initCoreSystem !== "function") {
    alert("core_system.js missing");
    return;
  }
  initCoreSystem();
}

function forceLogout() {
  localStorage.removeItem("loggedInAdmin");
  window.location.href = "admin_login.html";
}

function authPage() {
  session = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (!session || !session.userId) return forceLogout();
  if (typeof getUserById !== "function") return forceLogout();

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "admin") return forceLogout();

  const status = currentUser.accountStatus || currentUser.status || "active";
  if (status !== "active") return forceLogout();
}

function bindEvents() {
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadQueue);
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

  const container = document.getElementById("queueList");
  if (!container) return;

  const queue = (getRegQueue() || []).filter(Boolean);

  if (queue.length === 0) {
    container.innerHTML = `<div class="empty-state">No registration requests found</div>`;
    return;
  }

  container.innerHTML = queue.map(q => {
    const time = q.requestTime ? new Date(q.requestTime) : null;
    const formattedTime = time && !isNaN(time) ? time.toLocaleString() : "N/A";

    const fp = q.fingerprint || "";

    return `
      <div class="item">
        <b>${escapeHtml(q.username || "")}</b><br>
        Mobile: ${escapeHtml(q.mobile || "")}<br>
        Status: ${escapeHtml(q.status || "UNKNOWN")}<br>
        Request Time: ${formattedTime}<br>

        ${q.error ? `Error: ${escapeHtml(q.error)}<br>` : ""}

        <div style="margin-top:8px;">
          <button onclick="approveUser('${fp}')">Approve</button>
          <button onclick="rejectUser('${fp}')">Reject</button>
        </div>
      </div>
    `;
  }).join("");
}

function startAutoRefresh() {
  refreshInterval = setInterval(loadQueue, 10000);
}

// hooks (future backend integration)
function approveUser(fp) {
  if (!fp) return console.warn("Missing fingerprint");
  console.log("Approve:", fp);
}

function rejectUser(fp) {
  if (!fp) return console.warn("Missing fingerprint");
  console.log("Reject:", fp);
}
