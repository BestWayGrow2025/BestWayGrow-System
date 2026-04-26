let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadLogs();
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
  if (typeof protectPage === "function") {
    currentUser = protectPage({
      role: "admin",
      department: "report"
    });
  }

  if (!currentUser) {
    window.location.href = "admin_login.html";
    throw new Error("Access Blocked");
  }

  session = {
    userId: currentUser.userId,
    role: currentUser.role
  };
}

function bindEvents() {
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("refreshBtn").addEventListener("click", function () {
    loadLogs();
  });
  document.getElementById("applyBtn").addEventListener("click", applyFilter);
  document.getElementById("clearBtn").addEventListener("click", clearLogs);
}

function goBack() {
  window.location.href = "admin_dashboard.html";
}

function getRoleClass(role) {
  if (role === "ADMIN") return "admin";
  if (role === "SYSTEM") return "system";
  if (role === "ERROR") return "error";
  return "";
}

function loadLogs(customLogs = null) {
  let logs = customLogs || (
    typeof getActivityLogs === "function"
      ? getActivityLogs()
      : []
  );

  let container = document.getElementById("logs");

  if (!logs.length) {
    container.innerHTML = "No activity logs found";
    return;
  }

  let html = "";

  logs.slice().reverse().forEach(function (log) {
    html += `
      <div class="log ${getRoleClass(log.role)}">
        <b>${log.role || "-"}</b> (${log.userId || "-"}) → ${log.action || "-"}<br>
        <small>${log.time ? new Date(log.time).toLocaleString() : "-"}</small>
      </div>
    `;
  });

  container.innerHTML = html;

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "ADMIN", "Viewed activity logs");
  }
}

function applyFilter() {
  let userId = document.getElementById("filterUser").value.trim();
  let role = document.getElementById("filterRole").value;
  let keyword = document.getElementById("filterKeyword").value.trim();

  let logs = typeof filterLogsAdvanced === "function"
    ? filterLogsAdvanced({
        userId: userId,
        role: role,
        keyword: keyword
      })
    : [];

  loadLogs(logs);
}

function clearLogs() {
  if (!confirm("Delete all activity logs?")) return;

  if (typeof clearActivityLogs === "function") {
    clearActivityLogs();
  } else {
    localStorage.removeItem("activityLogs");
  }

  loadLogs();
  alert("Logs cleared");
}
