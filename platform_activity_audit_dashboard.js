let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  bindEvents();
  loadPage();
});

function authPage() {

  session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || !session.userId) {
    window.location.replace("super_admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;

  if (
    !currentUser ||
    (
      String(currentUser.role).toLowerCase() !== "super_admin" &&
      String(currentUser.role).toLowerCase() !== "system_admin"
    )
  ) {
    window.location.replace("super_admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  if (
    (currentUser.status || "active") !== "active"
  ) {
    window.location.replace("super_admin_auth.html");
    throw new Error("AUTH FAILED");
  }

}
function bindEvents() {

  const loadLogsBtn =
    document.getElementById("loadLogsBtn");

  const clearLogsBtn =
    document.getElementById("clearLogsBtn");

  const loadCriticalBtn =
    document.getElementById("loadCriticalBtn");

  if (loadLogsBtn) {
    loadLogsBtn.addEventListener("click", function () {
      safeClick(loadLogs);
    });
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener("click", function () {
      safeClick(clearLogs);
    });
  }

  if (loadCriticalBtn) {
    loadCriticalBtn.addEventListener("click", function () {
      safeClick(loadCritical);
    });
  }

}
function loadPage() {

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Logged in: " +
      currentUser.userId +
      " (" +
      currentUser.role +
      ")";
  }

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
  return true;
}

function loadLogs() {
  if (!isSystemSafe()) return;

  let userId = document.getElementById("userId").value.trim();
  let role = document.getElementById("role").value;
  let keyword = document.getElementById("keyword").value.trim();
  let source = document.getElementById("source").value;

if (typeof filterLogsAdvanced !== "function") {
  document.getElementById("logTable").innerHTML =
    "Log system unavailable";
  return;
}

const logs = filterLogsAdvanced({
  userId,
  role,
  keyword,
  source
});

const safeLogs =
  Array.isArray(logs)
    ? logs
    : [];

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

 if (!safeLogs.length) {
    html += `<tr><td colspan="6">No Logs</td></tr>`;
  }

 safeLogs.slice().reverse().forEach(function (log) {
    html += `
      <tr>
        <td>${log.logId || "-"}</td>
        <td>${log.userId || "-"}</td>
        <td>${log.role || "-"}</td>
        <td>${log.action || "-"}</td>
        <td>${log.source || "-"}</td>
        <td>${log.time ? new Date(log.time).toLocaleString() : "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("logTable").innerHTML = html;
}

function clearLogs() {
  if (!isSystemSafe()) return;

  if (!confirm("Clear all logs?")) return;

  if (typeof clearActivityLogs !== "function") {
    alert("Clear log system unavailable");
    return;
  }

  clearActivityLogs(currentUser.userId);

  if (typeof logActivity === "function") {
    logActivity(
      currentUser.userId,
      currentUser.role,
      "Cleared Activity Logs",
      "ADMIN"
    );
  }

  loadLogs();
}

function loadCritical() {
  if (!isSystemSafe()) return;

if (typeof getCriticalLogs !== "function") {
  document.getElementById("criticalTable").innerHTML =
    "Critical log system unavailable";
  return;
}

const logs = getCriticalLogs();

const safeLogs =
  Array.isArray(logs)
    ? logs
    : [];

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

 if (!safeLogs.length) {
    html += `<tr><td colspan="5">No Critical Logs</td></tr>`;
  }

 safeLogs.slice().reverse().forEach(function (log) {
    html += `
      <tr>
        <td>${log.id || "-"}</td>
        <td>${log.userId || "-"}</td>
        <td>${log.message || "-"}</td>
        <td>${log.source || "-"}</td>
        <td>${log.time ? new Date(log.time).toLocaleString() : "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("criticalTable").innerHTML = html;
}
