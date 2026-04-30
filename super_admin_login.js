/*
========================================
SUPER ADMIN LOGIN v3 (FINAL FIXED)
========================================
✔ Multi-user safe login
✔ Core system compatible
✔ Clean password decode
✔ No undefined errors
✔ Stable session handling
========================================
*/

let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  bindEvents();
  loadPage();
});

// ================= INIT =================
function initPage() {
  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }

  initCoreSystem();
}

// ================= EVENTS =================
function bindEvents() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.addEventListener("click", function () {
      safeClick(login);
    });
  }
}

// ================= AUTO REDIRECT =================
function loadPage() {
  let active = JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null");

  if (active && active.userId && active.role === "super_admin") {
    window.location.href = "super_admin_dashboard.html";
  }
}

// ================= SAFE CLICK =================
function safeClick(fn) {
  if (lock) return;
  lock = true;

  try {
    fn();
  } catch (err) {
    console.error(err);
  }

  setTimeout(() => {
    lock = false;
  }, 500);
}

// ================= SESSION CLEAR =================
function clearSessions() {
  localStorage.removeItem("loggedInSuperAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInFranchise");
  localStorage.removeItem("loggedInUser");
}

// ================= SAFE DECODE =================
function safeDecode(value) {
  try {
    return atob(value || "");
  } catch {
    return value || "";
  }
}

// ================= USERS =================
function getSafeUsers() {
  try {
    return typeof getUsers === "function" ? getUsers() : [];
  } catch {
    return [];
  }
}

// ================= LOGIN =================
function login() {
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showMsg("⚠️ Enter ID & Password");
    return;
  }

  let users = getSafeUsers();

  // ✅ FIXED: proper user match
  let user = users.find(u =>
    String(u.userId || "").toUpperCase() === userId.toUpperCase()
  );

  if (!user) {
    showMsg("❌ Invalid ID");
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    return;
  }

  let storedPass = safeDecode(user.password);

  if (storedPass !== password) {
    showMsg("❌ Wrong Password");
    return;
  }

  clearSessions();

  localStorage.setItem("loggedInSuperAdmin", JSON.stringify({
    userId: user.userId,
    role: user.role
  }));

  if (typeof logActivity === "function") {
    logActivity(user.userId, "super_admin", "Login", "ADMIN");
  }

  showMsg("✅ Login successful");

  setTimeout(() => {
    window.location.href = "super_admin_dashboard.html";
  }, 500);
}

// ================= MESSAGE =================
function showMsg(text) {
  let msg = document.getElementById("msg");

  if (msg) {
    msg.innerText = text;
  } else {
    alert(text);
  }
}
