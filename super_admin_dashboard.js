"use strict";

/*
========================================
SUPER ADMIN DASHBOARD
STABLE FINAL EXECUTION VERSION + TREE INTEGRATION FIXED
ONE AUTH ENGINE ONLY
========================================
*/

let currentUser = null;
let clickLock = false;
let menuBound = false;

/* ================= SAFE BOOT ================= */

(function () {

  if (window.__SUPER_ADMIN_RUNNING__) {
    console.warn("Super Admin Dashboard already initialized");
    return;
  }

  window.__SUPER_ADMIN_RUNNING__ = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSuperAdmin, { once: true });
  } else {
    bootSuperAdmin();
  }

})();

/* ================= BOOT ================= */

function bootSuperAdmin() {

  try {

    if (typeof requireAuth === "function") {
      requireAuth(["super_admin"]);
    }

    const session = typeof getSession === "function" ? getSession() : null;

    if (!session || session.role !== "super_admin") {
      window.location.href = "super_admin_login.html";
      return;
    }

    initPage();

    if (!authPage()) {
      window.location.href = "super_admin_login.html";
      return;
    }

    bindEvents();
    loadHome();

  } catch (err) {

    console.error("BOOT ERROR:", err);

    const main = document.getElementById("mainContent");
    if (main) {
      main.innerHTML = `
        <h3>Dashboard Error</h3>
        <p>${err.message}</p>
      `;
    }
  }
}

/* ================= INIT ================= */

function initPage() {

  if (typeof initCoreSystem !== "function") {
    throw new Error("core_system.js missing");
  }

  if (!window.__CORE_INITIALIZED__) {
    initCoreSystem();
    window.__CORE_INITIALIZED__ = true;
  }
}

/* ================= AUTH ================= */

function authPage() {

  const session = typeof getSession === "function" ? getSession() : null;

  if (!session || session.role !== "super_admin") return false;

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : session;

  if (!currentUser) return false;

  if ((currentUser.status || "active") !== "active") {

    if (typeof clearSession === "function") {
      clearSession();
    }

    return false;
  }

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome SUPER ADMIN (" + currentUser.userId + ")";
  }

  return true;
}

/* ================= EVENTS ================= */

function bindEvents() {

  if (menuBound) return;
  menuBound = true;

  document.querySelectorAll(".menu button")
    .forEach(btn => {

      btn.addEventListener("click", function () {

        if (clickLock) return;
        clickLock = true;

        setTimeout(() => clickLock = false, 250);

        document.querySelectorAll(".menu button")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const page = btn.dataset.page;

        switch (page) {

          case "home":
            loadHome();
            break;

          case "create":
            loadCreate();
            break;

          case "users":
            loadUsers();
            break;

          case "system":
            loadSystem();
            break;

          case "tree":
            loadTreeView();
            break;

          case "reset":
            loadResetPanel();
            break;
        }
      });

    });

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.dataset.bound = "true";
    logoutBtn.addEventListener("click", logout);
  }

  const homeBtn =
    document.querySelector('.menu button[data-page="home"]');

  if (homeBtn) homeBtn.classList.add("active");
}

/* ================= HOME ================= */

function loadHome() {

  let users = typeof getUsers === "function" ? getUsers() : [];

  const totalUsers = users.filter(u => u.role === "user").length;
  const admins = users.filter(u => u.role === "admin").length;
  const sysAdmins = users.filter(u => u.role === "system_admin").length;

  document.getElementById("mainContent").innerHTML = `
    <h3>📊 Dashboard Overview</h3>

    <div style="display:flex;flex-wrap:wrap;gap:15px;margin-top:15px;">

      <div style="flex:1;min-width:220px;background:#4CAF50;color:#fff;padding:20px;border-radius:10px;">
        <h4>👤 Users</h4>
        <h2>${totalUsers}</h2>
      </div>

      <div style="flex:1;min-width:220px;background:#2196F3;color:#fff;padding:20px;border-radius:10px;">
        <h4>🛠 Admins</h4>
        <h2>${admins}</h2>
      </div>

      <div style="flex:1;min-width:220px;background:#ff9800;color:#fff;padding:20px;border-radius:10px;">
        <h4>👑 System Admins</h4>
        <h2>${sysAdmins}</h2>
      </div>

    </div>

    <br>

    <button onclick="loadTreeView()">🌳 View Full Tree</button>
  `;
}

/* ================= USERS ================= */

function loadUsers() {

  let users = typeof getUsers === "function" ? getUsers() : [];

  let html = `
    <h3>All Users</h3>
    <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
  `;

  users.forEach(u => {
    html += `
      <tr>
        <td>${u.userId}</td>
        <td>${u.username || ""}</td>
        <td>${u.role || ""}</td>
        <td>${u.status || "active"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("mainContent").innerHTML = html;
}

/* ================= SYSTEM ================= */

function loadSystem() {

  let s = typeof getSystemSettings === "function"
    ? getSystemSettings()
    : {};

  document.getElementById("mainContent").innerHTML = `
    <h3>⚙️ System Control</h3>
    <p>Registration: ${s.registrationOpen ? "ON" : "OFF"}</p>
    <p>Upgrade: ${s.upgradesOpen ? "ON" : "OFF"}</p>
    <p>Withdraw: ${s.withdrawOpen ? "ON" : "OFF"}</p>
  `;
}

/* ================= 🌳 TREE VIEW (FIXED - CLEAN LOGIC) ================= */

function loadTreeView() {

  const main = document.getElementById("mainContent");
  if (!main) return;

  const users = typeof getUsers === "function" ? getUsers() : [];

  if (!Array.isArray(users)) {
    main.innerHTML = "<p>Tree data not available</p>";
    return;
  }

  let html = `
    <h3>🌳 FULL SYSTEM TREE VIEW (SUPER ADMIN)</h3>
    <button onclick="showFullTreeConsole()">Debug Console</button>
    <div style="margin-top:20px;">
  `;

  users.forEach(u => {

    html += `
      <div style="padding:10px;border:1px solid #ddd;margin:5px;">
        <b>${u.userId}</b> (${u.username || "No Name"})<br>
        L: ${u.leftChild || "-"} | R: ${u.rightChild || "-"}
      </div>
    `;
  });

  html += "</div>";

  main.innerHTML = html;
}

/* ================= DEBUG ================= */

function showFullTreeConsole() {

  const users = typeof getUsers === "function" ? getUsers() : [];

  console.log("🌳 SUPER ADMIN TREE DUMP:");
  console.log(users);

  if (typeof getUserTree === "function" && users.length > 0) {
    console.log("SAMPLE TREE:", getUserTree(users[0].userId));
  }
}

/* ================= RESET ================= */

function loadResetPanel() {

  document.getElementById("mainContent").innerHTML = `
    <h3>⚠️ System Reset</h3>
    <button onclick="resetUsers()">Reset Users</button>
    <button onclick="restartSystem()">Restart</button>
  `;
}

function resetUsers() {
  alert("Reset blocked in safe mode");
}

function restartSystem() {
  alert("System Restarted");
}

/* ================= LOGOUT ================= */

function logout() {

  if (typeof clearSession === "function") {
    clearSession();
  }

  window.location.href = "super_admin_login.html";
}

/* ================= EXPORT ================= */

window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.loadSystem = loadSystem;
window.loadTreeView = loadTreeView;
window.showFullTreeConsole = showFullTreeConsole;
window.logout = logout;
