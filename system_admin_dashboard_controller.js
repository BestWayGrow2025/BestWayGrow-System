"use strict";

(function () {

/*
========================================
SYSTEM ADMIN DASHBOARD vFINAL SINGLE PATH
...
*/

console.log("[SYSTEM ADMIN DASHBOARD] INIT");

// ================= GLOBAL STATE =================
let currentUser = null;
let clickLock = false;
let menuBound = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

  initPage();
  authPage();

  if (!currentUser || !currentUser.userId) return;

  bindEvents();
  loadHome();
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

  if (!session || session.role !== "system_admin") {
    redirectLogin();
    return;
  }

  if (typeof getUserById !== "function") {
    redirectLogin();
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "system_admin") {
    redirectLogin();
    return;
  }

  if ((currentUser.status || "active") !== "active") {
    redirectLogin();
    return;
  }

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (currentUser.username || currentUser.userId) +
      " (" + currentUser.userId + ")";
  }
}

// ================= REDIRECT =================
function redirectLogin() {

  if (typeof logoutSession === "function") {

    logoutSession();

  } else if (typeof destroySession === "function") {

    destroySession();

  } else {

    localStorage.removeItem("APP_SESSION");

  }

  window.location.href = "system_admin_auth.html";
}

// ================= EVENTS =================
function bindEvents() {

  if (menuBound) return;
  menuBound = true;

  const logoutBtn = document.getElementById("logoutBtn");
  const buttons = document.querySelectorAll(".menu button");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  buttons.forEach(btn => {

    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", function () {

      if (clickLock) return;
      clickLock = true;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const page = btn.dataset.page;

      try {
        switch (page) {

          case "home":
            loadHome();
            break;

          case "users":
            loadUsers();
            break;

          case "create":
            loadCreateAdmin();
            break;

          case "pinmaster":
            loadPinsSafe();
            break;

          case "settings":
            loadSettings();
            break;
        }
      } catch (err) {
        console.error("[SYSTEM ADMIN DASHBOARD ERROR]", err);
      }

      setTimeout(() => {
        clickLock = false;
      }, 250);
    });
  });

  const homeBtn =
    document.querySelector('.menu button[data-page="home"]');

  if (homeBtn) {
    homeBtn.classList.add("active");
  }
}

// ================= HOME =================
function loadHome() {

  const users = getUsers?.() || [];

  const officeUsers =
    users.filter(u => u.tree === "office" && u.role === "user");

  const officeAdmins =
    users.filter(u => u.tree === "office" && u.role === "admin");

  const fieldUsers =
    users.filter(u => u.tree === "field" && u.role === "user");

  const fieldAdmins =
    users.filter(u => u.tree === "field" && u.role === "admin");

  const rootAdmin =
    users.filter(u => u.role === "admin" && u.adminType === "root_admin");

  const main = document.getElementById("mainContent");

  if (!main) return;

  main.innerHTML = `
    <h3>Dashboard Overview</h3>

    <div style="display:flex;flex-wrap:wrap;gap:15px;">

      <div style="flex:1;min-width:220px;">
        <h4>Office</h4>
        <p>Users: ${officeUsers.length}</p>
        <p>Admins: ${officeAdmins.length}</p>
      </div>

      <div style="flex:1;min-width:220px;">
        <h4>Field</h4>
        <p>Users: ${fieldUsers.length}</p>
        <p>Admins: ${fieldAdmins.length}</p>
        <p>Root Admin: ${rootAdmin.length}</p>
      </div>

    </div>
  `;
}

// ================= USERS =================
function loadUsers() {

  const users =
    (getUsers?.() || []).filter(u => !u.hiddenAccount);

  let html = `
    <h3>All Users</h3>
    <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Role</th>
        <th>Type</th>
        <th>Tree</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
  `;

  users.forEach(u => {

    html += `
      <tr>
        <td>${u.userId || "-"}</td>
        <td>${u.username || "-"}</td>
        <td>${u.role || "-"}</td>
        <td>${u.adminType || "-"}</td>
        <td>${u.tree || "-"}</td>
        <td>${u.status || "active"}</td>
        <td>Protected</td>
      </tr>
    `;
  });

  html += `</table>`;

  const main = document.getElementById("mainContent");

  if (main) main.innerHTML = html;
}

 // ================= CREATE ADMIN =================
function loadCreateAdmin() {
  window.open("system_admin_admin_creation_dashboard.html", "_blank");
}
  
// ================= PIN =================
function loadPinsSafe() {

  if (typeof loadPins === "function") {
    loadPins();
    return;
  }

  const main = document.getElementById("mainContent");

  if (main) {
    main.innerHTML =
      `<h3>PIN Management</h3>
       <p>PIN module not loaded.</p>`;
  }
}

// ================= SETTINGS =================
function loadSettings() {

  const main = document.getElementById("mainContent");

  if (main) {
    main.innerHTML =
      `<h3>System Settings</h3>
       <p>Settings module will be connected here.</p>`;
  }
}

// ================= LOGOUT =================
function logout() {
  redirectLogin();
}

// ================= EXPORTS =================
window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.loadCreateAdmin = loadCreateAdmin;
window.loadPinsSafe = loadPinsSafe;
window.loadSettings = loadSettings;
window.logout = logout;

window.SYSTEM_ADMIN_DASHBOARD = true;

})();
