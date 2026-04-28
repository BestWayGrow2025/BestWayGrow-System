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
  session = JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null");

  if (!session || !session.userId) {
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "super_admin") {
    localStorage.removeItem("loggedInSuperAdmin");
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInSuperAdmin");
    alert("Account inactive");
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("createBtn").addEventListener("click", function () {
    safeClick(createSystemAdmin);
  });
}

function safeClick(fn) {
  if (lock) return;
  lock = true;

  try {
    fn();
  } catch (e) {
    console.error(e);
    showMsg("❌ System Error");
  }

  setTimeout(function () {
    lock = false;
  }, 300);
}

function showMsg(text) {
  document.getElementById("msg").innerText = text;
}

function createSystemAdmin() {
  let id = document.getElementById("sysId").value.trim();
  let name = document.getElementById("sysName").value.trim();
  let pass = document.getElementById("sysPass").value.trim();

  if (!id || !name || !pass) {
    showMsg("❌ Fill all fields");
    return;
  }

  let users = getUsers() || [];

  if (users.find(function (u) {
    return u.userId.toLowerCase() === id.toLowerCase();
  })) {
    showMsg("⚠️ ID already exists");
    return;
  }

  if (users.find(function (u) {
    return u.role === "system_admin" && u.userId.toLowerCase() === id.toLowerCase();
  })) {
    showMsg("⚠️ System Admin already exists");
    return;
  }

  users.push({
    userId: id,
    username: name,
    password: btoa(pass),
    role: "system_admin",
    status: "active",
    createdBy: currentUser.userId,
    createdAt: Date.now()
  });

  saveUsers(users);

  showMsg("✅ System Admin Created");

  document.getElementById("sysId").value = "";
  document.getElementById("sysName").value = "";
  document.getElementById("sysPass").value = "";
}
