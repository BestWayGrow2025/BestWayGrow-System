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
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  session = null;
  currentUser = null;
}

function bindEvents() {
  document.getElementById("loginBtn").addEventListener("click", login);
}

function loadPage() {
  let active = JSON.parse(localStorage.getItem("loggedInFranchise") || "null");

  if (active && active.userId) {
    window.location.href = "franchise_dashboard.html";
  }
}

function safeDecode(value) {
  try {
    return atob(value);
  } catch {
    return value;
  }
}

function login() {
  if (lock) return;
  lock = true;

  let msg = document.getElementById("msg");
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  msg.innerText = "";

  if (!userId || !password) {
    msg.innerText = "⚠ Enter ID & Password";
    lock = false;
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  let user = users.find(u =>
    String(u.userId || "").toLowerCase() === userId.toLowerCase() &&
    u.role === "franchise" &&
    (u.password === password || safeDecode(u.password) === password)
  );

  if (!user) {
    msg.innerText = "❌ Invalid Franchise Login";
    lock = false;
    return;
  }

  if ((user.status || "active") !== "active") {
    msg.innerText = "❌ Account inactive";
    lock = false;
    return;
  }

  localStorage.setItem("loggedInFranchise", JSON.stringify({
    userId: user.userId
  }));

  window.location.href = "franchise_dashboard.html";
}
