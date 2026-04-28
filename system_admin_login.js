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
    alert("core_system.js not loaded");
    throw new Error("STOP");
  }
}

function authPage() {
  // login page only
}

function bindEvents() {
  let btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", function () {
      safeClick(login);
    });
  }
}

function loadPage() {
  let active =
    JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null") ||
    JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null");

  if (active && active.userId) {
    window.location.href = "system_admin_dashboard.html";
  }
}

function safeClick(fn) {
  if (lock) return;

  lock = true;

  try {
    fn();
  } catch (err) {
    console.error(err);
  }

  setTimeout(function () {
    lock = false;
  }, 800);
}

function clearSessions() {
  localStorage.removeItem("loggedInSuperAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInFranchise");
  localStorage.removeItem("loggedInUser");
}

function safeDecode(value) {
  try {
    return atob(value);
  } catch {
    return value || "";
  }
}

function login() {
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showMsg("⚠️ Enter ID & Password");
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  let user = users.find(function (u) {
    return (
      String(u.userId || "") === userId &&
      u.role === "system_admin"
    );
  });

  if (!user) {
    showMsg("❌ Invalid ID");
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    return;
  }

  let storedPass = safeDecode(user.password);

  if (storedPass.trim() !== password) {
    showMsg("❌ Wrong Password");
    return;
  }

  if (typeof getSystemSettings !== "function") {
    showMsg("❌ System settings missing");
    return;
  }

  let settings = getSystemSettings() || {};

  if (settings.lockMode === true) {
    showMsg("🚫 System Locked");
    return;
  }

  if (settings.adminAccess === false) {
    showMsg("🚫 Admin Access OFF");
    return;
  }

  clearSessions();

  localStorage.setItem("loggedInSystemAdmin", JSON.stringify({
    userId: user.userId,
    role: user.role
  }));

  if (!localStorage.getItem("loggedInSystemAdmin")) {
    showMsg("❌ Session failed");
    return;
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "system_admin", "Login", "ADMIN");
  }

  showMsg("✅ Login successful");

  setTimeout(function () {
    window.location.href = "system_admin_dashboard.html";
  }, 700);
}

function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  }
}
