
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
  } else {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }
}

function authPage() {
  // login page only
}

function bindEvents() {
  let btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", submitAdminLogin);
  }
}

function loadPage() {
  let active = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (active && active.userId) {
    window.location.href = "admin_dashboard.html";
  }
}

function submitAdminLogin() {
  if (lock) return;

  lock = true;
  lockBtn();

  let id = document.getElementById("adminId").value.trim().toLowerCase();
  let pass = document.getElementById("password").value.trim();

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

  let users = getUsers() || [];

  let user = users.find(function (u) {
    let storedPass = safeDecode(u.password);

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

  let settings = getSystemSettings() || {};

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

  clearAdminSession();

  localStorage.setItem("loggedInAdmin", JSON.stringify({
    userId: user.userId,
    role: user.role
  }));

  if (!localStorage.getItem("loggedInAdmin")) {
    alert("Session failed");
    unlockBtn();
    lock = false;
    return;
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "admin", "Login", "ADMIN");
  }

  showMsg("✅ Login successful");

  setTimeout(function () {
    window.location.href = "admin_dashboard.html";
  }, 500);
}

function safeDecode(value) {
  try {
    return atob(value);
  } catch {
    return value || "";
  }
}

function lockBtn() {
  let btn = document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Checking...";
  }
}

function unlockBtn() {
  let btn = document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = false;
    btn.innerText = "Login";
  }
}

function clearAdminSession() {
  localStorage.removeItem("loggedInAdmin");
}

function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  }
}
