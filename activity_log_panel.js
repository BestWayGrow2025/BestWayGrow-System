let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  session =
    JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null") ||
    JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null");

  if (!session || !session.userId) {
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  if (typeof getUserById !== "function") {
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || (currentUser.role !== "super_admin" && currentUser.role !== "system_admin")) {
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("loadLogsBtn").addEventListener("click", function () {
    safeClick(loadLogs);
  });

  document.getElementById("clearLogsBtn").addEventListener("click", function () {
    safeClick(clearLogs);
  });

  document.getElementById("loadCriticalBtn").addEventListener("click", function () {
    safeClick(loadCritical);
  });
}

function loadPage() {
  document.getElementById("welcome").innerText =
    "Logged in: " + currentUser.userId + " (" + currentUser.role + ")";
}

function safeClick(fn) {
  if (lock) return;

  lock = true;

  try {
    fn();
  } catch (err) {
    console.error(err);
  }

  setTimeout(function () {
    lock = false;
  }, 400);
}

function isSystemSafe() {
  let settings = getSystemSettings() || {};

  if (settings.lockMode) {
    alert("System Locked");
    return false;
  }

  return true;
}

function loadLogs() {
  if (!isSystemSafe()) return;

  let userId = document.getElementById("userId").value.trim();
  let role = document.getElementById("role").value;
  let keyword = document.getElementById("keyword").value.trim();
  let source = document.getElementById("source").value;

  let logs = filterLogsAdvanced({ userId, role, keyword, source });

  let html = `
    <table>
      <tr>
        <th>ID</th>
        <th>User</th>
        <th>Role</th>
        <th>Action</th>
        <th>Source</th>
        <th>Time</th>
      </tr>
  `;

  if (!logs.length) {
    html += `<tr><td colspan="6">No Logs</td></tr>`;
  }

  logs.reverse().forEach(function (log) {
    html += `
      <tr>
        <td>${log.logId}</td>
        <td>${log.userId}</td>
        <td>${log.role}</td>
        <td>${log.action}</td>
        <td>${log.source}</td>
        <td>${new Date(log.time).toLocaleString()}</td>
      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("logTable").innerHTML = html;
}

function clearLogs() {
  if (!isSystemSafe()) return;

  if (!confirm("Clear all logs?")) return;

  clearActivityLogs(currentUser.userId);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, currentUser.role, "Cleared Activity Logs", "ADMIN");
  }

  loadLogs();
}

function loadCritical() {
  if (!isSystemSafe()) return;

  let logs = getCriticalLogs();

  let html = `
    <table>
      <tr>
        <th>ID</th>
        <th>User</th>
        <th>Message</th>
        <th>Source</th>
        <th>Time</th>
      </tr>
  `;

  if (!logs.length) {
    html += `<tr><td colspan="5">No Critical Logs</td></tr>`;
  }

  logs.reverse().forEach(function (log) {
    html += `
      <tr>
        <td>${log.id}</td>
        <td>${log.userId}</td>
        <td>${log.message}</td>
        <td>${log.source}</td>
        <td>${new Date(log.time).toLocaleString()}</td>
      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("criticalTable").innerHTML = html;
}
