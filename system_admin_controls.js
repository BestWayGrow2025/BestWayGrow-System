"use strict";

let session = null;
let currentUser = null;
let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  try {
    initPage();
    authPage();

    if (!currentUser?.userId) return;

    bindEvents();
    loadPage();

  } catch (err) {
    console.error("[SYSTEM ADMIN ERROR]", err);
  }
});

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

  try {
    session = JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null");
  } catch (e) {
    session = null;
  }

  if (!session?.userId) {
    window.location.href = "system_admin_login.html";
    return;
  }

  if (typeof protectPage === "function") {
    currentUser = protectPage({ role: "system_admin" });
  }

  if (!currentUser?.userId || currentUser.role !== "system_admin") {
    localStorage.removeItem("loggedInSystemAdmin");
    window.location.href = "system_admin_login.html";
    return;
  }
}

// ================= EVENTS =================
function bindEvents() {

  const backBtn = document.getElementById("backBtn");
  const toggleWithdrawBtn = document.getElementById("toggleWithdrawBtn");
  const toggleRegisterBtn = document.getElementById("toggleRegisterBtn");
  const clearLogsBtn = document.getElementById("clearLogsBtn");

  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }

  if (toggleWithdrawBtn) {
    toggleWithdrawBtn.addEventListener("click", toggleWithdrawSystem);
  }

  if (toggleRegisterBtn) {
    toggleRegisterBtn.addEventListener("click", toggleRegisterSystem);
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener("click", clearLogs);
  }
}

// ================= LOAD =================
function loadPage() {
  loadSystemStatus();
  loadAdmins();
}

// ================= NAV =================
function goBack() {
  window.location.href = "system_admin_dashboard.html";
}

// ================= SYSTEM STATUS =================
function loadSystemStatus() {

  const settings = typeof getSystemSettings === "function"
    ? getSystemSettings()
    : {};

  const el = document.getElementById("systemStatus");
  if (!el) return;

  el.innerHTML = `
    Withdraw System: ${settings.withdrawOpen ? "RUNNING 🟢" : "STOPPED 🔴"}<br>
    Registration System: ${settings.registrationOpen ? "RUNNING 🟢" : "STOPPED 🔴"}
  `;
}

// ================= ADMINS =================
function loadAdmins() {

  const users = typeof getUsers === "function" ? getUsers() : [];
  const admins = users.filter(u => u.role === "admin");

  const table = document.getElementById("adminTable");
  if (!table) return;

  if (!admins.length) {
    table.innerHTML = "<tr><td colspan='7'>No admins found</td></tr>";
    return;
  }

  table.innerHTML = admins.map(u => `
    <tr>
      <td>${u.userId || "-"}</td>
      <td>${u.username || "-"}</td>
      <td>${u.role || "-"}</td>
      <td>${u.adminType || "-"}</td>
      <td>${u.tree || "-"}</td>
      <td>${u.status || "active"}</td>
      <td>
        <button onclick="toggleAdminStatus('${u.userId}')" class="warn">
          Toggle
        </button>
      </td>
    </tr>
  `).join("");
}

// ================= TOGGLES =================
function toggleWithdrawSystem() {

  if (lock) return;
  lock = true;

  try {

    const settings = typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

    settings.withdrawOpen = !settings.withdrawOpen;

    if (typeof saveSystemSettings === "function") {
      saveSystemSettings(settings);
    }

    logAction("Toggled withdraw system");
    loadSystemStatus();

  } finally {
    lock = false;
  }
}

function toggleRegisterSystem() {

  if (lock) return;
  lock = true;

  try {

    const settings = typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

    settings.registrationOpen = !settings.registrationOpen;

    if (typeof saveSystemSettings === "function") {
      saveSystemSettings(settings);
    }

    logAction("Toggled registration system");
    loadSystemStatus();

  } finally {
    lock = false;
  }
}

// ================= ADMIN STATUS =================
function toggleAdminStatus(userId) {

  if (lock) return;
  lock = true;

  try {

    const users = typeof getUsers === "function" ? getUsers() : [];
    const user = users.find(u => u.userId === userId);

    if (!user) return;

    user.status = user.status === "inactive" ? "active" : "inactive";

    if (typeof saveUsers === "function") {
      saveUsers(users);
    }

    logAction("Changed admin status: " + userId);
    loadAdmins();

  } finally {
    lock = false;
  }
}

// ================= CLEAR LOGS =================
function clearLogs() {

  if (!confirm("Clear all activity logs?")) return;

  localStorage.removeItem("activityLogs");

  logAction("Cleared activity logs");
  alert("Logs cleared");
}

// ================= LOGGING =================
function logAction(action) {
  if (typeof logActivity === "function" && currentUser?.userId) {
    logActivity(currentUser.userId, "SYSTEM_ADMIN", action);
  }
}
