let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  checkAuth();
  bindEvents();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function checkAuth() {
  session =
    typeof getSession === "function"
      ? getSession()
      : JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null");

  if (!session || !session.userId) {
    if (typeof destroySession === "function") {
      destroySession();
    } else {
      localStorage.removeItem("loggedInSystemAdmin");
    }

    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "system_admin") {
    if (typeof destroySession === "function") {
      destroySession();
    } else {
      localStorage.removeItem("loggedInSystemAdmin");
    }

    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    if (typeof destroySession === "function") {
      destroySession();
    } else {
      localStorage.removeItem("loggedInSystemAdmin");
    }

    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("adminType")
    .addEventListener("change", toggleDepartments);

  document.getElementById("createBtn")
    .addEventListener("click", safeCreateAdmin);

  toggleDepartments();
}

function toggleDepartments() {
  let adminType =
    document.getElementById("adminType").value;

  document.getElementById("deptBox").style.display =
    adminType === "admin_b" ? "block" : "none";
}

function safeCreateAdmin() {
  if (lock) return;
  lock = true;

  try {
    createAdmin();
  } catch (err) {
    console.error(err);
    showMsg("❌ System Error");
  }

  setTimeout(function () {
    lock = false;
  }, 600);
}

function createAdmin() {
  let adminId =
    document.getElementById("adminId").value.trim();

  let name =
    document.getElementById("name").value.trim();

  let password =
    document.getElementById("password").value.trim();

  let adminType =
    document.getElementById("adminType").value;

  if (!adminId || !name || !password) {
    showMsg("❌ Fill all fields");
    return;
  }

  let users = getUsers() || [];

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

  // Only one Root Admin allowed
  if (adminType === "root_admin") {
    let rootExists = users.some(function (u) {
      return (
        u.role === "admin" &&
        u.adminType === "root_admin"
      );
    });

    if (rootExists) {
      showMsg("⚠️ Root Admin already exists");
      return;
    }
  }

  let permissions = [];
  let departments = [];
  let tree = "office";

  // Root Admin belongs to field tree
  if (adminType === "root_admin") {
    tree = "field";
    permissions = ["tree_root"];
    departments = ["all"];
  }

  // Admin A belongs to office tree
  if (adminType === "admin_a") {
    tree = "office";
    permissions = ["full_access"];
    departments = ["finance", "franchisee", "kyc"];
  }

  // Admin B belongs to office tree
  if (adminType === "admin_b") {
    tree = "office";

    document.querySelectorAll("#deptBox input:checked")
      .forEach(function (cb) {
        departments.push(cb.value);
      });

    if (!departments.length) {
      showMsg("⚠️ Select at least one department");
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
    createdAt: new Date().toISOString()
  });

  saveUsers(users);

  if (typeof logActivity === "function") {
    logActivity(adminId, "SYSTEM_ADMIN", "ADMIN CREATED");
  }

  showMsg("✅ Admin created successfully");
  clearForm();
}

function clearForm() {
  document.getElementById("adminId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("password").value = "";
  document.getElementById("adminType").value = "root_admin";

  document.querySelectorAll("#deptBox input")
    .forEach(function (cb) {
      cb.checked = false;
    });

  toggleDepartments();
}

function showMsg(msg) {
  document.getElementById("msg").innerText = msg;
}
