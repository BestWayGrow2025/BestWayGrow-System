/*
========================================
ADMIN DASHBOARD V2.0 (UNIFIED SESSION FINAL)
========================================
✔ UI unchanged
✔ Engine untouched
✔ Flow controller integrated
✔ Route guard compatible
✔ Unified session_manager.js
✔ No legacy localStorage usage
✔ Safe logoutSession() integration
✔ Production LOCKED
========================================
*/

"use strict";

let adminUser = null;
let clickLock = false;
let queueBtnLock = false;
let currentPage = 1;
const perPage = 10;
let userSortType = "";
let dashboardAutoRefresh = null;

// ================= INIT =================
window.addEventListener("load", function () {
  bootAdminDashboard();
});

// ================= BOOT =================
function bootAdminDashboard() {

  // 🔐 ROUTE GUARD
  if (typeof requireAuth === "function") {
    const ok = requireAuth(["admin"]);
    if (ok === false) return;
  }

  // 🔧 CORE SYSTEM
  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js missing");
    return;
  }

  initCoreSystem();

  // 🔐 SESSION CHECK
  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || !session.userId || session.role !== "admin") {
    alert("Login Required");
    window.location.replace("admin_login.html");
    return;
  }

  // 👤 CURRENT ADMIN USER
  adminUser =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : (
          typeof getUserById === "function"
            ? getUserById(session.userId)
            : null
        );

  if (!adminUser || adminUser.role !== "admin") {

    if (typeof logoutSession === "function") {
      logoutSession();
    } else if (typeof destroySession === "function") {
      destroySession();
    }

    alert("Access Denied");
    window.location.replace("admin_login.html");
    return;
  }

  // 🔒 ACTIVE STATUS CHECK
  if (
    (adminUser.accountStatus ||
      adminUser.status ||
      "active") !== "active"
  ) {
    alert("Admin inactive");
    logout();
    return;
  }

  // ⚙️ OPTIONAL FLOW CONTROLLER CHECK
  if (typeof executePinFlow !== "function") {
    console.warn("Flow controller missing — fallback mode active");
  }

  // 🚀 LOAD DASHBOARD
  loadAdminDashboardPage();
}

// ================= PAGE LOAD =================
function loadAdminDashboardPage() {

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (adminUser.username || adminUser.userId) +
      " (" +
      adminUser.userId +
      ")";
  }

  const firstBtn = document.querySelector(".menu button");

  if (firstBtn) {
    firstBtn.classList.add("active");
  }

  loadHome();

  // 🔄 AUTO REFRESH
  dashboardAutoRefresh = setInterval(function () {

    const currentBtn =
      document.querySelector(".menu button.active");

    if (!currentBtn) return;

    const tab = currentBtn.innerText.trim();

    if (tab === "System" && typeof loadSystem === "function") {
      loadSystem();
    }

    if (tab === "Users" && typeof renderUsers === "function") {
      renderUsers(currentPage);
    }

    if (tab === "PIN" && typeof renderPins === "function") {
      renderPins();
    }

    if (
      tab === "Income" &&
      typeof renderIncomeLogs === "function"
    ) {
      renderIncomeLogs();
    }

  }, 5000);
}

// ================= SAFE CLICK =================
function safeClick(btn, fn) {

  if (clickLock) return;

  clickLock = true;

  document
    .querySelectorAll(".menu button")
    .forEach(function (b) {
      b.classList.remove("active");
    });

  if (btn) {
    btn.classList.add("active");
  }

  try {
    fn();
  } catch (err) {
    console.error(err);

    const main =
      document.getElementById("mainContent");

    if (main) {
      main.innerHTML =
        `<p class="warn">Section failed to load</p>`;
    }
  }

  setTimeout(function () {
    clickLock = false;
  }, 300);
}

// ================= HOME =================
function loadHome() {

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  let allUsers =
    users.filter(u => u.role === "user");

  let activeUsers =
    allUsers.filter(
      u =>
        (u.accountStatus || "active") === "active"
    );

  let blockedUsers =
    allUsers.filter(
      u =>
        (u.accountStatus || "active") !== "active"
    );

  let totalWallet =
    allUsers.reduce(
      (sum, u) =>
        sum + Number(u.walletBalance || 0),
      0
    );

  main.innerHTML = `
    <h3>Dashboard Overview</h3>

    <div class="grid">
      <div class="miniCard"><h4>Total Users</h4><p>${allUsers.length}</p></div>
      <div class="miniCard"><h4>Active Users</h4><p>${activeUsers.length}</p></div>
      <div class="miniCard"><h4>Blocked Users</h4><p>${blockedUsers.length}</p></div>
      <div class="miniCard"><h4>Total Wallet</h4><p>₹${totalWallet.toFixed(2)}</p></div>
    </div>

    <br>

    <p><b>Name:</b> ${adminUser.username || "Admin"}</p>
    <p><b>User ID:</b> ${adminUser.userId}</p>
    <p><b>Role:</b> ${adminUser.role}</p>
    <p><b>Status:</b> ${adminUser.accountStatus || adminUser.status || "active"}</p>
  `;
}

// ================= USERS =================
function loadUsers() {

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  main.innerHTML = `
    <h3>User List</h3>
    <input
      type="text"
      id="userSearch"
      placeholder="Search User ID / Name"
      onkeyup="filterUsers()"
      style="padding:10px;width:100%;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;"
    >
    <table>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Wallet</th>
        <th>Status</th>
      </tr>
      <tbody id="userTableBody"></tbody>
    </table>
  `;

  renderUsers(1);
}

function renderUsers(page = 1) {

  currentPage = page;

  const body =
    document.getElementById("userTableBody");

  if (!body) return;

  let users =
    (
      typeof getUsers === "function"
        ? getUsers()
        : []
    ).filter(u => u.role === "user");

  body.innerHTML = users.map(u => `
    <tr>
      <td>${u.userId}</td>
      <td>${u.fullName || u.username || "-"}</td>
      <td>₹${Number(u.walletBalance || 0).toFixed(2)}</td>
      <td>${u.accountStatus || "active"}</td>
    </tr>
  `).join("");
}

// ================= PIN =================
function loadPinsUI() {

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  main.innerHTML = `
    <h3>PIN Control</h3>
    <table>
      <tr>
        <th>PIN ID</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
      <tbody id="pinTableBody"></tbody>
    </table>
  `;

  renderPins();
}

function renderPins() {

  const body =
    document.getElementById("pinTableBody");

  if (!body) return;

  let pins =
    typeof loadPins === "function"
      ? loadPins()
      : [];

  body.innerHTML = pins.map(p => `
    <tr>
      <td>${p.pinId}</td>
      <td>${p.type}</td>
      <td>${p.status}</td>
    </tr>
  `).join("");
}

// ================= WALLET =================
function loadWallet() {

  const main =
    document.getElementById("mainContent");

  if (main) {
    main.innerHTML = `<h3>Wallet Module</h3>`;
  }
}

// ================= SYSTEM =================
function loadSystem() {

  const main =
    document.getElementById("mainContent");

  if (main) {
    main.innerHTML = `<h3>System Module</h3>`;
  }
}

// ================= LOGOUT =================
function logout() {

  // Stop auto refresh
  if (dashboardAutoRefresh) {
    clearInterval(dashboardAutoRefresh);
    dashboardAutoRefresh = null;
  }

  // Unified session logout
  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.replace("admin_login.html");
}

// ================= EXPORT =================
window.safeClick = safeClick;
window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.renderUsers = renderUsers;
window.loadPinsUI = loadPinsUI;
window.renderPins = renderPins;
window.loadWallet = loadWallet;
window.loadSystem = loadSystem;
window.logout = logout;
