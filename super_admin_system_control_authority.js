"use strict";

/*
========================================
SUPER ADMIN SYSTEM CONTROL AUTHORITY vFINAL SINGLE PATH
========================================
✔ One execution path (DOMContentLoaded only)
✔ One session source (getSession only)
✔ Core dependency only
✔ No fallback auth chains
✔ Safe toggle + admin control logic
✔ Production ready clean module
========================================
*/

console.log("[SUPER ADMIN SYSTEM CONTROL] INIT");

// ================= GLOBAL STATE =================
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
   console.error("[SUPER ADMIN SYSTEM CONTROL ERROR]", err);
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
function authPage() {

  const session = getSession?.();

  if (!session?.userId || session.role !== "super_admin") {
    window.location.href = "super_admin_auth.html";
    return;
  }

  currentUser = getUserById?.(session.userId);

  if (!currentUser?.userId || currentUser.role !== "super_admin") {
    window.location.href = "super_admin_auth.html";
    return;
  }

  if ((currentUser.status || "active") !== "active") {
    window.location.href = "super_admin_auth.html";
    return;
  }
}

// ================= EVENTS =================
function bindEvents() {

  const backBtn = document.getElementById("backBtn");
  const toggleWithdrawBtn = document.getElementById("toggleWithdrawBtn");
  const toggleRegisterBtn = document.getElementById("toggleRegisterBtn");
  const clearLogsBtn = document.getElementById("clearLogsBtn");

  if (backBtn) backBtn.addEventListener("click", goBack);
 if (toggleWithdrawBtn)
  toggleWithdrawBtn.addEventListener("click", toggleWithdrawSystem);
  if (toggleRegisterBtn) toggleRegisterBtn.addEventListener("click", toggleRegisterSystem);
  if (clearLogsBtn) clearLogsBtn.addEventListener("click", clearLogs);
}

// ================= LOAD =================
function loadPage() {
  loadSystemStatus();
  loadAdmins();
}

// ================= NAV =================
function goBack() {
  window.location.href = "super_admin_dashboard.html";
}

// ================= SYSTEM STATUS =================
function loadSystemStatus() {

  const settings = getSystemSettings?.() || {};
  const el = document.getElementById("systemStatus");

  if (!el) return;

  el.innerHTML = `
    Withdraw System: ${settings.withdrawOpen ? "RUNNING 🟢" : "STOPPED 🔴"}<br>
    Registration System: ${settings.registrationOpen ? "RUNNING 🟢" : "STOPPED 🔴"}
  `;
}

// ================= ADMINS =================
function loadAdmins() {

  const users = getUsers?.() || [];
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
    const settings = getSystemSettings?.() || {};
    settings.withdrawOpen = !settings.withdrawOpen;

    saveSystemSettings?.(settings);

    loadSystemStatus();

  } finally {
    lock = false;
  }
}

// ================= REGISTER TOGGLE =================
function toggleRegisterSystem() {

  if (lock) return;
  lock = true;

  try {
    const settings = getSystemSettings?.() || {};
    settings.registrationOpen = !settings.registrationOpen;

    saveSystemSettings?.(settings);

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
    const users = getUsers?.() || [];
    const user = users.find(u => u.userId === userId);

    if (!user) return;

    user.status = user.status === "inactive" ? "active" : "inactive";

    saveUsers?.(users);

    loadAdmins();

  } finally {
    lock = false;
  }
}

// ================= CLEAR LOGS =================
function clearLogs() {

  if (!confirm("Clear all activity logs?")) return;

  localStorage.removeItem("activityLogs");
  alert("Logs cleared");
}

// ================= LOGGING =================
function logAction(action) {

  if (typeof logActivity === "function" && currentUser?.userId) {
   logActivity(currentUser.userId, "SUPER_ADMIN", action);
  }
}
