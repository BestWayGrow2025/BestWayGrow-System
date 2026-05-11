/*

SYSTEM ADMIN DASHBOARD (FINAL V8.2)
ONE AUTH ENGINE ONLY (session_manager.js)
FLOW SAFE + CLEAN

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

// ================= AUTH =================
function authPage() {
const session = typeof getSession === "function" ? getSession() : null;

if (!session || session.role !== "system_admin") {
return false;
}

currentUser = typeof getUserById === "function"
? getUserById(session.userId)
: session;

if (!currentUser) return false;

const status = currentUser.status || currentUser.accountStatus || "active";

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
    if (page === "pins") loadPins();  
    if (page === "settings") loadSettings();  
  } catch (err) {  
    document.getElementById("mainContent").innerHTML =  
      `<p style="color:red;">Failed to load section</p>`;  
  }  

  setTimeout(() => {  
    clickLock = false;  
  }, 250);  
});

});
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

document.getElementById("mainContent").innerHTML = `
<div class="card">
<h3>Dashboard Overview</h3>

<div style="display:flex; gap:15px;">  
    <div>  
      <h4>Office</h4>  
      <p>Users: ${officeUsers.length}</p>  
      <p>Admins: ${officeAdmins.length}</p>  
    </div>  

    <div>  
      <h4>Field</h4>  
      <p>Users: ${fieldUsers.length}</p>  
      <p>Admins: ${fieldAdmins.length}</p>  
      <p>Root Admin: ${rootAdmin.length}</p>  
    </div>  
  </div>  
</div>

`;
}

// ================= USERS =================
function loadUsers() {
const users = typeof getUsers === "function"
? getUsers().filter(u => !u.hiddenAccount)
: [];

let html = `<div class="card"><h3>All Users</h3><table>

  <tr>  
    <th>ID</th><th>Name</th><th>Role</th><th>Type</th><th>Tree</th><th>Status</th><th>Action</th>  
  </tr>`;  users.forEach(u => {
html +=   <tr>   <td>${u.userId || "-"}</td>   <td>${u.username || "-"}</td>   <td>${u.role || "-"}</td>   <td>${u.adminType || "-"}</td>   <td>${u.tree || "-"}</td>   <td>${u.status || "active"}</td>   <td>Protected</td>   </tr>  ;
});

html += </table></div>;
document.getElementById("mainContent").innerHTML = html;
}

// ================= LOGOUT =================
function logout() {
if (typeof clearSession === "function") clearSession();
window.location.href = "system_admin_login.html";
}
