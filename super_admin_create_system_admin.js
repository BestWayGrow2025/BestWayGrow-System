let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  try {
    if (typeof getSession === "function") {
      session = getSession();
    }
  } catch (e) {
    console.error(e);
  }

  if (!session || session.role !== "super_admin") {
    alert("Access denied");
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = session;
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
  } finally {
    setTimeout(() => {
      lock = false;
    }, 300);
  }
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

  if (users.find(u => u.userId.toLowerCase() === id.toLowerCase())) {
    showMsg("⚠️ ID already exists");
    return;
  }

  let newAdmin = {
    userId: id,
    username: name,
    password: btoa(pass),
    role: "system_admin",
    status: "active",
    createdAt: new Date().toISOString(),
    createdBy: currentUser.userId
  };

  users.push(newAdmin);
  saveUsers(users);

  showMsg("✅ System Admin Created");

  document.getElementById("sysId").value = "";
  document.getElementById("sysName").value = "";
  document.getElementById("sysPass").value = "";
}
