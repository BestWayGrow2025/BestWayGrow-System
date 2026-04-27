let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

function authPage() {
  try {
    if (typeof getSession === "function") {
      session = getSession();
    }
  } catch (e) {
    session = null;
  }

  currentUser = session;
}

function bindEvents() {
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "logoutBtn") {
      handleLogout();
    }
  });
}

function loadPage() {
  loadSystemStatus();
  loadLoginArea();
}

function loadSystemStatus() {
  let box = document.getElementById("systemStatus");

  if (!box) return;

  try {
    let settings = {};

    if (typeof getSystemSettings === "function") {
      settings = getSystemSettings() || {};
    }

    let lockStatus = settings.lockMode ? "🔴 LOCKED" : "🟢 ACTIVE";
    let regStatus = settings.registrationOpen === false ? "OFF" : "ON";
    let upStatus = settings.upgradesOpen === false ? "OFF" : "ON";
    let repStatus = settings.repurchaseOpen === false ? "OFF" : "ON";

    box.innerHTML = `
      <strong>System:</strong> ${lockStatus}<br>
      <strong>Registration:</strong> ${regStatus}<br>
      <strong>Upgrade:</strong> ${upStatus}<br>
      <strong>Repurchase:</strong> ${repStatus}
    `;
  } catch (err) {
    box.innerHTML = "⚠️ Unable to load system status";
  }
}

function loadLoginArea() {
  let loginArea = document.getElementById("loginArea");

  if (!loginArea) return;

  if (!session) {
    loginArea.innerHTML = `
      <a href="user_login.html">
        <button type="button">Login</button>
      </a>
    `;
    return;
  }

  let displayName = session.userId || "User";
  let dashboardLink = "user_dashboard.html";

  if (session.role === "admin") dashboardLink = "admin_dashboard.html";
  if (session.role === "system_admin") dashboardLink = "system_admin_dashboard.html";
  if (session.role === "super_admin") dashboardLink = "super_admin_dashboard.html";

  try {
    if (typeof getUserById === "function" && session.role === "user") {
      let user = getUserById(session.userId);
      if (user) {
        displayName = user.username || user.userId;
      }
    }
  } catch (e) {}

  loginArea.innerHTML = `
    <span style="margin-right:10px;">Welcome ${displayName}</span>
    <a href="${dashboardLink}">
      <button type="button" class="top-btn">Dashboard</button>
    </a>
    <button type="button" class="top-btn" id="logoutBtn">Logout</button>
  `;
}

function handleLogout() {
  if (lock) return;
  lock = true;

  try {
    if (typeof logoutSession === "function") {
      logoutSession();
      return;
    }

    if (typeof clearSession === "function") {
      clearSession();
    }

    window.location.reload();
  } catch (e) {
    lock = false;
    console.error("Logout failed:", e);
  }
}
