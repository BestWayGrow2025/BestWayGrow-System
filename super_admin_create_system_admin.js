"use strict";

/*
========================================
SUPER ADMIN CREATE SYSTEM ADMIN v4.0
BOOT ARCHITECTURE V2 FINAL
========================================
✔ BOOT.register standard
✔ Dependency-safe startup
✔ Stable module flags
✔ Production ready
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

console.log("[SUPER ADMIN] FILE EXECUTION STARTED");

/* ================= INIT ================= */

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    console.error("[SUPER ADMIN] core_system.js missing");
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

/* ================= AUTH CHECK ================= */

function checkAuth() {
  session =
    typeof getSession === "function"
      ? getSession()
      : JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null");

  if (!session || !session.userId) {
    redirectLogin();
    throw new Error("STOP");
  }

  if (session.role && session.role !== "super_admin") {
    redirectLogin();
    throw new Error("STOP");
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;

  if (!currentUser || currentUser.role !== "super_admin") {
    redirectLogin();
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    redirectLogin();
    throw new Error("STOP");
  }
}

/* ================= REDIRECT ================= */

function redirectLogin() {
  if (typeof destroySession === "function") {
    destroySession();
  }

  localStorage.removeItem("loggedInSuperAdmin");
  window.location.href = "super_admin_login.html";
}

/* ================= EVENTS ================= */

function bindEvents() {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("#createBtn");
    if (!btn) return;

    safeClick(createSystemAdmin);
  });
}

/* ================= SAFE CLICK ================= */

function safeClick(fn) {
  if (lock) return;
  lock = true;

  try {
    fn();
  } catch (e) {
    console.error("[SUPER ADMIN ERROR]", e);
    showMsg("❌ System Error");
  }

  setTimeout(function () {
    lock = false;
  }, 300);
}

/* ================= MESSAGE ================= */

function showMsg(text) {
  const msg = document.getElementById("msg");
  if (msg) msg.innerText = text;
}

/* ================= PASSWORD ================= */

function encodePassword(p) {
  try {
    return btoa(p);
  } catch (e) {
    return p;
  }
}

/* ================= CREATE SYSTEM ADMIN ================= */

function createSystemAdmin() {
  const id = document.getElementById("sysId")?.value?.trim();
  const name = document.getElementById("sysName")?.value?.trim();
  const pass = document.getElementById("sysPass")?.value?.trim();

  if (!id || !name || !pass) {
    showMsg("❌ Fill all fields");
    return;
  }

  const users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];

  const exists = users.find(function (u) {
    return (u.userId || "").toLowerCase() === id.toLowerCase();
  });

  if (exists) {
    showMsg("⚠️ ID already exists");
    return;
  }

  const newAdmin = {
    userId: id,
    username: name,
    password: encodePassword(pass),
    role: "system_admin",
    status: "active",
    createdBy: currentUser?.userId || "SYSTEM",
    createdAt: Date.now()
  };

  users.push(newAdmin);

  if (typeof saveUsers === "function") {
    saveUsers(users);
  } else {
    localStorage.setItem("users", JSON.stringify(users));
  }

  showMsg("✅ System Admin Created Successfully");

  document.getElementById("sysId").value = "";
  document.getElementById("sysName").value = "";
  document.getElementById("sysPass").value = "";
}

/* ================= EXPORTS ================= */

window.createSystemAdmin = createSystemAdmin;
window.showMsg = showMsg;

/* ================= MODULE FLAGS ================= */

window.__SUPER_ADMIN_CREATE_SYSTEM_ADMIN__ = true;
window.super_admin_create_system_admin = true;

window.__SUPER_ADMIN_MODULE__ = {
  loaded: true,
  name: "super_admin_create_system_admin",
  time: Date.now()
};

console.log("[SUPER ADMIN CREATE SYSTEM ADMIN] MODULE LOADED OK");

/* ================= SAFE STARTUP ================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    try {

      initPage();

      checkAuth();

      bindEvents();

      console.log(
        "[SUPER ADMIN CREATE SYSTEM ADMIN] SAFE INIT COMPLETE"
      );

    } catch (err) {

      console.error(
        "[SUPER ADMIN INIT ERROR]",
        err
      );
    }
  }
);
