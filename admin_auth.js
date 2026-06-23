/*
========================================
ADMIN LOGIN FINAL V2.0 (UNIFIED SESSION)
========================================
✔ Fully aligned with session_manager.js
✔ No legacy localStorage usage
✔ Strict admin role validation
✔ System settings validation
✔ Safe password decoding
✔ Single submit lock
✔ Auto redirect if already logged in
✔ Production LOCKED
========================================
*/

"use strict";

let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= INIT PAGE =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }
}

// ================= AUTH PAGE =================
function authPage() {
  // Login page only
}

/* ================= EVENTS ================= */

function bindEvents() {

  const btn =
    document.getElementById(
      "loginBtn"
    );

  // Prevent duplicate binding
  if (
    btn &&
    !btn.dataset.bound
  ) {

    btn.dataset.bound = "true";

    btn.addEventListener(
      "click",
      submitAdminLogin
    );
  }

  // Enter key support
  const password =
    document.getElementById(
      "password"
    );

  if (
    password &&
    !password.dataset.enterbound
  ) {

    password.dataset.enterbound =
      "true";

    password.addEventListener(
      "keypress",
      function (e) {

        if (e.key === "Enter") {
          submitAdminLogin();
        }
      }
    );
  }
}

// ================= LOAD PAGE =================
function loadPage() {
  // Auto redirect if already authenticated as admin
  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (session && session.userId && session.role === "admin") {
    window.location.replace("admin_dashboard.html");
  }
}

// ================= LOGIN =================
function submitAdminLogin() {

  if (lock) return;
  lock = true;

  lockBtn();

  const id = document
    .getElementById("adminId")
    .value
    .trim()
    .toLowerCase();

  const pass = document
    .getElementById("password")
    .value
    .trim();

  // ================= INPUT VALIDATION =================
  if (!id || !pass) {
    showMsg("⚠ Enter ID & Password");
    resetLogin();
    return;
  }

  // ================= CORE VALIDATION =================
  if (typeof getUsers !== "function") {
    alert("Core system not loaded");
    resetLogin();
    return;
  }

  // ================= USER SEARCH =================
  const users = getUsers() || [];

  const user = users.find(function (u) {
    const storedPass = safeDecode(u.password);

    return (
      String(u.userId || "").toLowerCase() === id &&
      String(u.role || "").toLowerCase() === "admin" &&
      storedPass === pass
    );
  });

  // ================= USER VALIDATION =================
  if (!user) {
    showMsg("❌ Invalid login");
    resetLogin();
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    resetLogin();
    return;
  }

  // ================= SYSTEM SETTINGS CHECK =================
  if (typeof getSystemSettings !== "function") {
    alert("System settings missing");
    resetLogin();
    return;
  }

  const settings = getSystemSettings() || {};

  if (settings.adminAccess === false) {
    showMsg("🚫 Admin access OFF");
    resetLogin();
    return;
  }

  if (settings.lockMode === true) {
    showMsg("🚫 System locked");
    resetLogin();
    return;
  }

  // ================= SESSION SYSTEM CHECK =================
  if (typeof setSession !== "function") {
    alert("Session system missing");
    resetLogin();
    return;
  }

  // ================= CREATE SESSION =================
  const success = setSession({
    userId: user.userId,
    role: user.role
  });

  if (!success) {
    showMsg("❌ Session creation failed");
    resetLogin();
    return;
  }

  // ================= ACTIVITY LOG =================
  if (typeof logActivity === "function") {
    try {
      logActivity(
        user.userId,
        "admin",
        "Login",
        "ADMIN"
      );
    } catch (e) {
      console.warn("Activity log failed");
    }
  }

  // ================= SUCCESS =================
  showMsg("✅ Login successful");

  setTimeout(function () {
    window.location.replace("admin_dashboard.html");
  }, 500);

  // Safety unlock (normally page redirects before this)
  setTimeout(function () {
    lock = false;
  }, 600);
}

// ================= SAFE DECODE =================
function safeDecode(value) {
  try {
    return atob(value || "");
  } catch {
    return value || "";
  }
}

// ================= BUTTON LOCK =================
function lockBtn() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Checking...";
  }
}

// ================= BUTTON UNLOCK =================
function unlockBtn() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = false;
    btn.innerText = "Login";
  }
}

// ================= RESET LOGIN =================
function resetLogin() {
  unlockBtn();
  lock = false;
}

// ================= MESSAGE =================
function showMsg(text) {
  const msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  } else {
    alert(text);
  }
}
