/*
========================================
SYSTEM ADMIN LOGIN FINAL (UNIFIED AUTH)
========================================
✔ Fully migrated to session_manager.js
✔ No legacy localStorage usage
✔ Safe role validation
✔ Stable redirect flow
✔ Production LOCKED
========================================
*/

"use strict";

let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
  loadPage();
});

// ================= INIT =================
function initPage() {
  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }

  initCoreSystem();
}

// ================= EVENTS =================
function bindEvents() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", login);
  }
}

// ================= AUTO REDIRECT =================
function loadPage() {
  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (session && session.role === "system_admin") {
    window.location.replace("system_admin_dashboard.html");
  }
}

// ================= LOGIN =================
function login() {

  if (lock) return;
  lock = true;

  const userId = document
    .getElementById("userId")
    .value
    .trim()
    .toUpperCase();

  const password = document
    .getElementById("password")
    .value
    .trim();

  if (!userId || !password) {
    showMsg("⚠️ Enter ID & Password");
    lock = false;
    return;
  }

  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const user = users.find(function (u) {
    return (
      String(u.userId || "").toUpperCase() === userId &&
      String(u.role || "") === "system_admin"
    );
  });

  if (!user) {
    showMsg("❌ Invalid ID");
    lock = false;
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    lock = false;
    return;
  }

  const storedPass = safeDecode(user.password || "");

  if (storedPass !== password) {
    showMsg("❌ Wrong Password");
    lock = false;
    return;
  }

  // ================= UNIFIED SESSION =================
  if (typeof setSession !== "function") {
    alert("Session system missing");
    lock = false;
    return;
  }

  const success = setSession({
    userId: user.userId,
    role: user.role
  });

  if (success !== true) {
    showMsg("❌ Session creation failed");
    lock = false;
    return;
  }

  // ================= ACTIVITY LOG =================
  if (typeof logActivity === "function") {
    try {
      logActivity(
        user.userId,
        "system_admin",
        "Login",
        "ADMIN"
      );
    } catch (e) {
      console.warn("Activity log failed");
    }
  }

  showMsg("✅ Login successful");

  setTimeout(function () {
    window.location.replace(
      "system_admin_dashboard.html"
    );
  }, 400);

  setTimeout(function () {
    lock = false;
  }, 600);
}

// ================= MESSAGE =================
function showMsg(msg) {
  const el = document.getElementById("msg");

  if (el) {
    el.innerText = msg;
  }
}

// ================= SAFE DECODE =================
function safeDecode(val) {
  try {
    return atob(val || "");
  } catch {
    return val || "";
  }
}
