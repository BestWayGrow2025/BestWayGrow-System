let session = null;
let currentUser = null;
let lock = false;

function loadHome() {
  let users = getUsers() || [];

  let officeUsers = users.filter(u => u.tree === "office" && u.role === "user");
  let officeAdmins = users.filter(u => u.tree === "office" && u.role === "admin");
  let officeRootAdmins = users.filter(u => u.tree === "office" && u.role === "admin" && u.adminType === "root_admin");
  let officeAdminA = users.filter(u => u.tree === "office" && u.role === "admin" && u.adminType === "admin_a");
  let officeAdminB = users.filter(u => u.tree === "office" && u.role === "admin" && u.adminType === "admin_b");

  let fieldUsers = users.filter(u => u.tree === "field" && u.role === "user");
  let fieldAdmins = users.filter(u => u.tree === "field" && u.role === "admin");
  let fieldRootAdmins = users.filter(u => u.tree === "field" && u.role === "admin" && u.adminType === "user_root_admin");
  let fieldAdminA = users.filter(u => u.tree === "field" && u.role === "admin" && u.adminType === "admin_a");
  let fieldAdminB = users.filter(u => u.tree === "field" && u.role === "admin" && u.adminType === "admin_b");

  document.getElementById("mainContent").innerHTML = `
    <div class="card">
      <h3>Dashboard Overview</h3>
      <div style="display:flex; flex-wrap:wrap; gap:15px;">

        <div style="flex:1; min-width:250px; background:#4CAF50; color:#fff; padding:20px; border-radius:10px;">
          <h4>🏢 Office Tree</h4>
          <p>Total Office Users: ${officeUsers.length}</p>
          <p>Total Office Admins: ${officeAdmins.length}</p>
          <p>Root Admin: ${officeRootAdmins.length}</p>
          <p>Admin A: ${officeAdminA.length}</p>
          <p>Admin B: ${officeAdminB.length}</p>
        </div>

        <div style="flex:1; min-width:250px; background:#2196F3; color:#fff; padding:20px; border-radius:10px;">
          <h4>👤 User Tree</h4>
          <p>Total Field Users: ${fieldUsers.length}</p>
          <p>Total Field Admins: ${fieldAdmins.length}</p>
          <p>User Root Admin: ${fieldRootAdmins.length}</p>
          <p>Admin A: ${fieldAdminA.length}</p>
          <p>Admin B: ${fieldAdminB.length}</p>
        </div>

      </div>
    </div>
  `;
}

function loadCreateAdmin() {
  document.getElementById("mainContent").innerHTML = `
    <div class="card">
      <h3>Create Admin</h3>

      <input id="adminId" placeholder="Admin ID"><br>
      <input id="adminName" placeholder="Admin Name"><br>
      <input id="adminPass" placeholder="Password"><br>

      <select id="adminType">
        <option value="admin_a">Admin A</option>
        <option value="admin_b">Admin B</option>
      </select><br>

      <select id="adminTree">
        <option value="office">Office Tree</option>
        <option value="field">Field Tree</option>
      </select><br>

      <button onclick="createAdmin()">Create Admin</button>
    </div>
  `;
}

function loadUsers() {
  let users = (getUsers() || []).filter(u => !u.hiddenAccount);

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
          <th>Action</th>
        </tr>
  `;

  users.forEach(u => {
    html += `
      <tr>
        <td>${u.userId}</td>
        <td>${u.username || ""}</td>
        <td>${u.role || ""}</td>
        <td>${u.adminType || "-"}</td>
        <td>${u.tree || "-"}</td>
        <td>${u.status || "active"}</td>
        <td>
          <button onclick="toggleUserStatus('${u.userId}')">Toggle</button>
          <button onclick="editUser('${u.userId}')">Edit</button>
          <button onclick="deleteUser('${u.userId}')">Delete</button>
        </td>
      </tr>
    `;
  });

  html += `</table></div>`;
  document.getElementById("mainContent").innerHTML = html;
}

function deleteUser(userId) {
  if (userId === currentUser.userId) return alert("You cannot delete yourself");
  if (["BWG000000", "SUPERADMIN", "BWG000001", "SYSTEM"].includes(userId)) {
    return alert("Protected account cannot be deleted");
  }

  if (!confirm("Delete this user?")) return;

  let users = getUsers() || [];
  users = users.filter(u => u.userId !== userId);
  saveUsers(users);

  alert("User deleted successfully");
  loadUsers();
}

function toggleUserStatus(userId) {
  if (userId === currentUser.userId) return alert("You cannot deactivate yourself");

  let users = getUsers() || [];
  let user = users.find(u => u.userId === userId);
  if (!user) return;

  if (["BWG000000", "SUPERADMIN", "BWG000001", "SYSTEM"].includes(user.userId)) {
    return alert("Protected account cannot be deactivated");
  }

  user.status = user.status === "inactive" ? "active" : "inactive";
  saveUsers(users);

  alert(user.userId + " is now " + user.status);
  loadUsers();
}

function editUser(userId) {
  let users = getUsers() || [];
  let user = users.find(u => u.userId === userId);
  if (!user) return;

  if (["SUPERADMIN", "BWG000001", "SYSTEM"].includes(user.userId)) {
    return alert("This account cannot be edited");
  }

  let newName = prompt("Enter new name", user.username || "");
  if (newName === null) return;

  let newPass = prompt("Enter new password", "");
  if (newPass === null) return;

  user.username = newName.trim();
  if (newPass.trim()) user.password = btoa(newPass.trim());

  saveUsers(users);
  alert("User updated successfully");
  loadUsers();
}

function createAdmin() {
  let id = document.getElementById("adminId").value.trim();
  let name = document.getElementById("adminName").value.trim();
  let pass = document.getElementById("adminPass").value.trim();
  let adminType = document.getElementById("adminType").value;
  let adminTree = document.getElementById("adminTree").value;

  if (!id || !name || !pass) return alert("Fill all fields");

  let users = getUsers() || [];
  if (users.find(u => u.userId === id)) return alert("ID already exists");

  users.push({
    userId: id,
    username: name,
    password: btoa(pass),
    role: "admin",
    adminType,
    tree: adminTree,
    status: "active",
    visibleInTree: false,
    allowReferral: false,
    createdBy: currentUser.userId,
    createdAt: Date.now()
  });

  saveUsers(users);
  alert("Admin created successfully");
  loadUsers();
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

  localStorage.setItem("systemPin", pin);
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
  if (!confirm("Clear all activity logs?")) return;
  localStorage.removeItem("activityLogs");
  alert("Activity logs cleared");
}

function logout() {
  localStorage.removeItem("loggedInSystemAdmin");
  window.location.href = "system_admin_login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof initCoreSystem === "function") initCoreSystem();
  else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }

  session = JSON.parse(localStorage.getItem("loggedInSystemAdmin"));

  if (!session || session.role !== "system_admin") {
    window.location.href = "system_admin_login.html";
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "system_admin") {
    localStorage.removeItem("loggedInSystemAdmin");
    window.location.href = "system_admin_login.html";
    return;
  }

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInSystemAdmin");
    alert("Account inactive");
    window.location.href = "system_admin_login.html";
    return;
  }

  document.getElementById("welcome").innerText =
    "Welcome " + (currentUser.username || "") + " (" + currentUser.userId + ")";

  loadHome();
});
