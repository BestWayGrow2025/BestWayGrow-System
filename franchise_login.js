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
  let loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
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
  } catch (err) {
    return value;
  }
}

function login() {
  if (lock) return;

  let msg = document.getElementById("msg");
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!msg) return;

  msg.innerText = "";

  if (!userId || !password) {
    msg.innerText = "⚠ Enter ID & Password";
    return;
  }

  if (typeof getUsers !== "function") {
    msg.innerText = "❌ User system unavailable";
    return;
  }

  lock = true;

  let users = getUsers();

  let user = users.find(function (u) {
    return (
      String(u.userId || "").toLowerCase() === userId.toLowerCase() &&
      u.role === "franchise" &&
      (u.password === password || safeDecode(u.password) === password)
    );
  });

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

  localStorage.setItem(
    "loggedInFranchise",
    JSON.stringify({
      userId: user.userId
    })
  );

  window.location.href = "franchise_dashboard.html";
}
