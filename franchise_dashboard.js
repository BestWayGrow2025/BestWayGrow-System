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

  let settings = typeof getSystemSettings === "function" ? getSystemSettings() : {};

  if (settings.franchiseAccess === false) {
    alert("🚫 Franchise access OFF by Super Admin");
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

function loadPage() {
  renderProfile();
  loadSystem();
  loadUsers();

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "FRANCHISE", "Opened dashboard");
  }

  setInterval(function () {
    loadSystem();
    loadUsers();
  }, 4000);
}

function renderProfile() {
  document.getElementById("profile").innerHTML = `
    ID: ${currentUser.userId} <br>
    Name: ${currentUser.username} <br>
    Status: ${currentUser.status || "N/A"}
  `;
}

function loadSystem() {
  let settings = typeof getSystemSettings === "function" ? getSystemSettings() : {};

  document.getElementById("system").innerHTML = `
    Registration: ${settings.registrationOpen !== false ? "OPEN 🟢" : "CLOSED 🔴"} <br>
    Franchise Access: ${settings.franchiseAccess !== false ? "ON 🟢" : "OFF 🔴"} <br>
    Lock Mode: ${settings.lockMode ? "LOCKED 🔴" : "UNLOCKED 🟢"} <br>
    Queue: ${settings.queueStop ? "STOPPED 🔴" : "RUNNING 🟢"} <br>
    Withdraw: ${settings.withdrawStop ? "STOPPED 🔴" : "RUNNING 🟢"}
  `;
}

function loadUsers() {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let downline = users.filter(function (u) {
    return u.introducerId === currentUser.userId;
  });

  if (!downline.length) {
    document.getElementById("userList").innerHTML = "No Users";
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

  document.getElementById("userList").innerHTML = html;
}

function logout() {
  if (lock) return;
  lock = true;

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "FRANCHISE", "Logout");
  }

  localStorage.removeItem("loggedInFranchise");
  window.location.href = "franchise_login.html";
}
