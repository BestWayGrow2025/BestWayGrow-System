// ================= INIT =================
if (typeof initCoreSystem === "function") initCoreSystem();
else { alert("core_system.js missing"); throw new Error("STOP"); }

// ================= AUTH =================
let session = null;

try {
  if (typeof getSession === "function") {
    session = getSession();
  }
} catch (e) {
  console.error(e);
}

if (!session || session.role !== "super_admin") {
  location.href = "super_admin_login.html";
  throw new Error("STOP");
}

let currentUser = session;

// ================= WELCOME =================
document.getElementById("welcome").innerText =
  "Welcome SUPER ADMIN (" + currentUser.userId + ")";

// ================= LOCK SYSTEM =================
let lock = false;

function safeClick(btn, fn) {
  if (lock) return;

  lock = true;

  if (btn) {
    document.querySelectorAll(".menu button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
  }

  try {
    fn();
  } catch (e) {
    console.error(e);
    alert("Error: " + e.message);
  } finally {
    setTimeout(() => {
      lock = false;
    }, 200);
  }
}

// ================= SYSTEM CHECK =================
function isSystemSafe() {
  let s = getSystemSettings() || {};
  if (s.lockMode) {
    alert("System Locked");
    return false;
  }
  return true;
}

// ================= HOME =================
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

    <hr style="margin:20px 0;">
    <p>✔ System running normally</p>
  `;
}

// ================= CREATE =================
function loadCreate() {
  document.getElementById("mainContent").innerHTML = `
    <h3>Create System Admin</h3>
    <input id="id" placeholder="User ID"><br>
    <input id="name" placeholder="Name"><br>
    <input id="pass" placeholder="Password"><br>
    <button onclick="safeClick(null,create)">Create</button>
  `;
}

function create() {
  if (!isSystemSafe()) return;

  let id = document.getElementById("id").value.trim();
  let name = document.getElementById("name").value.trim();
  let pass = document.getElementById("pass").value.trim();

  if (!id || !name || !pass) return alert("Fill all fields");

  let users = getUsers() || [];

  if (users.find(u => u.userId.toLowerCase() === id.toLowerCase())) {
    return alert("Already exists");
  }

  users.push({
    userId: id,
    username: name,
    password: btoa(pass),
    role: "system_admin",
    status: "active",
    createdAt: Date.now(),
    createdBy: currentUser.userId
  });

  saveUsers(users);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Create System Admin: " + id);
  }

  alert("System Admin Created");
  loadUsers();
}

// ================= USERS =================
function loadUsers() {
  let users = getUsers() || [];

  let html = `
    <h3>All Users</h3>
    <table>
      <tr><th>ID</th><th>Name</th><th>Role</th></tr>
  `;

  users
    .filter(u => u.userId !== "BWG000000")
    .forEach(u => {
      html += `
        <tr>
          <td>${u.userId}</td>
          <td>${u.username || ""}</td>
          <td>${u.role}</td>
        </tr>
      `;
    });

  html += `</table>`;

  document.getElementById("mainContent").innerHTML = html;
}

// ================= SYSTEM =================
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
    <button onclick="safeClick(null,toggleLock)">Toggle</button><br><br>

    Registration: ${s.registrationOpen ? "ON" : "OFF"}
    <button onclick="safeClick(null,toggleRegistration)">Toggle</button><br><br>

    Admin Access: ${s.adminAccess ? "ON" : "OFF"}
    <button onclick="safeClick(null,toggleAdmin)">Toggle</button><br><br>

    Withdraw: ${s.withdrawOpen ? "ON" : "OFF"}
    <button onclick="safeClick(null,toggleWithdraw)">Toggle</button>
  `;
}

function toggleLock() { toggle("lockMode"); }
function toggleRegistration() { toggle("registrationOpen"); }
function toggleAdmin() { toggle("adminAccess"); }
function toggleWithdraw() { toggle("withdrawOpen"); }

function toggle(key) {
  let s = getSystemSettings() || {};

  if (s.lockMode && currentUser.role !== "super_admin") {
    alert("System Locked");
    return;
  }

  s[key] = !s[key];
  saveSystemSettings(s);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Toggle " + key + ": " + s[key]);
  }

  loadSystem();
}

// ================= LOGOUT =================
function logout() {
  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SUPER_ADMIN", "Logout");
  }

  if (typeof clearSession === "function") {
    clearSession();
  }

  location.href = "super_admin_login.html";
}

// ================= RESET =================
function loadResetPanel() {
  document.getElementById("mainContent").innerHTML = `
    <h3>⚠️ System Reset Control</h3>
    <p style="color:red;"><b>Danger Zone</b></p>

    <button onclick="safeClick(null, resetUsers)">🗑 Delete All Users</button><br><br>
    <button onclick="safeClick(null, resetSystem)">♻️ Full System Reset</button><br><br>
    <button onclick="safeClick(null, resetPartial)">⚙️ Reset User Data Only</button>
  `;
}

function resetUsers() {
  if (!confirm("Delete ALL users?")) return;

  let users = getUsers() || [];
  users = users.filter(u => u.userId === "BWG000000");

  saveUsers(users);
  alert("All users deleted (except root)");
  loadHome();
}

function resetSystem() {
  if (!confirm("FULL SYSTEM RESET?")) return;

  localStorage.clear();
  alert("System reset done");
  location.reload();
}

function resetPartial() {
  if (!confirm("Reset user data only?")) return;

  let users = getUsers() || [];

  users.forEach(u => {
    if (u.role === "user") {
      u.wallet = {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      };

      u.leftChild = null;
      u.rightChild = null;
    }
  });

  saveUsers(users);
  alert("User data reset");
  loadHome();
}

// ================= INIT =================
loadHome();
