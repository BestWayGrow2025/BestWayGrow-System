let session = null;
let currentUser = null;
let lock = false;

/* ================= SYSTEM BOOT ENTRY ================= */
SYSTEM_EVENTS.on("SYSTEM_READY", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

/* ================= INIT ================= */
function initPage() {
  setTimeout(() => {
    if (typeof initCoreSystem === "function") {
      initCoreSystem();
    } else {
      console.error("Core system not loaded");
    }
  }, 0);
}

/* ================= AUTH ================= */
function authPage() {
  try {
    session = typeof getSession === "function" ? getSession() : null;
  } catch (e) {
    session = null;
  }

  currentUser = session;
}

/* ================= EVENTS ================= */
function bindEvents() {
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "logoutBtn") {
      handleLogout();
    }
  });
}

/* ================= PAGE LOAD ================= */
function loadPage() {
  loadSystemStatus();
  loadLoginArea();
}

/* ================= SYSTEM STATUS ================= */
function loadSystemStatus() {
  const box = document.getElementById("systemStatus");
  if (!box) return;

  try {
    const settings =
      typeof getSystemSettings === "function"
        ? getSystemSettings() || {}
        : {};

    const lockStatus = settings.lockMode ? "🔴 LOCKED" : "🟢 ACTIVE";
    const regStatus = settings.registrationOpen === false ? "OFF" : "ON";
    const upStatus = settings.upgradesOpen === false ? "OFF" : "ON";
    const repStatus = settings.repurchaseOpen === false ? "OFF" : "ON";

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

/* ================= LOGIN AREA ================= */
function loadLoginArea() {
  const loginArea = document.getElementById("loginArea");
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
    if (session.role === "user" && typeof getUserById === "function") {
      const user = getUserById(session.userId);
      if (user) displayName = user.username || user.userId;
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

/* ================= LOGOUT ================= */
function handleLogout() {
  if (lock) return;
  lock = true;

  try {
    if (typeof logoutSession === "function") {
      logoutSession();
    } else if (typeof clearSession === "function") {
      clearSession();
    }

    window.location.reload();
  } catch (e) {
    lock = false;
    console.error("Logout failed:", e);
  }
}
