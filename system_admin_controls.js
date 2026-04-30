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
  session = JSON.parse(localStorage.getItem("loggedInSystemAdmin") || "null");

  if (!session || !session.userId) {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  if (typeof protectPage === "function") {
    currentUser = protectPage({
      role: "system_admin"
    });
  }

  if (!currentUser || currentUser.role !== "system_admin") {
    localStorage.removeItem("loggedInSystemAdmin");
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("toggleWithdrawBtn").addEventListener("click", toggleWithdrawSystem);
  document.getElementById("toggleRegisterBtn").addEventListener("click", toggleRegisterSystem);
  document.getElementById("clearLogsBtn").addEventListener("click", clearLogs);
}

function loadPage() {
  loadSystemStatus();
  loadAdmins();
}

function goBack() {
  window.location.href = "system_admin_dashboard.html";
}

function loadSystemStatus() {
  let settings = getSystemSettings() || {};

  document.getElementById("systemStatus").innerHTML = `
    Withdraw System: ${settings.withdrawOpen ? "RUNNING 🟢" : "STOPPED 🔴"}<br>
    Registration System: ${settings.registrationOpen ? "RUNNING 🟢" : "STOPPED 🔴"}
  `;
}

function loadAdmins() {
  let users = getUsers() || [];
  let admins = users.filter(u => u.role === "admin");

  let table = document.getElementById("adminTable");
  if (!table) return;

  if (!admins.length) {
    table.innerHTML = "<tr><td colspan='7'>No admins found</td></tr>";
    return;
  }

  table.innerHTML = admins.map(u => `
    <tr>
      <td>${u.userId}</td>
      <td>${u.username || "-"}</td>
      <td>${u.role}</td>
      <td>${u.adminType || "-"}</td>
      <td>${u.tree || "-"}</td>
      <td>${u.status || "active"}</td>
      <td>
        <button onclick="toggleAdminStatus('${u.userId}')" class="warn">Toggle</button>
      </td>
    </tr>
  `).join("");
}

function toggleWithdrawSystem() {
  if (lock) return;
  lock = true;

  let settings = getSystemSettings() || {};
  settings.withdrawOpen = !settings.withdrawOpen;
  saveSystemSettings(settings);

  logAction("Toggled withdraw system");
  loadSystemStatus();
  lock = false;
}

function toggleRegisterSystem() {
  if (lock) return;
  lock = true;

  let settings = getSystemSettings() || {};
  settings.registrationOpen = !settings.registrationOpen;
  saveSystemSettings(settings);

  logAction("Toggled registration system");
  loadSystemStatus();
  lock = false;
}

function toggleAdminStatus(userId) {
  if (lock) return;
  lock = true;

  let users = getUsers() || [];
  let user = users.find(u => u.userId === userId);

  if (!user) {
    lock = false;
    return;
  }

  user.status = user.status === "inactive" ? "active" : "inactive";
  saveUsers(users);

  logAction("Changed admin status: " + userId);
  loadAdmins();
  lock = false;
}

function clearLogs() {
  if (!confirm("Clear all activity logs?")) return;

  localStorage.removeItem("activityLogs");
  logAction("Cleared activity logs");
  alert("Logs cleared");
}

function logAction(action) {
  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SYSTEM_ADMIN", action);
  }
}
