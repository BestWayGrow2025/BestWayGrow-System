"use strict";

/*
========================================
ADMIN DASHBOARD V2.0 (UNIFIED + TREE INTEGRATION FIX)
========================================
✔ UI unchanged
✔ Engine untouched
✔ Flow controller integrated
✔ Route guard compatible
✔ Session safe
✔ TREE VIEW INTEGRATION ADDED
✔ FULL SYSTEM TREE SUPPORT ENABLED
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

  if (!session || !session.userId || session.role !== "admin") {
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

/* ================= TREE INTEGRATION (NEW FIX) ================= */

/**
 * ADMIN GLOBAL TREE VIEW (FULL SYSTEM)
 * This is now SAFE ENTRY POINT for all users tree
 */
function getAdminFullTree() {

  if (typeof getUsers !== "function") return [];

  const users = getUsers();

  return users.map(user => {

    if (typeof getUserTree === "function") {
      return getUserTree(user.userId);
    }

    return {
      userId: user.userId,
      left: user.leftChild || null,
      right: user.rightChild || null
    };
  });
}

/**
 * SUPER SIMPLE TREE DEBUG VIEW
 */
function showAdminTreeConsole() {

  const tree = getAdminFullTree();

  console.log("🔥 ADMIN FULL TREE SNAPSHOT:");
  console.log(tree);

  return tree;
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

    <button onclick="showAdminTreeConsole()">
      🔥 View Full Tree (Console Debug)
    </button>

    <p><b>Admin:</b> ${adminUser.username}</p>
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

window.safeClick = safeClick;
window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.renderUsers = renderUsers;
window.renderPins = renderPins;
window.loadPinsUI = loadPinsUI;
window.loadSystem = loadSystem;
window.logout = logout;
window.getAdminFullTree = getAdminFullTree;
window.showAdminTreeConsole = showAdminTreeConsole;
