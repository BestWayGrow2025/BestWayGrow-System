/*
========================================
SUPER ADMIN LOGIN V3.1 (UNIFIED FINAL FIX)
========================================
✔ Fully session_manager compatible
✔ Role secured
✔ Token-safe session creation
✔ Production stable
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
  let session = typeof getSession === "function" ? getSession() : null;

  if (session && session.role === "super_admin") {
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

  let user = users.find(u =>
    String(u.userId || "").toUpperCase() === userId.toUpperCase()
  );

  if (!user) {
    showMsg("❌ Invalid ID");
    return;
  }

  // 🔒 STRICT ROLE CHECK (FIX)
  if (user.role !== "super_admin") {
    showMsg("🚫 Access Denied");
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

  // ================= UNIFIED SESSION =================
  if (typeof setSession !== "function") {
    alert("Session system missing");
    return;
  }

  const now = Date.now();

  setSession({
    userId: user.userId,
    role: user.role,
    loginTime: now,
    lastActivity: now
  });

  if (typeof logActivity === "function") {
    try {
      logActivity(user.userId, "super_admin", "Login", "ADMIN");
    } catch (e) {}
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
