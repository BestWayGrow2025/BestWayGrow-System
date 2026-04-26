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
  session = JSON.parse(localStorage.getItem("loggedInSystemAdmin"));

  if (!session) {
    alert("Access denied");
    window.location.href = "system_admin_login.html";
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "system_admin") {
    alert("Invalid session");
    localStorage.removeItem("loggedInSystemAdmin");
    window.location.href = "system_admin_login.html";
  }
}

function bindEvents() {
  document.getElementById("type").addEventListener("change", toggleDepartments);
  document.getElementById("createBtn").addEventListener("click", safeCreateAdmin);
}

function safeCreateAdmin() {
  if (lock) return;
  lock = true;

  try {
    createAdmin();
  } catch (e) {
    console.error(e);
    showMsg("❌ System Error");
  }

  setTimeout(() => {
    lock = false;
  }, 600);
}

function toggleDepartments() {
  let type = document.getElementById("type").value;
  document.getElementById("deptBox").style.display = type === "B" ? "block" : "none";
}

function createAdmin() {
  let adminId = document.getElementById("adminId").value.trim();
  let name = document.getElementById("name").value.trim();
  let password = document.getElementById("password").value.trim();
  let type = document.getElementById("type").value;

  if (!adminId || !name || !password) {
    showMsg("❌ Fill all fields");
    return;
  }

  let users = getUsers() || [];

  if (users.find(u => u.userId === adminId)) {
    showMsg("⚠️ Admin already exists");
    return;
  }

  let departments = [];

  if (type === "B") {
    document.querySelectorAll("#deptBox input:checked").forEach(cb => {
      departments.push(cb.value);
    });

    if (departments.length === 0) {
      showMsg("⚠️ Select at least one department");
      return;
    }
  } else {
    departments = ["finance", "franchisee", "kyc"];
  }

  let newAdmin = {
    userId: adminId,
    username: name,
    password: btoa(password),
    role: "admin",
    type: type,
    departments: departments,
    status: "active",
    createdBy: currentUser.userId,
    createdAt: new Date().toISOString()
  };

  users.push(newAdmin);
  saveUsers(users);

  showMsg("✅ Admin created successfully");
  clearForm();
}

function clearForm() {
  document.getElementById("adminId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("password").value = "";
  document.getElementById("type").value = "A";
  document.querySelectorAll("#deptBox input").forEach(cb => cb.checked = false);
  document.getElementById("deptBox").style.display = "none";
}

function showMsg(msg) {
  document.getElementById("msg").innerText = msg;
}
