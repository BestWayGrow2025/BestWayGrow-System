"use strict";

/*
========================================
SYSTEM ADMIN CREATE ADMIN v3.0 FINAL BOOT
========================================
✔ Boot Architecture V2 compatible
✔ Safe module registration
✔ No global function collision
✔ Production stable
========================================
*/

console.log("[SYSTEM ADMIN CREATE ADMIN] FILE EXECUTION STARTED");

let session = null;
let currentUser = null;
let lock = false;

/* ================= MODULE REGISTRATION ================= */

BOOT.register("system_admin_create_admin", function () {
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
    redirectLogin();
    throw new Error("STOP");
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;

  if (!currentUser || currentUser.role !== "system_admin") {
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
  } else {
    localStorage.removeItem("loggedInSystemAdmin");
  }

  window.location.href = "system_admin_login.html";
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

/* ================= SAFE CREATE ================= */

function safeCreateAdmin() {
  if (lock) return;
  lock = true;

  try {
    createAdmin();
  } catch (e) {
    console.error("[SYSTEM ADMIN ERROR]", e);
    showMsg("❌ System Error");
  }

  setTimeout(function () {
    lock = false;
  }, 500);
}

/* ================= CREATE ADMIN ================= */

function createAdmin() {
  let adminId = document.getElementById("adminId").value.trim();
  let name = document.getElementById("name").value.trim();
  let password = document.getElementById("password").value.trim();
  let adminType = document.getElementById("adminType").value;

  if (!adminId || !name || !password) {
    showMsg("❌ Fill all fields");
    return;
  }

  let users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];

  if (
    users.find(function (u) {
      return (
        (u.userId || "").toLowerCase() ===
        adminId.toLowerCase()
      );
    })
  ) {
    showMsg("⚠️ Admin already exists");
    return;
  }

  let permissions = [];
  let departments = [];
  let tree = "office";

  /* Root Admin */
  if (adminType === "root_admin") {
    tree = "field";
    permissions = ["tree_root"];
    departments = ["all"];
  }

  /* Admin A */
  if (adminType === "admin_a") {
    permissions = ["full_access"];
    departments = ["finance", "franchisee", "kyc"];
  }

  /* Admin B */
  if (adminType === "admin_b") {
    document
      .querySelectorAll("#deptBox input:checked")
      .forEach(function (cb) {
        departments.push(cb.value);
      });

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

    role: "admin",
    adminType: adminType,

    tree: tree,
    hiddenAccount: true,

    permissions: permissions,
    departments: departments,

    status: "active",

    createdBy: currentUser.userId,
    createdByRole: "system_admin",
    createdAt: Date.now()
  });

  if (typeof saveUsers === "function") {
    saveUsers(users);
  } else {
    localStorage.setItem("users", JSON.stringify(users));
  }

  if (typeof logActivity === "function") {
    logActivity(adminId, "SYSTEM_ADMIN", "ADMIN CREATED");
  }

  showMsg("✅ Admin created successfully");
  clearForm();
}

/* ================= CLEAR FORM ================= */

function clearForm() {
  document.getElementById("adminId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("password").value = "";
  document.getElementById("adminType").value = "root_admin";

  document
    .querySelectorAll("#deptBox input")
    .forEach(function (cb) {
      cb.checked = false;
    });

  toggleDepartments();
}

/* ================= MESSAGE ================= */

function showMsg(msg) {
  document.getElementById("msg").innerText = msg;
}

/* ================= EXPORTS ================= */

window.SystemAdminCreateAdmin = {
  createAdmin: createAdmin,
  showMsg: showMsg
};

/* ================= MODULE FLAGS ================= */

window.__SYSTEM_ADMIN_CREATE_ADMIN__ = true;

window.__SYSTEM_ADMIN_MODULE__ = {
  loaded: true,
  name: "system_admin_create_admin",
  time: Date.now()
};

/* ================= START MODULE ================= */

BOOT.start("system_admin_create_admin");

console.log("[SYSTEM ADMIN CREATE ADMIN] MODULE LOADED OK");
