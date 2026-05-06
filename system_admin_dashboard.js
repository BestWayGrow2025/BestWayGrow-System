/*
========================================
SYSTEM ADMIN DASHBOARD (FINAL V8.2)
ONE AUTH ENGINE ONLY (session_manager.js)
FLOW SAFE + CLEAN
========================================
*/

let currentUser = null;
let clickLock = false;

// ================= BOOT =================
document.addEventListener("DOMContentLoaded", function () {
  bootSystem();
});

// ================= BOOT SYSTEM =================
function bootSystem() {
  initPage();

  if (!authPage()) {
    window.location.href = "system_admin_login.html";
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
    alert("❌ core_system.js missing");
    throw new Error("STOP");
  }
}

// ================= AUTH (STRICT SESSION ENGINE) =================
function authPage() {
  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "system_admin") {
    return false;
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : session;

  if (!currentUser) return false;

  const status =
    currentUser.status ||
    currentUser.accountStatus ||
    "active";

  if (status !== "active") {
    if (typeof clearSession === "function") clearSession();
    return false;
  }

  const el = document.getElementById("welcome");
  if (el) {
    el.innerText =
      "Welcome " +
      (currentUser.username || currentUser.userId) +
      " (" +
      currentUser.userId +
      ")";
  }

  return true;
}

// ================= EVENTS =================
function bindEvents() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const buttons = document.querySelectorAll(".menu button");

  buttons.forEach(btn => {
    btn.addEventListener("click", function () {
      if (clickLock) return;

      clickLock = true;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      try {
        const page = btn.dataset.page;

        if (page === "home") loadHome();
        if (page === "users") loadUsers();
        if (page === "create") loadCreateAdmin();
        if (page === "pins") loadPins(); // UI only
        if (page === "settings") loadSettings();
      } catch (err) {
        console.error("Dashboard error:", err);
        document.getElementById("mainContent").innerHTML =
          `<p style="color:red;">Failed to load section</p>`;
      }

      setTimeout(() => {
        clickLock = false;
      }, 250);
    });
  });

  const homeBtn = document.querySelector('.menu button[data-page="home"]');
  if (homeBtn) homeBtn.classList.add("active");
}

// ================= PROTECTION =================
function isProtectedTarget(user) {
  if (!user) return true;
  if (user.userId === currentUser.userId) return true;

  if (user.role === "super_admin") return true;
  if (user.role === "system_admin") return true;

  return ["SUPERADMIN", "SYSTEM", "BWG000000", "BWG000001"].includes(user.userId);
}

// ================= SAFE SAVE =================
function safeSaveUsers(users) {
  if (typeof saveUsers !== "function") return false;
  saveUsers(users);
  return true;
}

// ================= HOME =================
function loadHome() {
  const users = typeof getUsers === "function" ? getUsers() : [];

  const officeUsers = users.filter(u => u.tree === "office" && u.role === "user");
  const officeAdmins = users.filter(u => u.tree === "office" && u.role === "admin");

  const fieldUsers = users.filter(u => u.tree === "field" && u.role === "user");
  const fieldAdmins = users.filter(u => u.tree === "field" && u.role === "admin");

  const rootAdmin = users.filter(u =>
    u.role === "admin" &&
    u.adminType === "root_admin" &&
    u.tree === "field"
  );

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="card">
      <h3>Dashboard Overview</h3>

      <div style="display:flex; flex-wrap:wrap; gap:15px;">
        <div style="flex:1; min-width:250px; background:#4CAF50; color:#fff; padding:20px; border-radius:10px;">
          <h4>🏢 Office Tree</h4>
          <p>Total Office Users: ${officeUsers.length}</p>
          <p>Total Office Admins: ${officeAdmins.length}</p>
        </div>

        <div style="flex:1; min-width:250px; background:#2196F3; color:#fff; padding:20px; border-radius:10px;">
          <h4>🌐 User Tree</h4>
          <p>Total Field Users: ${fieldUsers.length}</p>
          <p>Total Field Admins: ${fieldAdmins.length}</p>
          <p>Root Admin (Field): ${rootAdmin.length}</p>
        </div>
      </div>
    </div>
  `;
}

// ================= USERS =================
function loadUsers() {
  const users =
    typeof getUsers === "function"
      ? getUsers().filter(u => !u.hiddenAccount)
      : [];

  let html = `
    <div class="card">
      <h3>All Users</h3>
      <table>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Admin Type</th>
          <th>Tree</th>
          <th>Status</th>
          <th>Access</th>
          <th>Action</th>
        </tr>
  `;

  users.forEach(u => {
    const blocked = isProtectedTarget(u);

    let accessLabel = "-";
    if (u.role === "admin" && u.adminType === "root_admin") accessLabel = "Root";
    if (u.role === "admin" && u.adminType === "admin_a") accessLabel = "Full";
    if (u.role === "admin" && u.adminType === "admin_b") accessLabel = "Department";

    html += `
      <tr>
        <td>${u.userId || "-"}</td>
        <td>${u.username || "-"}</td>
        <td>${u.role || "-"}</td>
        <td>${u.adminType || "-"}</td>
        <td>${u.tree || "-"}</td>
        <td>${u.status || "active"}</td>
        <td>${accessLabel}</td>
        <td>
          ${blocked
            ? `<small>Protected</small>`
            : `<button onclick="toggleUserStatus('${u.userId}')">Toggle</button>`}
        </td>
      </tr>
    `;
  });

  html += `</table></div>`;
  document.getElementById("mainContent").innerHTML = html;
}

// ================= TOGGLE =================
function toggleUserStatus(userId) {
  if (clickLock) return;
  clickLock = true;

  try {
    const users = typeof getUsers === "function" ? getUsers() : [];
    const user = users.find(u => u.userId === userId);

    if (!user || isProtectedTarget(user)) {
      alert("Protected account");
      return;
    }

    user.status = user.status === "inactive" ? "active" : "inactive";

    if (!safeSaveUsers(users)) {
      alert("Save failed");
      return;
    }

    if (typeof logActivity === "function") {
      logActivity(currentUser.userId, "SYSTEM_ADMIN", "Toggled user " + user.userId);
    }

    loadUsers();
  } finally {
    setTimeout(() => {
      clickLock = false;
    }, 250);
  }
}

// ================= LOGOUT =================
function logout() {
  if (typeof clearSession === "function") {
    clearSession();
  }
  window.location.href = "system_admin_login.html";
}
