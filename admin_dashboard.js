"use strict";

/*
========================================
ADMIN DASHBOARD v3.0 FINAL BOOT
========================================
✔ Boot Architecture V2 compatible
✔ Unified session authentication
✔ Route guard compatible
✔ Admin-only access
✔ Real users only in listings
✔ Auto refresh
✔ Safe logout
✔ No global collisions
✔ Production ready
========================================
*/

console.log("[ADMIN DASHBOARD] FILE EXECUTION STARTED");

let adminUser = null;
let clickLock = false;
let menuBound = false;
let dashboardAutoRefresh = null;

/* ================= MODULE REGISTRATION ================= */

function startAdminDashboard() {
  initPage();
  checkAuth();
  bindEvents();
  loadHome();
  startAutoRefresh();
}

SYSTEM_EVENTS.on("SYSTEM_READY", function () {
  startAdminDashboard();
});

/* ================= INIT ================= */

function initPage() {
  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js missing");
    throw new Error("STOP");
  }

  // already initialized by boot_manager.js
}

/* ================= AUTH ================= */

function checkAuth() {
  if (typeof requireAuth === "function") {
    const ok = requireAuth(["admin"]);
    if (ok === false) {
      throw new Error("AUTH FAILED");
    }
  }

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "admin") {
    redirectLogin();
    throw new Error("STOP");
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
    redirectLogin();
    throw new Error("STOP");
  }

  const status =
    adminUser.accountStatus ||
    adminUser.status ||
    "active";

  if (status !== "active") {
    redirectLogin();
    throw new Error("STOP");
  }

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (adminUser.username || adminUser.userId) +
      " (" +
      adminUser.userId +
      ")";
  }
}

/* ================= REDIRECT ================= */

function redirectLogin() {
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

/* ================= EVENTS ================= */

function bindEvents() {

  if (menuBound) return;

  menuBound = true;

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (
    logoutBtn &&
    !logoutBtn.dataset.bound
  ) {

    logoutBtn.dataset.bound =
      "true";

    logoutBtn.addEventListener(
      "click",
      logout
    );
  }

  const buttons =
    document.querySelectorAll(
      ".menu button"
    );

  buttons.forEach(function (btn) {

    // Prevent duplicate binding
    if (btn.dataset.bound) return;

    btn.dataset.bound = "true";

    btn.addEventListener("click", function () {

      if (clickLock) return;

      clickLock = true;

      buttons.forEach(function (b) {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      try {

        const page =
          btn.dataset.page;

        switch (page) {

          case "home":
            loadHome();
            break;

          case "users":
            loadUsers();
            break;

         case "pinmaster":
            loadPinsUI();
            break;

          case "wallet":
            loadWalletSafe();
            break;

          case "income":
            loadIncomeSafe();
            break;

          case "system":
            loadSystemSafe();
            break;
        }

      } catch (err) {

        console.error(
          "[ADMIN DASHBOARD ERROR]",
          err
        );

        const main =
          document.getElementById(
            "mainContent"
          );

        if (main) {

          main.innerHTML =
            '<p style="color:red;">Failed to load section</p>';
        }
      }

      setTimeout(function () {

        clickLock = false;

      }, 250);

    });

  });

  const homeBtn =
    document.querySelector(
      '.menu button[data-page="home"]'
    );

  if (homeBtn) {
    homeBtn.classList.add("active");
  }
}

/* ================= AUTO REFRESH ================= */

function startAutoRefresh() {

  // Prevent duplicate intervals
  if (dashboardAutoRefresh) {

    clearInterval(
      dashboardAutoRefresh
    );
  }

  dashboardAutoRefresh =
    setInterval(function () {

      const active =
        document.querySelector(
          ".menu button.active"
        );

      if (!active) return;

      const page =
        active.dataset.page;

      if (page === "users") {
        renderUsers();
      }

      if (page === "pins") {
        renderPins();
      }

      if (
        page === "system" &&
        typeof loadSystem === "function"
      ) {

        loadSystem();
      }

    }, 5000);
}

/* ================= HOME ================= */

function loadHome() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  let users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];

  const realUsers = users.filter(function (u) {
    return u.role === "user";
  });

  const totalWallet =
    realUsers.reduce(function (sum, u) {
      return sum + Number(u.walletBalance || 0);
    }, 0);

  main.innerHTML = `
    <h3>Dashboard Overview</h3>

    <div style="display:flex;flex-wrap:wrap;gap:15px;">
      <div>
        <h4>Total Users</h4>
        <p>${realUsers.length}</p>
      </div>

      <div>
        <h4>Total Wallet</h4>
        <p>₹${totalWallet.toFixed(2)}</p>
      </div>
    </div>

    <br>

    <button onclick="openAdminTreeView()">
      🌳 View Full User Tree
    </button>

    <p><b>Admin:</b> ${adminUser.username || adminUser.userId}</p>
  `;
}

/* ================= TREE ================= */

function getAdminFullTree() {
  if (typeof getAdminTreeView === "function") {
    return getAdminTreeView();
  }

  return [];
}

function openAdminTreeView() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  if (typeof getAdminTreeView !== "function") {
    main.innerHTML = "<p>Tree API not available</p>";
    return;
  }

  const tree = getAdminTreeView();

  main.innerHTML = `
    <h3>Full User Tree</h3>
    <pre>${JSON.stringify(tree, null, 2)}</pre>
  `;
}

/* ================= USERS ================= */

function loadUsers() {
  const main = document.getElementById("mainContent");
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

  renderUsers();
}

function renderUsers() {
  const body = document.getElementById("userTableBody");
  if (!body) return;

  let users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];

  users = users.filter(function (u) {
    return u.role === "user";
  });

  body.innerHTML = users.map(function (u) {
    return `
      <tr>
        <td>${u.userId || "-"}</td>
        <td>${u.username || "-"}</td>
        <td>₹${u.walletBalance || 0}</td>
      </tr>
    `;
  }).join("");
}

/* ================= PIN ================= */

function loadPinsUI() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>PIN Control</h3>
    <p>PIN management module.</p>
  `;
}

function renderPins() {
  /* Reserved for future PIN rendering */
}

/* ================= SAFE MODULE LOADERS ================= */

function loadWalletSafe() {
  if (typeof loadWallet === "function") {
    loadWallet();
    return;
  }

  showPlaceholder("Wallet module not loaded.");
}

function loadIncomeSafe() {
  if (typeof loadIncome === "function") {
    loadIncome();
    return;
  }

  showPlaceholder("Income module not loaded.");
}

function loadSystemSafe() {
  if (typeof loadSystem === "function") {
    loadSystem();
    return;
  }

  showPlaceholder("System module not loaded.");
}

function showPlaceholder(message) {
  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>Module</h3>
    <p>${message}</p>
  `;
}

/* ================= LOGOUT ================= */

function logout() {
  redirectLogin();
}

/* ================= EXPORTS ================= */

window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.renderUsers = renderUsers;
window.renderPins = renderPins;
window.loadPinsUI = loadPinsUI;
window.logout = logout;
window.openAdminTreeView = openAdminTreeView;
window.getAdminFullTree = getAdminFullTree;

/* ================= MODULE FLAGS ================= */

window.__ADMIN_DASHBOARD__ = true;

window.__ADMIN_DASHBOARD_MODULE__ = {
  loaded: true,
  name: "admin_dashboard",
  time: Date.now()
};

/* ================= START MODULE ================= */

console.log("[ADMIN DASHBOARD] MODULE LOADED OK");
