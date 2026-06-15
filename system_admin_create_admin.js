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
    alert("core_system.js missing");
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

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (currentUser.username || currentUser.userId) +
      " (" + currentUser.userId + ")";
  }
}

// ================= REDIRECT =================
function redirectLogin() {

  if (typeof destroySession === "function") {
    destroySession();
  } else {
    localStorage.removeItem("loggedInSystemAdmin");
  }

  window.location.href = "system_admin_login.html";
}

// ================= EVENTS =================
function bindEvents() {

  const adminType = document.getElementById("adminType");
  const createBtn = document.getElementById("createBtn");

  if (adminType) {
    adminType.addEventListener("change", toggleDepartments);
  }

  if (createBtn) {
    createBtn.addEventListener("click", safeCreateAdmin);
  }

  toggleDepartments();
}

// ================= UI =================
function toggleDepartments() {

  const type = document.getElementById("adminType");
  const deptBox = document.getElementById("deptBox");

  if (!type || !deptBox) return;

  deptBox.style.display =
    type.value === "admin_b" ? "block" : "none";
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

  setTimeout(() => lock = false, 500);
}

// ================= CREATE ADMIN =================
function createAdmin() {

  const adminId = document.getElementById("adminId")?.value.trim();
  const name = document.getElementById("name")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const adminType = document.getElementById("adminType")?.value;

  if (!adminId || !name || !password) {
    showMsg("❌ Fill all fields");
    return;
  }

  const users = getUsers?.() || [];

  const exists = users.find(u =>
    (u.userId || "").toLowerCase() === adminId.toLowerCase()
  );

  if (exists) {
    showMsg("⚠️ Admin already exists");
    return;
  }

  let permissions = [];
  let departments = [];
  let tree = "office";

  // ================= ROLE LOGIC =================
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

  // ================= CREATE OBJECT =================
  users.push({
    userId: adminId,
    username: name,
    password: btoa(password),

    role: "admin",
    adminType,

    tree,
    hiddenAccount: true,

    permissions,
    departments,

    status: "active",

    createdBy: currentUser.userId,
    createdByRole: "system_admin",
    createdAt: Date.now()
  });

  // ================= SAVE =================
  if (typeof saveUsers === "function") {
    saveUsers(users);
  } else {
    localStorage.setItem("users", JSON.stringify(users));
  }

  // ================= LOG =================
  if (typeof logActivity === "function") {
    logActivity(adminId, "SYSTEM_ADMIN", "ADMIN CREATED");
  }

  showMsg("✅ Admin created successfully");
  clearForm();
}

// ================= CLEAR FORM =================
function clearForm() {

  const fields = ["adminId", "name", "password"];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const type = document.getElementById("adminType");
  if (type) type.value = "root_admin";

  document.querySelectorAll("#deptBox input")
    .forEach(cb => cb.checked = false);

  toggleDepartments();
}

// ================= MESSAGE =================
function showMsg(msg) {

  const el = document.getElementById("msg");
  if (el) el.innerText = msg;
}

// ================= EXPORTS =================
window.SystemAdminCreateAdmin = {
  createAdmin,
  showMsg
};

// ================= MODULE FLAG =================
window.__SYSTEM_ADMIN_CREATE_ADMIN__ = true;

console.log("[SYSTEM ADMIN CREATE ADMIN] SINGLE PATH READY");
