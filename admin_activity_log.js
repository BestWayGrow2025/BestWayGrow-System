"use strict";

let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initActivityLogPage();
});

// ================= INIT =================
function initActivityLogPage() {
  try {
    initPage();
    authPage();

    if (!currentUser?.userId) return;

    bindEvents();
    loadLogs();

  } catch (err) {
    console.error("[ACTIVITY LOG INIT ERROR]", err);
  }
}

// ================= CORE INIT =================
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
  if (typeof protectPage === "function") {
    currentUser = protectPage({
      role: "admin",
      department: "report"
    });
  }

  if (!currentUser) {
    window.location.href = "admin_login.html";
    return;
  }

  session = {
    userId: currentUser.userId || "UNKNOWN",
    role: currentUser.role || "admin"
  };
}

// ================= EVENTS =================
function bindEvents() {
  const backBtn = document.getElementById("backBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const applyBtn = document.getElementById("applyBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadLogs);
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", applyFilter);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearLogs);
  }
}

// ================= NAV =================
function goBack() {
  window.location.href = "admin_dashboard.html";
}

// ================= ROLE UI =================
function getRoleClass(role) {
  if (role === "ADMIN") return "admin";
  if (role === "SYSTEM") return "system";
  if (role === "ERROR") return "error";
  return "";
}

// ================= LOAD LOGS =================
function loadLogs(customLogs = null) {

  const container = document.getElementById("logs");
  if (!container) return;

  const logs = customLogs || (
    typeof getActivityLogs === "function"
      ? getActivityLogs()
      : []
  );

  if (!logs.length) {
    container.innerHTML = "No activity logs found";
    return;
  }

  let html = "";

  logs.slice().reverse().forEach(function (log) {
    html += `
      <div class="log ${getRoleClass(log.role)}">
        <b>${log.role || "-"}</b>
        (${log.userId || "-"}) → ${log.action || "-"}<br>
        <small>${
          log.time ? new Date(log.time).toLocaleString() : "-"
        }</small>
      </div>
    `;
  });

  container.innerHTML = html;

  if (typeof logActivity === "function" && currentUser?.userId) {
    logActivity(currentUser.userId, "ADMIN", "Viewed activity logs");
  }
}

// ================= FILTER =================
function applyFilter() {

  const userId = document.getElementById("filterUser")?.value?.trim() || "";
  const role = document.getElementById("filterRole")?.value || "";
  const keyword = document.getElementById("filterKeyword")?.value?.trim() || "";

  const logs = typeof filterLogsAdvanced === "function"
    ? filterLogsAdvanced({ userId, role, keyword })
    : [];

  loadLogs(logs);
}

// ================= CLEAR =================
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
