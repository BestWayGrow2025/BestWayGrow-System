/*
========================================
SUPER ADMIN DASHBOARD
STABILIZED FINAL VERSION
ONE AUTH ENGINE ONLY
========================================
*/

let currentUser = null;
let clickLock = false;

// ================= BOOT =================
document.addEventListener("DOMContentLoaded", bootSuperAdmin);

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

  if (typeof initCoreSystem !== "function") {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  initCoreSystem();
}

// ================= AUTH =================
function authPage() {

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "super_admin") {
    return false;
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : session;

  if (!currentUser) return false;

  if ((currentUser.status || "active") !== "active") {

    if (typeof clearSession === "function") {
      clearSession();
    }

    return false;
  }

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome SUPER ADMIN (" + currentUser.userId + ")";
  }

  return true;
}

// ================= EVENTS =================
function bindEvents() {

  document.querySelectorAll(".menu button")
    .forEach(btn => {

      btn.addEventListener("click", function () {

        if (clickLock) return;

        clickLock = true;

        document.querySelectorAll(".menu button")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const page = btn.dataset.page;

        try {

          if (page === "home") loadHome();

          else if (page === "create") loadCreate();

          else if (page === "users") loadUsers();

          else if (page === "system") loadSystem();

          else if (page === "reset") loadResetPanel();

        } finally {

          setTimeout(() => {
            clickLock = false;
          }, 250);
        }
      });
    });

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const homeBtn =
    document.querySelector('.menu button[data-page="home"]');

  if (homeBtn) {
    homeBtn.classList.add("active");
  }
}

// ================= HOME =================
function loadHome() {

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const totalUsers =
    users.filter(u => u.role === "user").length;

  const admins =
    users.filter(u => u.role === "admin").length;

  const sysAdmins =
    users.filter(u => u.role === "system_admin").length;

  document.getElementById("mainContent").innerHTML = `
    <h3>📊 Dashboard Overview</h3>

    <div style="display:flex;flex-wrap:wrap;gap:15px;margin-top:15px;">

      <div style="flex:1;min-width:220px;background:#4CAF50;color:#fff;padding:20px;border-radius:10px;">
        <h4>👤 Users</h4>
        <h2>${totalUsers}</h2>
      </div>

      <div style="flex:1;min-width:220px;background:#2196F3;color:#fff;padding:20px;border-radius:10px;">
        <h4>🛠 Admins</h4>
        <h2>${admins}</h2>
      </div>

      <div style="flex:1;min-width:220px;background:#ff9800;color:#fff;padding:20px;border-radius:10px;">
        <h4>👑 System Admins</h4>
        <h2>${sysAdmins}</h2>
      </div>

    </div>
  `;
}

// ================= CREATE SYS ADMIN =================
function loadCreate() {

  document.getElementById("mainContent").innerHTML = `
    <h3>Create System Admin</h3>

    <input id="id" placeholder="System Admin ID">

    <input id="name" placeholder="Name">

    <input id="pass" type="password" placeholder="Password">

    <button onclick="createSystemAdmin()">
      Create
    </button>
  `;
}

function createSystemAdmin() {

  const id =
    document.getElementById("id").value.trim();

  const name =
    document.getElementById("name").value.trim();

  const pass =
    document.getElementById("pass").value.trim();

  if (!id || !name || !pass) {
    return alert("Fill all fields");
  }

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  if (
    users.find(
      u => u.userId.toLowerCase() === id.toLowerCase()
    )
  ) {
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

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("System Admin Created");

  loadUsers();
}

// ================= USERS =================
function loadUsers() {

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  let html = `
    <h3>All Users</h3>

    <table>

      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
  `;

  users.forEach(u => {

    html += `
      <tr>
        <td>${u.userId}</td>
        <td>${u.username || ""}</td>
        <td>${u.role || ""}</td>
        <td>${u.status || "active"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  document.getElementById("mainContent").innerHTML = html;
}

// ================= SYSTEM =================
function loadSystem() {

  let s =
    typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

  document.getElementById("mainContent").innerHTML = `

    <h3>⚙️ System Control</h3>

    <table>

      <tr>
        <th>Control</th>
        <th>Status</th>
        <th>Action</th>
      </tr>

      ${systemRow("Registration", "registrationOpen", s.registrationOpen)}

      ${systemRow("Upgrade", "upgradesOpen", s.upgradesOpen)}

      ${systemRow("Repurchase", "repurchaseOpen", s.repurchaseOpen)}

      ${systemRow("Withdraw", "withdrawOpen", s.withdrawOpen)}

      ${systemRow("Admin Access", "adminAccess", s.adminAccess)}

      ${systemRow("Lock Mode", "lockMode", s.lockMode)}

      ${systemRow("PIN Creation", "pinCreateOpen", s.pinCreateOpen)}

      ${systemRow("Payout", "payoutOpen", s.payoutOpen)}

      ${systemRow("Income Calculation", "incomeOpen", s.incomeOpen)}

      ${systemRow("Auto Run", "autoRun", s.autoRun)}

      ${systemRow("Manual Run", "manualRun", s.manualRun)}

    </table>
  `;
}

function systemRow(label, key, value) {

  return `
    <tr>
      <td>${label}</td>

      <td>
        ${value ? "🟢 ON" : "🔴 OFF"}
      </td>

      <td>
        <button
          class="${value ? "offBtn" : "onBtn"}"
          onclick="toggleSystem('${key}')"
        >
          ${value ? "OFF" : "ON"}
        </button>
      </td>
    </tr>
  `;
}

function toggleSystem(key) {

  let s =
    typeof getSystemSettings === "function"
      ? getSystemSettings()
      : {};

  s[key] = !s[key];

  if (typeof saveSystemSettings === "function") {
    saveSystemSettings(s);
  }

  loadSystem();
}

// ================= RESET =================
function loadResetPanel() {

  document.getElementById("mainContent").innerHTML = `
    <h3>⚠️ System Reset</h3>

    <button onclick="resetUsers()">
      Delete Users
    </button>

    <br><br>

    <button onclick="resetUserData()">
      Reset User Data
    </button>

    <br><br>

    <button onclick="restartSystem()">
      Restart System
    </button>
  `;
}

function resetUsers() {

  if (!confirm("Delete users?")) return;

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  users = users.filter(u =>
    [
      "BWG000000",
      "SUPERADMIN",
      "SYSTEM"
    ].includes(u.userId)
  );

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Users cleaned");

  loadHome();
}

function resetUserData() {

  if (!confirm("Reset data?")) return;

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  users.forEach(u => {

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

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Data reset");

  loadHome();
}

function restartSystem() {

  alert("System Restarted");

  window.location.reload();
}

// ================= LOGOUT =================
function logout() {

  if (typeof clearSession === "function") {
    clearSession();
  }

  window.location.href =
    "super_admin_login.html";
}
