let currentUser = null;
let clickLock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
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

function authPage() {
  if (typeof protectPage !== "function") {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  currentUser = protectPage({
    role: "system_admin"
  });

  if (!currentUser) {
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || currentUser.accountStatus || "active") !== "active") {
    localStorage.removeItem("loggedInSystemAdmin");
    window.location.href = "system_admin_login.html";
    throw new Error("STOP");
  }

  document.getElementById("welcome").innerText =
    "Welcome " + (currentUser.username || currentUser.userId) +
    " (" + currentUser.userId + ")";
}

function bindEvents() {
  document.getElementById("logoutBtn").addEventListener("click", logout);

  document.querySelectorAll(".menu button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (clickLock) return;

      clickLock = true;

      document.querySelectorAll(".menu button").forEach(function (b) {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      try {
        let page = btn.dataset.page;

        if (page === "home") loadHome();
        if (page === "users") loadUsers();
        if (page === "create") loadCreateAdmin();
        if (page === "pins") loadPins();
        if (page === "settings") loadSettings();
      } finally {
        setTimeout(() => {
          clickLock = false;
        }, 300);
      }
    });
  });

  document.querySelector('.menu button[data-page="home"]').classList.add("active");
}

function isProtectedTarget(user) {
  if (!user) return true;
  if (user.userId === currentUser.userId) return true;

  if (user.role === "super_admin") return true;
  if (user.role === "system_admin") return true;

  return ["SUPERADMIN", "SYSTEM", "BWG000000", "BWG000001"].includes(user.userId);
}

function safeSaveUsers(users) {
  if (typeof saveUsers !== "function") return false;
  saveUsers(users);
  return true;
}

function loadHome() {
  let users = (typeof getUsers === "function") ? getUsers() : [];

  let officeUsers = users.filter(u => u.tree === "office" && u.role === "user");
  let officeAdmins = users.filter(u => u.tree === "office" && u.role === "admin");

  let fieldUsers = users.filter(u => u.tree === "field" && u.role === "user");
  let fieldAdmins = users.filter(u => u.tree === "field" && u.role === "admin");

  let rootAdmin = users.filter(u =>
    u.role === "admin" &&
    u.adminType === "root_admin" &&
    u.tree === "field"
  );

  document.getElementById("mainContent").innerHTML = `
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

function loadUsers() {
  let users = (typeof getUsers === "function")
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

  users.forEach(function (u) {
    let blocked = isProtectedTarget(u);

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

function toggleUserStatus(userId) {
  if (clickLock) return;
  clickLock = true;

  try {
    let users = (typeof getUsers === "function") ? getUsers() : [];
    let user = users.find(u => u.userId === userId);

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
    }, 300);
  }
}

function loadCreateAdmin() {
  document.getElementById("mainContent").innerHTML = `
    <div class="card">
      <h3>Create Admin</h3>

      <input id="adminId" placeholder="Admin ID"><br>
      <input id="adminName" placeholder="Admin Name"><br>
      <input id="adminPass" placeholder="Password"><br>

      <select id="adminType">
        <option value="root_admin">Root Admin (1 only / User Tree)</option>
        <option value="admin_a">Admin A (Full Access)</option>
        <option value="admin_b">Admin B (Department Access)</option>
      </select><br>

      <select id="adminTree">
        <option value="field">User Tree</option>
        <option value="office">Office Tree</option>
      </select><br>

      <button onclick="createAdmin()">Create Admin</button>
    </div>
  `;
}

function createAdmin() {
  if (clickLock) return;
  clickLock = true;

  try {
    let id = document.getElementById("adminId").value.trim().toUpperCase();
    let name = document.getElementById("adminName").value.trim();
    let pass = document.getElementById("adminPass").value.trim();
    let adminType = document.getElementById("adminType").value;
    let adminTree = document.getElementById("adminTree").value;

    if (!id || !name || !pass) return alert("Fill all fields");
    if (!["root_admin", "admin_a", "admin_b"].includes(adminType)) return alert("Invalid admin type");
    if (!["field", "office"].includes(adminTree)) return alert("Invalid tree");
    if (["SUPERADMIN", "SYSTEM", "BWG000000", "BWG000001"].includes(id)) return alert("Reserved ID blocked");

    if (adminType === "root_admin" && adminTree !== "field") {
      return alert("Root Admin allowed only in User Tree");
    }

    let users = (typeof getUsers === "function") ? getUsers() : [];

    if (users.find(u => u.userId === id)) return alert("ID already exists");

    let existingRoot = users.find(u =>
      u.role === "admin" &&
      u.adminType === "root_admin" &&
      u.tree === "field"
    );

    if (adminType === "root_admin" && existingRoot) {
      return alert("Only one Root Admin allowed");
    }

    users.push({
      userId: id,
      username: name,
      password: btoa(pass),
      role: "admin",
      adminType: adminType,
      tree: adminTree,
      department: adminType === "admin_b" ? "restricted" : "all",
      status: "active",
      visibleInTree: false,
      allowReferral: false,
      createdBy: currentUser.userId,
      createdAt: Date.now()
    });

    if (!safeSaveUsers(users)) return alert("Create failed");

    if (typeof logActivity === "function") {
      logActivity(currentUser.userId, "SYSTEM_ADMIN", "Created admin " + id);
    }

    alert("Admin created successfully");
    loadUsers();
  } finally {
    setTimeout(() => {
      clickLock = false;
    }, 300);
  }
}

function loadPins() {
  document.getElementById("mainContent").innerHTML = `
    <div class="card">
      <h3>PIN Control</h3>
      <input id="newPin" placeholder="Enter New PIN"><br>
      <button onclick="savePin()">Save PIN</button>
    </div>
  `;
}

function savePin() {
  let pin = document.getElementById("newPin").value.trim();

  if (!pin) return alert("Enter PIN");

  if (typeof safeSet !== "function") return alert("PIN system unavailable");

  safeSet("systemPin", pin);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "SYSTEM_ADMIN", "Updated system PIN");
  }

  alert("PIN Saved");
}

function loadSettings() {
  document.getElementById("mainContent").innerHTML = `
    <div class="card">
      <h3>Settings</h3>
      <p>System Admin settings panel</p>
      <button onclick="clearLogs()">Clear Activity Logs</button>
    </div>
  `;
}

function clearLogs() {
  if (clickLock) return;
  clickLock = true;

  try {
    if (!confirm("Clear all activity logs?")) return;
    if (typeof safeSet !== "function") return alert("Log system unavailable");

    safeSet("activityLogs", []);

    if (typeof logActivity === "function") {
      logActivity(currentUser.userId, "SYSTEM_ADMIN", "Cleared activity logs");
    }

    alert("Activity logs cleared");
  } finally {
    setTimeout(() => {
      clickLock = false;
    }, 300);
  }
}

function logout() {
  localStorage.removeItem("loggedInSystemAdmin");
  window.location.href = "system_admin_login.html";
}
