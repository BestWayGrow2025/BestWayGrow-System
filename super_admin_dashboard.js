/*
========================================
SUPER ADMIN DASHBOARD
STABLE FINAL EXECUTION VERSION
ONE AUTH ENGINE ONLY
========================================
*/

"use strict";

let currentUser = null;
let clickLock = false;
let menuBound = false;

// ================= SAFE BOOT =================
(function () {

  // prevent duplicate script execution
  if (window.__SUPER_ADMIN_RUNNING__) {
    console.warn("Super Admin Dashboard already initialized");
    return;
  }

  window.__SUPER_ADMIN_RUNNING__ = true;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      bootSuperAdmin,
      { once: true }
    );
  } else {
    bootSuperAdmin();
  }

})();

// ================= BOOT =================
function bootSuperAdmin() {

  try {

    initPage();

    if (!authPage()) {
      window.location.href = "super_admin_login.html";
      return;
    }

    bindEvents();

    loadHome();

  } catch (err) {

    console.error("BOOT ERROR:", err);

    document.getElementById("mainContent").innerHTML = `
      <h3>Dashboard Error</h3>
      <p>${err.message}</p>
    `;
  }
}

// ================= INIT =================
function initPage() {

  if (typeof initCoreSystem !== "function") {
    throw new Error("core_system.js missing");
  }

  // prevent repeated core init
  if (!window.__CORE_INITIALIZED__) {

    initCoreSystem();

    window.__CORE_INITIALIZED__ = true;
  }
}

// ================= AUTH =================
function authPage() {

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "super_admin") {
    return false;
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : session;

  if (!currentUser) {
    return false;
  }

  if ((currentUser.status || "active") !== "active") {

    if (typeof clearSession === "function") {
      clearSession();
    }

    return false;
  }

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome SUPER ADMIN (" +
      currentUser.userId +
      ")";
  }

  return true;
}

// ================= EVENTS =================
function bindEvents() {

  // prevent duplicate event binding
  if (menuBound) return;

  menuBound = true;

  document.querySelectorAll(".menu button")
    .forEach(btn => {

      btn.addEventListener("click", function () {

        if (clickLock) return;

        clickLock = true;

        setTimeout(() => {
          clickLock = false;
        }, 250);

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

          case "reset":
            loadResetPanel();
            break;
        }
      });

    });

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (logoutBtn && !logoutBtn.dataset.bound) {

    logoutBtn.dataset.bound = "true";

    logoutBtn.addEventListener("click", logout);
  }

  const homeBtn =
    document.querySelector('.menu button[data-page="home"]');

  if (homeBtn) {
    homeBtn.classList.add("active");
  }
}

// ================= HOME =================
function loadHome() {

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const totalUsers =
    users.filter(u => u.role === "user").length;

  const admins =
    users.filter(u => u.role === "admin").length;

  const sysAdmins =
    users.filter(u => u.role === "system_admin").length;

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
  `;
}

// ================= CREATE SYSTEM ADMIN =================
function loadCreate() {

  document.getElementById("mainContent").innerHTML = `
    <h3>Create System Admin</h3>

    <input id="id" placeholder="System Admin ID">

    <input id="name" placeholder="Name">

    <input id="pass" type="password" placeholder="Password">

    <button id="createSystemAdminBtn">
      Create
    </button>
  `;

  const btn =
    document.getElementById("createSystemAdminBtn");

  if (btn) {
    btn.addEventListener("click", createSystemAdmin);
  }
}

function createSystemAdmin() {

  const id =
    document.getElementById("id").value.trim();

  const name =
    document.getElementById("name").value.trim();

  const pass =
    document.getElementById("pass").value.trim();

  if (!id || !name || !pass) {
    return alert("Fill all fields");
  }

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  if (
    users.find(
      u => u.userId.toLowerCase() === id.toLowerCase()
    )
  ) {
    return alert("ID already exists");
  }

  users.push({
    userId: id,
    username: name,
    password: btoa(pass),
    role: "system_admin",
    status: "active",
    createdBy: currentUser.userId,
    createdAt: Date.now()
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("System Admin Created");

  loadUsers();
}

// ================= USERS =================
function loadUsers() {

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

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

// ================= SYSTEM =================
function loadSystem() {

  let s =
    typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

  document.getElementById("mainContent").innerHTML = `

    <h3>⚙️ System Control</h3>

    <table>

      <tr>
        <th>Control</th>
        <th>Status</th>
        <th>Action</th>
      </tr>

      ${systemRow("Registration", "registrationOpen", s.registrationOpen)}
      ${systemRow("Upgrade", "upgradesOpen", s.upgradesOpen)}
      ${systemRow("Repurchase", "repurchaseOpen", s.repurchaseOpen)}
      ${systemRow("Withdraw", "withdrawOpen", s.withdrawOpen)}
      ${systemRow("Admin Access", "adminAccess", s.adminAccess)}
      ${systemRow("Lock Mode", "lockMode", s.lockMode)}
      ${systemRow("PIN Creation", "pinCreateOpen", s.pinCreateOpen)}
      ${systemRow("Payout", "payoutOpen", s.payoutOpen)}
      ${systemRow("Income Calculation", "incomeOpen", s.incomeOpen)}
      ${systemRow("Auto Run", "autoRun", s.autoRun)}
      ${systemRow("Manual Run", "manualRun", s.manualRun)}

    </table>
  `;

  bindSystemButtons();
}

function systemRow(label, key, value) {

  return `
    <tr>

      <td>${label}</td>

      <td>
        ${value ? "🟢 ON" : "🔴 OFF"}
      </td>

      <td>
        <button
          class="${value ? "offBtn" : "onBtn"}"
          data-key="${key}"
        >
          ${value ? "OFF" : "ON"}
        </button>
      </td>

    </tr>
  `;
}

function bindSystemButtons() {

  document.querySelectorAll("[data-key]")
    .forEach(btn => {

      if (btn.dataset.bound) return;

      btn.dataset.bound = "true";

      btn.addEventListener("click", function () {

        const key = btn.dataset.key;

        toggleSystem(key);
      });

    });
}

function toggleSystem(key) {

  if (clickLock) return;

  clickLock = true;

  setTimeout(() => {
    clickLock = false;
  }, 300);

  let s =
    typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

  s[key] = !s[key];

  if (typeof saveSystemSettings === "function") {
    saveSystemSettings(s);
  }

  loadSystem();
}

// ================= RESET =================
function loadResetPanel() {

  document.getElementById("mainContent").innerHTML = `
    <h3>⚠️ System Reset</h3>

    <button id="deleteUsersBtn">
      Delete Users
    </button>

    <br><br>

    <button id="resetDataBtn">
      Reset User Data
    </button>

    <br><br>

    <button id="restartBtn">
      Restart System
    </button>
  `;

  document
    .getElementById("deleteUsersBtn")
    .addEventListener("click", resetUsers);

  document
    .getElementById("resetDataBtn")
    .addEventListener("click", resetUserData);

  document
    .getElementById("restartBtn")
    .addEventListener("click", restartSystem);
}

function resetUsers() {

  if (!confirm("Delete users?")) return;

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  users = users.filter(u =>
    [
      "BWG000000",
      "SUPERADMIN",
      "SYSTEM"
    ].includes(u.userId)
  );

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Users cleaned");

  loadHome();
}

function resetUserData() {

  if (!confirm("Reset data?")) return;

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  users.forEach(u => {

    if (u.role === "user") {

      u.wallet = {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      };
    }
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Data reset");

  loadHome();
}

function restartSystem() {

  alert("System Restarted");

  loadHome();
}

// ================= LOGOUT =================
function logout() {

  if (typeof clearSession === "function") {
    clearSession();
  }

  window.location.href =
    "super_admin_login.html";
}
