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
    alert("core_system.js not loaded");
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("loginBtn").addEventListener("click", function () {
    safeClick(login);
  });
}

function safeClick(fn) {
  if (lock) return;

  lock = true;

  try {
    fn();
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(function () {
      lock = false;
    }, 800);
  }
}

function logoutAll() {
  localStorage.removeItem("loggedInSuperAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInFranchise");
  localStorage.removeItem("loggedInUser");
}

function safeDecode(password) {
  try {
    return atob(password);
  } catch (e) {
    return password;
  }
}

function isSystemAllowed(user) {
  if (typeof getSystemSettings !== "function") {
    showMsg("❌ System settings missing");
    return false;
  }

  let settings = getSystemSettings() || {};

  if (user.role === "system_admin" || user.role === "super_admin") {
    return true;
  }

  if (settings.lockMode === true) {
    showMsg("🚫 System Locked");
    return false;
  }

  if (settings.adminAccess === false) {
    showMsg("🚫 Admin Access OFF");
    return false;
  }

  return true;
}

function login() {
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showMsg("⚠️ Enter ID & Password");
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  let user = users.find(function (u) {
    return u.userId === userId && u.role === "system_admin";
  });

  if (!user) {
    showMsg("❌ Invalid ID");
    return;
  }

  if (!isSystemAllowed(user)) return;

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    return;
  }

  let storedPass = safeDecode(user.password);

  if (storedPass.trim() !== password) {
    showMsg("❌ Wrong Password");
    return;
  }

  logoutAll();

  if (typeof saveSession === "function") {
    saveSession({
      userId: user.userId,
      role: user.role
    });
  } else {
    localStorage.setItem("loggedInSystemAdmin", JSON.stringify({
      userId: user.userId,
      role: user.role
    }));
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "SYSTEM_ADMIN", "Login");
  }

  showMsg("✅ Login successful");

  setTimeout(function () {
    window.location.href = "system_admin_dashboard.html";
  }, 700);
}

function showMsg(text) {
  document.getElementById("msg").innerText = text;
}
