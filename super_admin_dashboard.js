/*
========================================
SUPER ADMIN DASHBOARD (FINAL FIXED)
ONE AUTH ENGINE ONLY (session_manager.js)
========================================
*/

let currentUser = null;
let lock = false;

// ================= BOOT =================
document.addEventListener("DOMContentLoaded", function () {
  bootSuperAdmin();
});

// ================= BOOT =================
function bootSuperAdmin() {
  initPage();

  if (!authPage()) {
    window.location.href = "super_admin_login.html";
    return;
  }

  bindEvents();
  loadHome();
}

// ================= INIT =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

// ================= AUTH (SESSION ENGINE ONLY) =================
function authPage() {
  const session = typeof getSession === "function" ? getSession() : null;

  if (!session || session.role !== "super_admin") {
    return false;
  }

  if (typeof getUserById === "function") {
    currentUser = getUserById(session.userId);
  } else {
    currentUser = session;
  }

  if (!currentUser) return false;

  if ((currentUser.status || "active") !== "active") {
    if (typeof clearSession === "function") {
      clearSession();
    }
    return false;
  }

  const el = document.getElementById("welcome");
  if (el) {
    el.innerText =
      "Welcome SUPER ADMIN (" + currentUser.userId + ")";
  }

  return true;
}

// ================= EVENTS =================
function bindEvents() {
  document.querySelectorAll(".menu button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (lock) return;

      lock = true;

      document.querySelectorAll(".menu button").forEach(function (b) {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      try {
        const page = btn.dataset.page;

        if (page === "home") loadHome();
        if (page === "create") loadCreate();
        if (page === "users") loadUsers();
        if (page === "system") loadSystem();
        if (page === "reset") loadResetPanel();
      } finally {
        setTimeout(() => {
          lock = false;
        }, 250);
      }
    });
  });

  const homeBtn = document.querySelector('.menu button[data-page="home"]');
  if (homeBtn) homeBtn.classList.add("active");
}

// ================= HOME =================
function loadHome() {
  let users = typeof getUsers === "function" ? getUsers() : [];

  let totalUsers = users.filter(u => u.role === "user").length;
  let admins = users.filter(u => u.role === "admin").length;
  let sysAdmins = users.filter(u => u.role === "system_admin").length;

  document.getElementById("mainContent").innerHTML = `
    <h3>📊 Dashboard Overview</h3>

    <div style="display:flex; flex-wrap:wrap; gap:15px; margin-top:15px;">
      <div style="flex:1; min-width:200px; background:#4CAF50; color:#fff; padding:20px; border-radius:10px;">
        <h4>👤 Users</h4>
        <h2>${totalUsers}</h2>
      </div>

      <div style="flex:1; min-width:200px; background:#2196F3; color:#fff; padding:20px; border-radius:10px;">
        <h4>🛠 Admins</h4>
        <h2>${admins}</h2>
      </div>

      <div style="flex:1; min-width:200px; background:#ff9800; color:#fff; padding:20px; border-radius:10px;">
        <h4>👑 System Admins</h4>
        <h2>${sysAdmins}</h2>
      </div>
    </div>
  `;
}

// ================= CREATE SYSTEM ADMIN =================
function loadCreate() {
  document.getElementById("mainContent").innerHTML = `
    <h3>Create System Admin</h3>
    <input id="id" placeholder="User ID"><br>
    <input id="name" placeholder="Name"><br>
    <input id="pass" type="password" placeholder="Password"><br>
    <button onclick="createSystemAdmin()">Create</button>
  `;
}

function createSystemAdmin() {
  let id = document.getElementById("id").value.trim();
  let name = document.getElementById("name").value.trim();
  let pass = document.getElementById("pass").value.trim();

  if (!id || !name || !pass) {
    return alert("Fill all fields");
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  if (users.find(u => u.userId.toLowerCase() === id.toLowerCase())) {
    return alert("ID already exists");
  }

  users.push({
    userId: id,
    username: name,
    password: btoa(pass),
    role: "system_admin",
    status: "active",
    createdBy: currentUser.userId,
    createdAt: Date.now()
  });

  if (typeof saveUsers === "function") saveUsers(users);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Created System Admin " + id);
  }

  alert("System Admin Created");
  loadUsers();
}

// ================= USERS =================
function loadUsers() {
  let users = typeof getUsers === "function" ? getUsers() : [];

  let html = `
    <h3>All Users</h3>
    <table>
      <tr><th>ID</th><th>Name</th><th>Role</th></tr>
  `;

  users.forEach(function (u) {
    html += `
      <tr>
        <td>${u.userId}</td>
        <td>${u.username || ""}</td>
        <td>${u.role || ""}</td>
      </tr>
    `;
  });

  html += `</table>`;
  document.getElementById("mainContent").innerHTML = html;
}

// ================= SYSTEM =================
function loadSystem() {
  let s = typeof getSystemSettings === "function" ? getSystemSettings() : {};

  document.getElementById("mainContent").innerHTML = `
    <h3>System Control</h3>

    Lock Mode: ${s.lockMode ? "ON" : "OFF"}
    <button onclick="toggleSystem('lockMode')">Toggle</button><br><br>

    Registration: ${s.registrationOpen ? "ON" : "OFF"}
    <button onclick="toggleSystem('registrationOpen')">Toggle</button><br><br>

    Admin Access: ${s.adminAccess ? "ON" : "OFF"}
    <button onclick="toggleSystem('adminAccess')">Toggle</button><br><br>

    Withdraw: ${s.withdrawOpen ? "ON" : "OFF"}
    <button onclick="toggleSystem('withdrawOpen')">Toggle</button>
  `;
}

function toggleSystem(key) {
  let s = typeof getSystemSettings === "function" ? getSystemSettings() : {};
  s[key] = !s[key];

  if (typeof saveSystemSettings === "function") {
    saveSystemSettings(s);
  }

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Toggle " + key);
  }

  loadSystem();
}

// ================= RESET =================
function loadResetPanel() {
  document.getElementById("mainContent").innerHTML = `
    <h3>⚠️ System Reset</h3>
    <button onclick="resetUsers()">Delete Users</button><br><br>
    <button onclick="resetUserData()">Reset Data</button>
  `;
}

function resetUsers() {
  if (!confirm("Delete users?")) return;

  let users = typeof getUsers === "function" ? getUsers() : [];

  users = users.filter(u =>
    ["BWG000000", "SUPERADMIN", "SYSTEM"].includes(u.userId)
  );

  if (typeof saveUsers === "function") saveUsers(users);

  alert("Users cleaned");
  loadHome();
}

function resetUserData() {
  if (!confirm("Reset data?")) return;

  let users = typeof getUsers === "function" ? getUsers() : [];

  users.forEach(function (u) {
    if (u.role === "user") {
      u.wallet = {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      };
    }
  });

  if (typeof saveUsers === "function") saveUsers(users);

  alert("Data reset");
  loadHome();
}

// ================= LOGOUT =================
function logout() {
  if (typeof clearSession === "function") {
    clearSession();
  }

  window.location.href = "super_admin_login.html";
}
