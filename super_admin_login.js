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

  let users = getSafeUsers();

  let user = users.find(function (u) {
    return (
      String(userId).toLowerCase() === "superadmin" &&
      String(u.userId || "") === "SUPERADMIN" &&
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

  let storedPass = safeDecode(user.password);

  if (storedPass.trim() !== password) {
    showMsg("❌ Wrong Password");
    return;
  }

  clearSessions();

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

function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  }
}
