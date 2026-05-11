"use strict";

/*
========================================
ADMIN DASHBOARD V2.0 (UNIFIED + TREE INTEGRATION FIXED)
========================================
✔ UI unchanged
✔ Engine untouched
✔ Session safe
✔ Route guard compatible
✔ TREE API INTEGRATED (FIXED)
✔ NO DEBUG CONSOLE TREE
✔ PRODUCTION READY STRUCTURE
========================================
*/

let adminUser = null;
let clickLock = false;
let queueBtnLock = false;
let currentPage = 1;
const perPage = 10;
let userSortType = "";
let dashboardAutoRefresh = null;

/* ================= INIT ================= */

window.addEventListener("load", function () {
  bootAdminDashboard();
});

/* ================= BOOT ================= */

function bootAdminDashboard() {

  if (typeof requireAuth === "function") {
    const ok = requireAuth(["admin"]);
    if (ok === false) return;
  }

  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js missing");
    return;
  }

  initCoreSystem();

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "admin") {
    alert("Login Required");
    window.location.replace("admin_login.html");
    return;
  }

  adminUser =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : (
          typeof getUserById === "function"
            ? getUserById(session.userId)
            : null
        );

  if (!adminUser || adminUser.role !== "admin") {
    logout();
    alert("Access Denied");
    window.location.replace("admin_login.html");
    return;
  }

  if ((adminUser.accountStatus || adminUser.status || "active") !== "active") {
    alert("Admin inactive");
    logout();
    return;
  }

  loadAdminDashboardPage();
}

/* ================= TREE INTEGRATION (FIXED PRODUCTION VERSION) ================= */

function getAdminFullTree() {

  // ✔ NOW USING CENTRAL TREE API (NO HEAVY LOOPING)
  if (typeof getAdminTreeView === "function") {
    return getAdminTreeView();
  }

  return [];
}

/* ================= PAGE LOAD ================= */

function loadAdminDashboardPage() {

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (adminUser.username || adminUser.userId) +
      " (" + adminUser.userId + ")";
  }

  loadHome();

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

  }, 5000);
}

/* ================= HOME ================= */

function loadHome() {

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  let users = typeof getUsers === "function" ? getUsers() : [];

  let allUsers = users.filter(u => u.role === "user");

  let totalWallet =
    allUsers.reduce((sum, u) => sum + Number(u.walletBalance || 0), 0);

  main.innerHTML = `
    <h3>Dashboard Overview</h3>

    <div class="grid">
      <div class="miniCard"><h4>Total Users</h4><p>${allUsers.length}</p></div>
      <div class="miniCard"><h4>Total Wallet</h4><p>₹${totalWallet.toFixed(2)}</p></div>
    </div>

    <br>

    <button onclick="openAdminTreeView()">
      🔥 View Full System Tree
    </button>

    <p><b>Admin:</b> ${adminUser.username}</p>
  `;
}

/* ================= NEW TREE UI (FIXED) ================= */

function openAdminTreeView() {

  const main = document.getElementById("mainContent");

  if (!main) return;

  if (typeof getAdminTreeView !== "function") {
    main.innerHTML = "<p>Tree API not available</p>";
    return;
  }

  const tree = getAdminTreeView();

  main.innerHTML = `
    <h3>Full System Tree</h3>
    <pre>${JSON.stringify(tree, null, 2)}</pre>
  `;
}

/* ================= USERS ================= */

function loadUsers() {

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  main.innerHTML = `
    <h3>User List</h3>
    <table>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Wallet</th>
      </tr>
      <tbody id="userTableBody"></tbody>
    </table>
  `;

  renderUsers(1);
}

function renderUsers() {

  const body =
    document.getElementById("userTableBody");

  if (!body) return;

  let users =
    typeof getUsers === "function" ? getUsers() : [];

  body.innerHTML = users.map(u => `
    <tr>
      <td>${u.userId}</td>
      <td>${u.username || "-"}</td>
      <td>₹${u.walletBalance || 0}</td>
    </tr>
  `).join("");
}

/* ================= PIN ================= */

function loadPinsUI() {

  const main =
    document.getElementById("mainContent");

  if (main) {
    main.innerHTML = `<h3>PIN Control</h3>`;
  }
}

function renderPins() {

  const body =
    document.getElementById("pinTableBody");

  if (!body) return;

  let pins =
    typeof loadPins === "function" ? loadPins() : [];

  body.innerHTML = pins.map(p => `
    <tr>
      <td>${p.pinId}</td>
      <td>${p.type}</td>
      <td>${p.status}</td>
    </tr>
  `).join("");
}

/* ================= LOGOUT ================= */

function logout() {

  if (dashboardAutoRefresh) {
    clearInterval(dashboardAutoRefresh);
  }

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.replace("admin_login.html");
}

/* ================= EXPORT ================= */

window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.renderUsers = renderUsers;
window.renderPins = renderPins;
window.loadPinsUI = loadPinsUI;
window.logout = logout;
window.openAdminTreeView = openAdminTreeView;
window.getAdminFullTree = getAdminFullTree;
