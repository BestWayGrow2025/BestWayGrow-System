let session = null;
let currentUser = null;
let lock = false;
let refreshTimer = null;

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
  session = JSON.parse(localStorage.getItem("loggedInFranchise") || "null");

  if (!session || !session.userId) {
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }

  if (typeof getUserById !== "function") {
    localStorage.removeItem("loggedInFranchise");
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "franchise") {
    localStorage.removeItem("loggedInFranchise");
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }

  let settings =
    typeof getSystemSettings === "function" ? getSystemSettings() : {};

  if (settings.franchiseAccess === false) {
    alert("🚫 Franchise access OFF by Super Admin");
    localStorage.removeItem("loggedInFranchise");
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  let logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

function loadPage() {
  renderProfile();
  loadSystem();
  loadUsers();

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "franchise", "Opened dashboard", "FRANCHISE");
  }

  refreshTimer = setInterval(function () {
    loadSystem();
    loadUsers();
  }, 4000);
}

function renderProfile() {
  let profile = document.getElementById("profile");

  if (!profile) return;

  profile.innerHTML =
    "ID: " + currentUser.userId + "<br>" +
    "Name: " + currentUser.username + "<br>" +
    "Status: " + (currentUser.status || "N/A");
}

function loadSystem() {
  let system = document.getElementById("system");
  if (!system) return;

  let settings =
    typeof getSystemSettings === "function" ? getSystemSettings() : {};

  system.innerHTML =
    "Registration: " + (settings.registrationOpen !== false ? "OPEN 🟢" : "CLOSED 🔴") + "<br>" +
    "Franchise Access: " + (settings.franchiseAccess !== false ? "ON 🟢" : "OFF 🔴") + "<br>" +
    "Lock Mode: " + (settings.lockMode ? "LOCKED 🔴" : "UNLOCKED 🟢") + "<br>" +
    "Queue: " + (settings.queueStop ? "STOPPED 🔴" : "RUNNING 🟢") + "<br>" +
    "Withdraw: " + (settings.withdrawStop ? "STOPPED 🔴" : "RUNNING 🟢");
}

function loadUsers() {
  let userList = document.getElementById("userList");
  if (!userList) return;

  let users = typeof getUsers === "function" ? getUsers() : [];

  let downline = users.filter(function (u) {
    return u.introducerId === currentUser.userId;
  });

  if (!downline.length) {
    userList.innerHTML = "No Users";
    return;
  }

  let html = `
    <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Status</th>
        <th>Wallet</th>
      </tr>
  `;

  downline.forEach(function (user) {
    html += `
      <tr>
        <td>${user.userId}</td>
        <td>${user.username}</td>
        <td>${user.isActive ? "ACTIVE 🟢" : "INACTIVE 🔴"}</td>
        <td>₹ ${user.wallet || 0}</td>
      </tr>
    `;
  });

  html += "</table>";

  userList.innerHTML = html;
}

function logout() {
  if (lock) return;
  lock = true;

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "franchise", "Logout", "FRANCHISE");
  }

  localStorage.removeItem("loggedInFranchise");
  window.location.href = "franchise_login.html";
}
