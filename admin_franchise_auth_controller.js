"use strict";

/*
========================================
ADMIN FRANCHISE AUTH CONTROLLER
========================================
*/

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
  // Core initialization is handled by
  // core_boot_manager.js and core_initializer.js.
  // No legacy initCoreSystem() call is required.
}

function authPage() {
  session = null;
  currentUser = null;
}

function bindEvents() {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
}

function loadPage() {
  const active = JSON.parse(
    localStorage.getItem("loggedInFranchise") || "null"
  );

  if (active && active.userId) {
    window.location.href = "admin_franchise_dashboard.html";
  }
}

function safeDecode(value) {
  try {
    return atob(value);
  } catch (err) {
    return value;
  }
}

function login() {
  if (lock) return;

  const msg = document.getElementById("msg");
  const userId = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!msg) return;

  msg.innerText = "";

  if (!userId || !password) {
    msg.innerText = "⚠ Enter ID & Password";
    return;
  }

  if (typeof getUsers !== "function") {
    msg.innerText = "❌ User system unavailable";
    return;
  }

  lock = true;

  try {
    const users = getUsers();

    const user = users.find(function (u) {
      return (
        String(u.userId || "").toLowerCase() === userId.toLowerCase() &&
        String(u.role || "").toLowerCase() === "franchise" &&
        (
          u.password === password ||
          safeDecode(u.password) === password
        )
      );
    });

    if (!user) {
      msg.innerText = "❌ Invalid Franchise Login";
      return;
    }

    if ((user.status || "active").toLowerCase() !== "active") {
      msg.innerText = "❌ Account inactive";
      return;
    }

    localStorage.setItem(
      "loggedInFranchise",
      JSON.stringify({
        userId: user.userId
      })
    );

    window.location.replace("admin_franchise_dashboard.html");

  } finally {
    lock = false;
  }
}
