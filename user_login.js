/*
========================================
USER LOGIN FINAL FIXED (TEST SAFE)
========================================
✔ Single login submit lock
✔ No redirect loop
✔ Safe session check
✔ Safe password decode
✔ Clean login flow
✔ Dashboard opens once
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= INIT PAGE =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    console.error("core_system.js missing");
  }
}

// ================= AUTH CHECK =================
function authPage() {
  session = typeof getSession === "function" ? getSession() : null;

  // Passive check only (no forced redirect loop)
  if (session && session.role === "user") {
    showMsg("Already Logged In", "green");

    setTimeout(function () {
      window.location.href = "user_dashboard.html";
    }, 300);
    return;
  }

  currentUser = null;
}

// ================= EVENTS =================
function bindEvents() {
  const loginBtn = document.getElementById("loginBtn");
  const showPassword = document.getElementById("showPassword");

  if (loginBtn) {
    loginBtn.addEventListener("click", safeLogin);
  }

  if (showPassword) {
    showPassword.addEventListener("change", togglePassword);
  }
}

// ================= LOAD PAGE =================
function loadPage() {
  showMsg("", "red");
}

// ================= SAFE LOGIN =================
function safeLogin() {
  if (lock) return;
  lock = true;

  const btn = document.getElementById("loginBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Checking...";
  }

  try {
    submitLogin();
  } catch (err) {
    console.error("Login error:", err);
    showMsg("Login Error");
    resetLogin();
  }
}

// ================= SUBMIT LOGIN =================
function submitLogin() {
  const userId = document.getElementById("userId")?.value.trim().toUpperCase();
  const password = document.getElementById("password")?.value.trim();

  if (!userId || !password) {
    showMsg("Enter User ID & Password");
    resetLogin();
    return;
  }

  const users = typeof getUsers === "function" ? getUsers() : [];
  const user = users.find(u => (u.userId || "").toUpperCase() === userId);

  if (!user) {
    showMsg("Invalid User ID");
    resetLogin();
    return;
  }

  if (user.role !== "user") {
    showMsg("Access Denied");
    resetLogin();
    return;
  }

  if (user.status !== "active") {
    showMsg("Account Inactive");
    resetLogin();
    return;
  }

  const storedPassword = safeDecode(user.password || "");

  if (storedPassword !== password) {
    showMsg("Wrong Password");
    resetLogin();
    return;
  }

  // Save session
  if (typeof setSession === "function") {
    setSession({
      userId: user.userId,
      role: user.role
    });
  }

  // Activity log
  if (typeof logActivity === "function") {
    try {
      logActivity(user.userId, "USER", "Login", "USER_LOGIN");
    } catch (e) {
      console.warn("Login log skipped");
    }
  }

  showMsg("Login Success", "green");

  const btn = document.getElementById("loginBtn");
  if (btn) {
    btn.innerText = "Opening...";
  }

  setTimeout(function () {
    window.location.href = "user_dashboard.html";
  }, 400);
}

// ================= RESET LOGIN =================
function resetLogin() {
  lock = false;

  const btn = document.getElementById("loginBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Login";
  }
}

// ================= TOGGLE PASSWORD =================
function togglePassword() {
  const pass = document.getElementById("password");
  if (!pass) return;

  pass.type = pass.type === "password" ? "text" : "password";
}

// ================= MESSAGE =================
function showMsg(text, color = "red") {
  const msg = document.getElementById("msg");
  if (!msg) return;

  msg.style.color = color;
  msg.innerText = text;
}

// ================= SAFE DECODE =================
function safeDecode(value) {
  try {
    return atob(value || "");
  } catch {
    return value || "";
  }
}

