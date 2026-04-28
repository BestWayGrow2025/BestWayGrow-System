let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  checkAuth();
  bindEvents();
  loadHome();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function checkAuth() {
  session = JSON.parse(localStorage.getItem("loggedInSuperAdmin") || "null");

  if (!session || !session.userId) {
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  if (typeof getUserById !== "function") {
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "super_admin") {
    localStorage.removeItem("loggedInSuperAdmin");
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInSuperAdmin");
    alert("Account inactive");
    window.location.href = "super_admin_login.html";
    throw new Error("STOP");
  }

  document.getElementById("welcome").innerText =
    "Welcome SUPER ADMIN (" + currentUser.userId + ")";
}

function bindEvents() {
  document.querySelectorAll(".menu button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".menu button").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
    });
  });
}

function safeClick(btn, fn) {
  if (lock) return;

  lock = true;

  try {
    if (btn) {
      document.querySelectorAll(".menu button").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
    }

    fn();
  } catch (e) {
    console.error(e);
    alert("System Error");
  }

  setTimeout(function () {
    lock = false;
  }, 250);
}

function isSystemSafe() {
  let s = getSystemSettings() || {};
  return !s.lockMode;
}

function loadHome() {
  let users = getUsers() || [];

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

  let users = getUsers() || [];

  if (users.find(u => u.userId.toLowerCase() === id.toLowerCase())) {
    return alert("ID already exists");
  }

  if (users.some(u => u.role === "system_admin" && u.userId.toLowerCase() === id.toLowerCase())) {
    return alert("System Admin already exists");
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

  saveUsers(users);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Created System Admin " + id);
  }

  alert("System Admin Created");
  loadUsers();
}

function loadUsers() {
  let users = getUsers() || [];

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

function loadSystem() {
  let s = getSystemSettings() || {
    lockMode: false,
    registrationOpen: true,
    adminAccess: true,
    withdrawOpen: true
  };

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
  let s = getSystemSettings() || {};
  s[key] = !s[key];
  saveSystemSettings(s);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Toggle " + key + " = " + s[key]);
  }

  loadSystem();
}

function loadResetPanel() {
  document.getElementById("mainContent").innerHTML = `
    <h3>⚠️ System Reset Control</h3>
    <p style="color:red;"><b>Danger Zone</b></p>

    <button onclick="resetUsers()">Delete All Users</button><br><br>
    <button onclick="resetUserData()">Reset User Data Only</button>
  `;
}

function resetUsers() {
  if (!confirm("Delete all users except protected accounts?")) return;

  let users = getUsers() || [];

  users = users.filter(function (u) {
    return ["BWG000000", "SUPERADMIN", "SYSTEM"].includes(u.userId);
  });

  saveUsers(users);
  alert("Users deleted safely");
  loadHome();
}

function resetUserData() {
  if (!confirm("Reset all user data?")) return;

  let users = getUsers() || [];

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

  saveUsers(users);
  alert("User data reset");
  loadHome();
}

function logout() {
  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Logout");
  }

  localStorage.removeItem("loggedInSuperAdmin");
  window.location.href = "super_admin_login.html";
}
