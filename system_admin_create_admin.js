"use strict";

console.log("SYSTEM ADMIN MODULE LOADED");

let session = null;
let currentUser = null;
let lock = false;

/* ================= BOOT ================= */

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  checkAuth();
  bindEvents();
});

/* ================= INIT ================= */

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

/* ================= AUTH ================= */

function checkAuth() {
  session =
    typeof getSession === "function"
      ? getSession()
      : JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null");

  if (!session || !session.userId) {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "system_admin") {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }
}

/* ================= EVENTS ================= */

function bindEvents() {
  document.getElementById("adminType")
    .addEventListener("change", toggleDepartments);

  document.getElementById("createBtn")
    .addEventListener("click", safeCreateAdmin);

  toggleDepartments();
}

/* ================= UI ================= */

function toggleDepartments() {
  let type = document.getElementById("adminType").value;
  document.getElementById("deptBox").style.display =
    type === "admin_b" ? "block" : "none";
}

/* ================= SAFE ================= */

function safeCreateAdmin() {
  if (lock) return;
  lock = true;

  try {
    createAdmin();
  } catch (e) {
    console.error(e);
    showMsg("❌ System Error");
  }

  setTimeout(() => lock = false, 500);
}

/* ================= CREATE ================= */

function createAdmin() {

  let adminId = document.getElementById("adminId").value.trim();
  let name = document.getElementById("name").value.trim();
  let password = document.getElementById("password").value.trim();
  let adminType = document.getElementById("adminType").value;

  if (!adminId || !name || !password) {
    showMsg("❌ Fill all fields");
    return;
  }

  let users = getUsers() || [];

  if (users.find(u => (u.userId || "").toLowerCase() === adminId.toLowerCase())) {
    showMsg("⚠️ Admin already exists");
    return;
  }

  let permissions = [];
  let departments = [];
  let tree = "office";

  if (adminType === "root_admin") {
    tree = "field";
    permissions = ["tree_root"];
    departments = ["all"];
  }

  if (adminType === "admin_a") {
    permissions = ["full_access"];
    departments = ["finance", "franchisee", "kyc"];
  }

  if (adminType === "admin_b") {
    document.querySelectorAll("#deptBox input:checked")
      .forEach(cb => departments.push(cb.value));

    if (!departments.length) {
      showMsg("⚠️ Select departments");
      return;
    }

    permissions = ["department_access"];
  }

  users.push({
    userId: adminId,
    username: name,
    password: btoa(password),

    role: "system_admin",
    adminType,

    tree,
    permissions,
    departments,

    status: "active",
    createdBy: currentUser.userId,
    createdAt: Date.now()
  });

  saveUsers(users);

  if (typeof logActivity === "function") {
    logActivity(adminId, "SYSTEM_ADMIN", "ADMIN CREATED");
  }

  showMsg("✅ Admin created successfully");
  clearForm();
}

/* ================= CLEAR ================= */

function clearForm() {
  document.getElementById("adminId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("password").value = "";
  document.getElementById("adminType").value = "root_admin";

  document.querySelectorAll("#deptBox input")
    .forEach(cb => cb.checked = false);

  toggleDepartments();
}

/* ================= MSG ================= */

function showMsg(msg) {
  document.getElementById("msg").innerText = msg;
}

/* ================= MODULE ISOLATION (IMPORTANT FIX) ================= */

window.SystemAdminSystem = {
  create: createAdmin,
  showMsg
};
