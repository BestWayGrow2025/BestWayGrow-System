let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }
}

function authPage() {
  // login page only
}

function bindEvents() {
  let btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", function () {
      safeClick(login);
    });
  }
}

function loadPage() {
  let active = JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null");

  if (active && active.userId && active.role === "super_admin") {
    window.location.href = "super_admin_dashboard.html";
  }
}

function safeClick(fn) {
  if (lock) return;

  lock = true;

  try {
    fn();
  } catch (err) {
    console.error(err);
  }

  setTimeout(function () {
    lock = false;
  }, 500);
}

function clearSessions() {
  localStorage.removeItem("loggedInSuperAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInFranchise");
  localStorage.removeItem("loggedInUser");
}

function safeDecode(value) {
  try {
    return atob(value);
  } catch {
    return value || "";
  }
}

function getSafeUsers() {
  try {
    return typeof getUsers === "function" ? getUsers() : [];
  } catch (err) {
    console.error(err);
    showMsg("❌ System Error");
    return [];
  }
}

function login() {
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showMsg("⚠️ Enter ID & Password");
    return;
  }

  let users = typeof getSafeUsers === "function" ? getSafeUsers() : getUsers();

  let user = users.find(function (u) {
    return (
      String(u.userId || "").toUpperCase() === "SUPERADMIN" &&
      u.role === "super_admin"
    );
  });

  if (!user) {
    showMsg("❌ Invalid ID");
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    return;
  }

  // SAFE PASSWORD CHECK
  let storedPass = "";

  try {
    storedPass = typeof safeDecode === "function"
      ? safeDecode(user.password)
      : atob(user.password);
  } catch (e) {
    showMsg("❌ Password system error");
    return;
  }

  if (String(storedPass).trim() !== String(password).trim()) {
    showMsg("❌ Wrong Password");
    return;
  }

  if (typeof clearSessions === "function") {
    clearSessions();
  }

  // FIXED SESSION KEY CONSISTENCY
  localStorage.setItem("loggedInSuperAdmin", JSON.stringify({
    userId: user.userId,
    role: user.role
  }));

  if (!localStorage.getItem("loggedInSuperAdmin")) {
    showMsg("❌ Session Failed");
    return;
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "super_admin", "Login", "ADMIN");
  }

  showMsg("✅ Login successful");

  setTimeout(function () {
    window.location.href = "super_admin_dashboard.html";
  }, 500);
}

// =====================
// MESSAGE HANDLER (FIXED)
// =====================
function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  } else {
    alert(text);
  }
}
