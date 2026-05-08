
/*
========================================
ADMIN LOGIN FINAL (UNIFIED SESSION)
========================================
✔ Fully aligned with session_manager.js
✔ No legacy storage usage
✔ Safe role validation preserved
✔ Production stable
========================================
*/

let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= INIT =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }
}

function authPage() {
  // login page only
}

// ================= EVENTS =================
function bindEvents() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", submitAdminLogin);
  }
}

// ================= LOAD PAGE =================
function loadPage() {
  // handled by route_guard / session_manager
}

// ================= LOGIN =================
function submitAdminLogin() {

  if (lock) return;
  lock = true;

  lockBtn();

  const id = document.getElementById("adminId").value.trim().toLowerCase();
  const pass = document.getElementById("password").value.trim();

  if (!id || !pass) {
    showMsg("⚠ Enter ID & Password");
    unlockBtn();
    lock = false;
    return;
  }

  if (typeof getUsers !== "function") {
    alert("Core system not loaded");
    unlockBtn();
    lock = false;
    return;
  }

  const users = getUsers() || [];

  const user = users.find(u => {
    const storedPass = safeDecode(u.password);

    return (
      String(u.userId || "").toLowerCase() === id &&
      u.role === "admin" &&
      storedPass === pass
    );
  });

  if (!user) {
    showMsg("❌ Invalid login");
    unlockBtn();
    lock = false;
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    unlockBtn();
    lock = false;
    return;
  }

  if (typeof getSystemSettings !== "function") {
    alert("System settings missing");
    unlockBtn();
    lock = false;
    return;
  }

  const settings = getSystemSettings() || {};

  if (settings.adminAccess === false) {
    showMsg("🚫 Admin access OFF");
    unlockBtn();
    lock = false;
    return;
  }

  if (settings.lockMode === true) {
    showMsg("🚫 System locked");
    unlockBtn();
    lock = false;
    return;
  }

  // ================= UNIFIED SESSION ONLY =================
  if (typeof setSession !== "function") {
    alert("Session system missing");
    unlockBtn();
    lock = false;
    return;
  }

  const now = Date.now();

  setSession({
    userId: user.userId,
    role: user.role,
    loginTime: now,
    lastActivity: now
  });

  if (typeof logActivity === "function") {
    try {
      logActivity(user.userId, "admin", "Login", "ADMIN");
    } catch (e) {
      console.warn("Activity log failed");
    }
  }

  showMsg("✅ Login successful");

  setTimeout(() => {
    window.location.href = "admin_dashboard.html";
  }, 500);

  setTimeout(() => {
    lock = false;
  }, 600);
}

// ================= HELPERS =================
function safeDecode(value) {
  try {
    return atob(value);
  } catch {
    return value || "";
  }
}

function lockBtn() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Checking...";
  }
}

function unlockBtn() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = false;
    btn.innerText = "Login";
  }
}

function showMsg(text) {
  const msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  }
}
