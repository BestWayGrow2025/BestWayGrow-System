"use strict";

/*
========================================
SUPER ADMIN DASHBOARD V3.0 FINAL
COMPLETE PRODUCTION DASHBOARD
========================================
✔ Single boot protection
✔ Route guard integration
✔ Session validation
✔ Proper destroySession() logout
✔ Super admin role enforcement
✔ Dashboard overview
✔ Create System Admin integration
✔ Users list
✔ System control with ON/OFF toggles
✔ Tree view with role filters
✔ Debug console
✔ Real reset functions
✔ Restart system
✔ Mobile-safe rendering
✔ Production READY
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
    document.addEventListener("DOMContentLoaded", bootSuperAdmin, {
      once: true
    });
  } else {
    bootSuperAdmin();
  }
})();

/* ================= BOOT ================= */

function bootSuperAdmin() {
  try {
    if (typeof requireAuth === "function") {
      const ok = requireAuth(["super_admin"]);
      if (ok === false) return;
    }

    const session =
      typeof getSession === "function"
        ? getSession()
        : null;

    if (!session || session.role !== "super_admin") {
      if (typeof destroySession === "function") {
        destroySession();
      }

      window.location.href = "super_admin_login.html";
      return;
    }

    initPage();

    if (!authPage()) {
      if (typeof destroySession === "function") {
        destroySession();
      }

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
    if (typeof destroySession === "function") {
      destroySession();
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

  document.querySelectorAll(".menu button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (clickLock) return;
      clickLock = true;

      setTimeout(function () {
        clickLock = false;
      }, 250);

      document.querySelectorAll(".menu button")
        .forEach(function (b) {
          b.classList.remove("active");
        });

      btn.classList.add("active");

      const page = btn.dataset.page;

      switch (page) {
        case "home":
          loadHome();
          break;

        case "create":
          if (typeof loadCreate === "function") {
            loadCreate();
          } else {
            loadCreateFallback();
          }
          break;

       case "users":
  loadUsers();
  break;

case "pins":
  if (typeof loadPins === "function") {
    loadPins();
  } else {
    const main = document.getElementById("mainContent");
    if (main) {
      main.innerHTML = `
        <h3>📌 PIN Management</h3>
        <p>PIN module not loaded.</p>
      `;
    }
  }
  break;

case "system":
  loadSystem();
  break;

        case "tree":
          loadTreeView("all");
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

  if (homeBtn) {
    homeBtn.classList.add("active");
  }
}

/* ================= HOME ================= */

function loadHome() {
  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const totalUsers =
    users.filter(function (u) {
      return u.role === "user";
    }).length;

  const admins =
    users.filter(function (u) {
      return u.role === "admin";
    }).length;

  const sysAdmins =
    users.filter(function (u) {
      return u.role === "system_admin";
    }).length;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
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

    <button onclick="loadTreeView('all')">🌳 View Full Tree</button>
  `;
}

/* ================= CREATE SYSTEM ADMIN ================= */

function loadCreateFallback() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>👑 Create System Admin</h3>
    <p>super_admin_create_system_admin.js not loaded.</p>
  `;
}

/* ================= USERS ================= */

function loadUsers() {
  const users =
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

  users.forEach(function (u) {
    html += `
      <tr>
        <td>${u.userId || ""}</td>
        <td>${u.username || ""}</td>
        <td>${u.role || ""}</td>
        <td>${u.status || "active"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  const main = document.getElementById("mainContent");
  if (main) {
    main.innerHTML = html;
  }
}

/* ================= SYSTEM CONTROL ================= */

function getSystemSettingsSafe() {
  if (typeof getSystemSettings === "function") {
    return getSystemSettings();
  }

  const saved =
    JSON.parse(localStorage.getItem("systemSettings") || "null");

  if (saved) return saved;

  return {
    registrationOpen: true,
    upgradesOpen: true,
    withdrawOpen: true
  };
}

function saveSystemSettingsSafe(settings) {
  if (typeof saveSystemSettings === "function") {
    saveSystemSettings(settings);
    return;
  }

  localStorage.setItem(
    "systemSettings",
    JSON.stringify(settings)
  );
}

function loadSystem() {
  const s = getSystemSettingsSafe();

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>⚙️ System Control</h3>

    <p>
      Registration:
      <b>${s.registrationOpen ? "ON" : "OFF"}</b>
      <button onclick="toggleSystemSetting('registrationOpen')">
        Toggle
      </button>
    </p>

    <p>
      Upgrade:
      <b>${s.upgradesOpen ? "ON" : "OFF"}</b>
      <button onclick="toggleSystemSetting('upgradesOpen')">
        Toggle
      </button>
    </p>

    <p>
      Withdraw:
      <b>${s.withdrawOpen ? "ON" : "OFF"}</b>
      <button onclick="toggleSystemSetting('withdrawOpen')">
        Toggle
      </button>
    </p>
  `;
}

function toggleSystemSetting(key) {
  const s = getSystemSettingsSafe();
  s[key] = !s[key];
  saveSystemSettingsSafe(s);
  loadSystem();
}

/* ================= TREE VIEW ================= */

function loadTreeView(filterRole) {
  const main = document.getElementById("mainContent");
  if (!main) return;

  filterRole = filterRole || "all";

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  users = users.filter(function (u) {
    return (
      u.role === "user" ||
      u.role === "admin" ||
      u.role === "system_admin"
    );
  });

  if (filterRole !== "all") {
    users = users.filter(function (u) {
      return u.role === filterRole;
    });
  }

  let html = `
    <h3>🌳 FULL SYSTEM TREE VIEW (SUPER ADMIN)</h3>

    <div style="margin-bottom:15px;">
      <button onclick="loadTreeView('system_admin')">👑 System Admin</button>
      <button onclick="loadTreeView('admin')">🛠 Admin</button>
      <button onclick="loadTreeView('user')">👤 User</button>
      <button onclick="loadTreeView('all')">🌐 All</button>
      <button onclick="showFullTreeConsole()">Debug Console</button>
    </div>

    <div>
  `;

  if (!users.length) {
    html += `<p>No records found.</p>`;
  }

  users.forEach(function (u) {
    html += `
      <div style="padding:10px;border:1px solid #ddd;margin:5px;border-radius:6px;">
        <b>${u.userId}</b> (${u.username || "No Name"})<br>
        Role: ${u.role || "-"}<br>
        L: ${u.leftChild || "-"} | R: ${u.rightChild || "-"}
      </div>
    `;
  });

  html += `</div>`;

  main.innerHTML = html;
}

/* ================= DEBUG ================= */

function showFullTreeConsole() {
  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  console.log("🌳 SUPER ADMIN TREE DUMP:");
  console.log(users);

  if (
    typeof getUserTree === "function" &&
    users.length > 0
  ) {
    console.log(
      "SAMPLE TREE:",
      getUserTree(users[0].userId)
    );
  }
}

/* ================= RESET PANEL ================= */

function loadResetPanel() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <h3>⚠️ System Reset</h3>

    <p>This will clear all stored data and restart the application.</p>

    <button onclick="resetUsers()">Reset Users</button>
    <button onclick="restartSystem()">Restart</button>
  `;
}

function resetUsers() {
  const ok = confirm(
    "WARNING: This will clear ALL localStorage data. Continue?"
  );

  if (!ok) return;

  localStorage.clear();

  alert("System data cleared successfully.");

  window.location.href = "super_admin_login.html";
}

function restartSystem() {
  alert("System Restarted");
  window.location.reload();
}

/* ================= LOGOUT ================= */

function logout() {
  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.href = "super_admin_login.html";
}

/* ================= EXPORT ================= */

window.loadHome = loadHome;
window.loadUsers = loadUsers;
window.loadPins = typeof loadPins === "function" ? loadPins : null;
window.loadSystem = loadSystem;
window.toggleSystemSetting = toggleSystemSetting;
window.loadTreeView = loadTreeView;
window.showFullTreeConsole = showFullTreeConsole;
window.loadResetPanel = loadResetPanel;
window.resetUsers = resetUsers;
window.restartSystem = restartSystem;
window.logout = logout;
