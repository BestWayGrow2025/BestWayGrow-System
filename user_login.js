let session = null;
let currentUser = null;
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
    throw new Error("core_system.js missing");
  }
}

function authPage() {
  session = typeof getSession === "function" ? getSession() : null;

  if (session && session.role === "user") {
    window.location.href = "user_dashboard.html";
    return;
  }

  currentUser = null;
}

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

function loadPage() {
  showMsg("");
}

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
    console.error(err);
    showMsg("❌ Login Error");
    resetLogin();
  }
}

function submitLogin() {
  const userId = document.getElementById("userId").value.trim().toUpperCase();
  const password = document.getElementById("password").value.trim();

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
    showMsg("Access denied");
    resetLogin();
    return;
  }

  if (user.status !== "active") {
    showMsg("Account inactive");
    resetLogin();
    return;
  }

  const stored = safeDecode(user.password || "");

  if (stored !== password) {
    showMsg("Wrong Password");
    resetLogin();
    return;
  }

  if (typeof setSession === "function") {
    setSession({
      userId: user.userId,
      role: user.role
    });
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "USER", "Login");
  }

  showMsg("Login Success", "green");

  const btn = document.getElementById("loginBtn");
  if (btn) {
    btn.innerText = "Redirecting...";
  }

  setTimeout(function () {
    window.location.href = "user_dashboard.html";
  }, 500);
}

function resetLogin() {
  lock = false;

  const btn = document.getElementById("loginBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Login";
  }
}

function togglePassword() {
  const pass = document.getElementById("password");
  if (!pass) return;

  pass.type = pass.type === "password" ? "text" : "password";
}

function showMsg(text, color = "red") {
  const msg = document.getElementById("msg");
  if (!msg) return;

  msg.style.color = color;
  msg.innerText = text;
}

function safeDecode(value) {
  try {
    return atob(value);
  } catch {
    return value || "";
  }
}
