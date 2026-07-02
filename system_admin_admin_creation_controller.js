"use strict";

/*
========================================
SYSTEM ADMIN CREATE ADMIN v4.0 SINGLE PATH FINAL
========================================
✔ Single execution path (DOMContentLoaded only)
✔ Single session source (getSession only)
✔ Core system dependency only
✔ No BOOT layer dependency
✔ Production safe architecture
========================================
*/

console.log("[SYSTEM ADMIN CREATE ADMIN] INIT");

// ================= GLOBAL STATE =================
let session = null;
let currentUser = null;
let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

  initPage();
  checkAuth();

  if (!currentUser || !currentUser.userId) return;

  bindEvents();
});

// ================= CORE INIT =================
function initPage() {

  if (typeof initCoreSystem !== "function") {
    alert("core_initializer.js missing");
    throw new Error("STOP");
  }

  initCoreSystem();
}

// ================= AUTH (SINGLE PATH ONLY) =================
function checkAuth() {

  // 🔒 SINGLE SOURCE OF TRUTH
  session = getSession();

if (!session || session.role !== "system_admin") {
    redirectLogin();
    throw new Error("UNAUTHORIZED");
}

  if (typeof getUserById !== "function") {
    redirectLogin();
    throw new Error("USER_SYSTEM_MISSING");
  }

  currentUser = getUserById(session.userId);

if (!currentUser || currentUser.role !== "system_admin") {
    redirectLogin();
    throw new Error("INVALID_USER");
}

 if ((currentUser.status || "active") !== "active") {
    redirectLogin();
    throw new Error("INACTIVE");
}

}

// ================= REDIRECT =================
function redirectLogin() {

  if (typeof destroySession === "function") {
    destroySession();
  }

}

// ================= EVENTS =================
function bindEvents() {

  const createBtn = document.getElementById("createBtn");

  if (createBtn) {
    createBtn.addEventListener("click", safeCreateAdmin);
  }
}

// ================= SAFE WRAPPER =================
function safeCreateAdmin() {

  if (lock) return;
  lock = true;

  try {
    createAdmin();
  } catch (e) {
    console.error("[CREATE ADMIN ERROR]", e);
    showMsg("❌ System Error");
  }

  setTimeout(() => {
    lock = false;
  }, 500);
}

// ================= CREATE ADMIN =================
function createAdmin() {

 window.location.href = "system_admin_auth.html";
  if (!adminId || !name || !password) {
    showMsg("❌ Fill all fields");
    return;
  }

  const users = getUsers?.() || [];

  const exists = users.find(u =>
    (u.userId || "").toLowerCase() === adminId.toLowerCase()
  );

  if (exists) {
    showMsg("⚠️ System Admin already exists");
    return;
  }

  users.push({
    userId: adminId,
    username: name,
    password: btoa(password),

    role: "system_admin",

    status: "active",

    createdBy: currentUser.userId,
    createdByRole: "super_admin",
    createdAt: Date.now()
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  } else {
    localStorage.setItem("users", JSON.stringify(users));
  }

  showMsg("✅ System Admin created successfully");
  clearForm();
}

// ================= CLEAR FORM =================
function clearForm() {

  ["sysId", "sysName", "sysPass"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// ================= MESSAGE =================
function showMsg(msg) {

  const el = document.getElementById("msg");

  if (el) {
    el.innerText = msg;
  }
}

// ================= EXPORTS =================
window.SuperAdminSystemAdminCreation = {
  createAdmin,
  showMsg
};

// ================= MODULE FLAG =================
window.__SUPER_ADMIN_SYSTEM_ADMIN_CREATION__ = true;

console.log("[SUPER ADMIN SYSTEM ADMIN CREATION] READY");
