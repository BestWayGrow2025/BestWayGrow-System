"use strict";

console.count("SYSTEM CONTROL JS");

if (window.__SYSTEM_CONTROL_TEST__) {
  throw new Error("SECOND LOAD");
}

window.__SYSTEM_CONTROL_TEST__ = true;

/*
========================================
SUPER ADMIN SYSTEM CONTROL AUTHORITY
V1.0 FINAL
========================================
✔ Super Admin authentication
✔ Single execution path
✔ Single session source
✔ Safe system toggles
✔ Admin management
✔ Production Stable
========================================
*/

console.log("[SUPER ADMIN SYSTEM CONTROL] INIT");

// ================= GLOBAL =================

let currentUser = null;
let lock = false;

// ================= INIT =================

// Dynamic module loader calls initPage().
// DOMContentLoaded is not used here.

// ================= CORE =================

function initPage() {

  if (typeof initCoreSystem !== "function") {

    alert("initCoreSystem() not available");

    throw new Error("STOP");

  }

  initCoreSystem();

  authPage();

  if (!currentUser?.userId) return;

  bindEvents();

  loadPage();

}

// ================= AUTH =================

function authPage() {

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "super_admin") {

    window.location.href =
      "super_admin_auth.html";

    return;

  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;

  if (!currentUser) {

    window.location.href =
      "super_admin_auth.html";

    return;

  }

  if (currentUser.role !== "super_admin") {

    window.location.href =
      "super_admin_auth.html";

    return;

  }

  if ((currentUser.status || "active") !== "active") {

    window.location.href =
      "super_admin_auth.html";

    return;

  }

}

// ================= EVENTS =================

function bindEvents() {

  const backBtn =
    document.getElementById("backBtn");

  const toggleWithdrawBtn =
    document.getElementById("toggleWithdrawBtn");

  const toggleRegisterBtn =
    document.getElementById("toggleRegisterBtn");

  const clearLogsBtn =
    document.getElementById("clearLogsBtn");

  if (backBtn && !backBtn.dataset.bound) {

    backBtn.dataset.bound = "true";

    backBtn.onclick = goBack;

  }

  if (
    toggleWithdrawBtn &&
    !toggleWithdrawBtn.dataset.bound
  ) {

    toggleWithdrawBtn.dataset.bound = "true";

    toggleWithdrawBtn.onclick =
      toggleWithdrawSystem;

  }

  if (
    toggleRegisterBtn &&
    !toggleRegisterBtn.dataset.bound
  ) {

    toggleRegisterBtn.dataset.bound = "true";

    toggleRegisterBtn.onclick =
      toggleRegisterSystem;

  }

  if (
    clearLogsBtn &&
    !clearLogsBtn.dataset.bound
  ) {

    clearLogsBtn.dataset.bound = "true";

    clearLogsBtn.onclick = clearLogs;

  }

}

// ================= LOAD =================

function loadPage() {

  loadSystemStatus();

  loadAdmins();

}

// ================= BACK =================

function goBack() {

  window.location.href =
    "super_admin_dashboard.html";

}

// ================= STATUS =================

function loadSystemStatus() {

  const settings =
    typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

  const box =
    document.getElementById("systemStatus");

  if (!box) return;

  box.innerHTML = `
    Withdraw System :
    ${settings.withdrawOpen ? "RUNNING 🟢" : "STOPPED 🔴"}<br>

    Registration System :
    ${settings.registrationOpen ? "RUNNING 🟢" : "STOPPED 🔴"}
  `;

}

// ================= ADMINS =================

function loadAdmins() {

  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const admins =
    users.filter(function (u) {

      return u.role === "admin";

    });

  const table =
    document.getElementById("adminTable");

  if (!table) return;

  if (!admins.length) {

    table.innerHTML =
      "<tr><td colspan='7'>No admins found</td></tr>";

    return;

  }

  table.innerHTML = admins.map(function (u) {

    return `
      <tr>

        <td>${u.userId || "-"}</td>

        <td>${u.username || "-"}</td>

        <td>${u.role || "-"}</td>

        <td>${u.adminType || "-"}</td>

        <td>${u.tree || "-"}</td>

        <td>${u.status || "active"}</td>

        <td>

          <button
            onclick="toggleAdminStatus('${u.userId}')">

            Toggle

          </button>

        </td>

      </tr>
    `;

  }).join("");

}

// ================= WITHDRAW =================

function toggleWithdrawSystem() {

  if (lock) return;

  lock = true;

  try {

    const settings =
      getSystemSettings?.() || {};

    settings.withdrawOpen =
      !settings.withdrawOpen;

    saveSystemSettings?.(settings);

    loadSystemStatus();

    logAction("TOGGLE_WITHDRAW");

  }

  finally {

    lock = false;

  }

}

// ================= REGISTRATION =================

function toggleRegisterSystem() {

  if (lock) return;

  lock = true;

  try {

    const settings =
      getSystemSettings?.() || {};

    settings.registrationOpen =
      !settings.registrationOpen;

    saveSystemSettings?.(settings);

    loadSystemStatus();

    logAction("TOGGLE_REGISTRATION");

  }

  finally {

    lock = false;

  }

}

// ================= ADMIN STATUS =================

function toggleAdminStatus(userId) {

  if (lock) return;

  lock = true;

  try {

    const users =
      getUsers?.() || [];

    const user =
      users.find(function (u) {

        return u.userId === userId;

      });

    if (!user) return;

    user.status =
      user.status === "inactive"
      ? "active"
      : "inactive";

    saveUsers?.(users);

    loadAdmins();

    logAction(
      "TOGGLE_ADMIN_" + userId
    );

  }

  finally {

    lock = false;

  }

}

// ================= LOGS =================

function clearLogs() {

  if (
    !confirm("Clear all activity logs?")
  ) return;

  localStorage.removeItem(
    "activityLogs"
  );

  alert("Logs cleared.");

  logAction("CLEAR_ACTIVITY_LOGS");

}

// ================= LOG =================

function logAction(action) {

  if (
    typeof logActivity === "function" &&
    currentUser?.userId
  ) {

    logActivity(
      currentUser.userId,
      "SUPER_ADMIN",
      action
    );

  }

}

// ================= EXPORT =================

window.SuperAdminSystemControlAuthority = {

  init: initPage,

  reload: loadPage,

  toggleWithdraw:
    toggleWithdrawSystem,

  toggleRegistration:
    toggleRegisterSystem,

  toggleAdmin:
    toggleAdminStatus

};

// ================= GLOBAL EXPORTS =================

window.initPage =
  initPage;

window.toggleAdminStatus =
  toggleAdminStatus;

// ================= FLAG =================

window.__SUPER_ADMIN_SYSTEM_CONTROL_AUTHORITY__ =
  true;

console.log(
  "[SUPER ADMIN SYSTEM CONTROL] READY"
);
