"use strict";
/*
SYSTEM ADMIN DASHBOARD v9.0 FINAL
✔ Router architecture compatible ✔ Safe standalone initialization ✔ Session validation ✔ Role protection ✔ Welcome banner ✔ Menu navigation ✔ Dashboard overview ✔ Users list ✔ Create Admin integration ✔ PIN module integration ✔ Settings placeholder ✔ Safe logout ✔ No BOOT dependency ✔ Production ready
*/
console.log("[SYSTEM ADMIN DASHBOARD] FILE EXECUTION STARTED");
let currentUser = null; let clickLock = false; let menuBound = false;
/* ================= INIT ================= */
function initPage() {
if (typeof initCoreSystem === "function") {
initCoreSystem();

} else {
alert("❌ core_system.js missing");

throw new Error("STOP");

} }
/* ================= AUTH ================= */
function checkAuth() {
const session = typeof getSession === "function" ? getSession() : JSON.parse( localStorage.getItem( "loggedInSystemAdmin" ) || "null" );
if (!session || !session.userId) {
redirectLogin();

throw new Error("STOP");

}
if ( session.role && session.role !== "system_admin" ) {
redirectLogin();

throw new Error("STOP");

}
currentUser = typeof getUserById === "function" ? getUserById(session.userId) : session;
if ( !currentUser || currentUser.role !== "system_admin" ) {
redirectLogin();

throw new Error("STOP");

}
const status = currentUser.status || currentUser.accountStatus || "active";
if (status !== "active") {
redirectLogin();

throw new Error("STOP");

}
const welcome = document.getElementById("welcome");
if (welcome) {
welcome.innerText =
  "Welcome " +
  (currentUser.username ||
    currentUser.userId) +
  " (" +
  currentUser.userId +
  ")";

} }
/* ================= REDIRECT ================= */
function redirectLogin() {
if ( typeof destroySession === "function" ) {
destroySession();

} else if ( typeof clearSession === "function" ) {
clearSession();

} else {
localStorage.removeItem(
  "loggedInSystemAdmin"
);

}
window.location.href = "system_admin_login.html"; }
/* ================= EVENTS ================= */
function bindEvents() {
if (menuBound) return;
menuBound = true;
const logoutBtn = document.getElementById( "logoutBtn" );
if ( logoutBtn && !logoutBtn.dataset.bound ) {
logoutBtn.dataset.bound =
  "true";

logoutBtn.addEventListener(
  "click",
  logout
);

}
const buttons = document.querySelectorAll( ".menu button" );
buttons.forEach(function (btn) {
if (btn.dataset.bound) return;

btn.dataset.bound = "true";

btn.addEventListener(
  "click",
  function () {

    if (clickLock) return;

    clickLock = true;

    buttons.forEach(function (b) {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    try {

      const page =
        btn.dataset.page;

      switch (page) {

        case "home":
          loadHome();
          break;

        case "users":
          loadUsers();
          break;

        case "create":
          loadCreateAdmin();
          break;

        case "pins":
          loadPinsSafe();
          break;

        case "settings":
          loadSettings();
          break;

        case "escrow":

          if (
            typeof loadEscrowPanel ===
            "function"
          ) {

            loadEscrowPanel();

          } else {

            const main =
              document.getElementById(
                "mainContent"
              );

            if (main) {

              main.innerHTML = `
                <div class="card">
                  <h3>📦 Escrow Control</h3>
                  <p>Escrow module not loaded.</p>
                </div>
              `;
            }
          }

          break;

        case "controlroom":

          if (
            typeof loadEnterpriseControlRoom ===
            "function"
          ) {

            loadEnterpriseControlRoom();

          } else if (
            typeof renderEnterpriseControlRoomDashboard ===
            "function"
          ) {

            renderEnterpriseControlRoomDashboard();

          } else {

            const main =
              document.getElementById(
                "mainContent"
              );

            if (main) {

              main.innerHTML = `
                <div class="card">
                  <h3>🖥 Enterprise Control Room</h3>
                  <p>Enterprise Control Room module not loaded.</p>
                </div>
              `;
            }
          }

          break;

        case "businessintelligence":

          if (
            typeof loadBusinessIntelligenceDashboard ===
            "function"
          ) {

            loadBusinessIntelligenceDashboard();

          } else if (
            typeof renderEnterpriseBusinessIntelligenceDashboard ===
            "function"
          ) {

            renderEnterpriseBusinessIntelligenceDashboard();

          } else {

            const main =
              document.getElementById(
                "mainContent"
              );

            if (main) {

              main.innerHTML = `
                <div class="card">
                  <h3>📊 Business Intelligence</h3>
                  <p>Business Intelligence module not loaded.</p>
                </div>
              `;
            }
          }

          break;

        case "strategicai":

          if (
            typeof loadStrategicAIAdvisor ===
            "function"
          ) {

            loadStrategicAIAdvisor();

          } else if (
            typeof renderStrategicAIAdvisor ===
            "function"
          ) {

            renderStrategicAIAdvisor();

          } else {

            const main =
              document.getElementById(
                "mainContent"
              );

            if (main) {

              main.innerHTML = `
                <div class="card">
                  <h3>🧠 Strategic AI Advisor</h3>
                  <p>Strategic AI Advisor module not loaded.</p>
                </div>
              `;
            }
          }

          break;
      }

    } catch (err) {

      console.error(
        "[SYSTEM ADMIN DASHBOARD ERROR]",
        err
      );

      const main =
        document.getElementById(
          "mainContent"
        );

      if (main) {

        main.innerHTML =
          '<p style="color:red;">Failed to load section</p>';
      }
    }

    setTimeout(function () {

      clickLock = false;

    }, 250);
  }
);

});
const homeBtn = document.querySelector( '.menu button[data-page="home"]' );
if (homeBtn) {
homeBtn.classList.add("active");

} }
/* ================= HOME ================= */
function loadHome() {
const users = typeof getUsers === "function" ? (getUsers() || []) : [];
const officeUsers = users.filter(function (u) {
 return (
    u.tree === "office" &&
    u.role === "user"
  );
});

const officeAdmins = users.filter(function (u) {
 return (
    u.tree === "office" &&
    u.role === "admin"
  );
});

const fieldUsers = users.filter(function (u) {
 return (
    u.tree === "field" &&
    u.role === "user"
  );
});

const fieldAdmins = users.filter(function (u) {
 return (
    u.tree === "field" &&
    u.role === "admin"
  );
});

const rootAdmin = users.filter(function (u) {
 return (
    u.role === "admin" &&
    u.adminType === "root_admin" &&
    u.tree === "field"
  );
});

const main = document.getElementById( "mainContent" );
if (!main) return;
main.innerHTML = `
 <h3>Dashboard Overview</h3>

  <div style="display:flex;flex-wrap:wrap;gap:15px;">

    <div style="flex:1;min-width:220px;">

      <h4>Office</h4>

      <p>Users: ${officeUsers.length}</p>

      <p>Admins: ${officeAdmins.length}</p>

    </div>

    <div style="flex:1;min-width:220px;">

      <h4>Field</h4>

      <p>Users: ${fieldUsers.length}</p>

      <p>Admins: ${fieldAdmins.length}</p>

      <p>Root Admin: ${rootAdmin.length}</p>

    </div>

  </div>

</div>

`; }
/* ================= USERS ================= */
function loadUsers() {
const users = typeof getUsers === "function" ? (getUsers() || []).filter( function (u) {
       return !u.hiddenAccount;
      }
    )
  : [];

let html = `
 <h3>All Users</h3>

  <table>

    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Role</th>
      <th>Type</th>
      <th>Tree</th>
      <th>Status</th>
      <th>Action</th>
    </tr>

`;
users.forEach(function (u) {
html += `
  <tr>
    <td>${u.userId || "-"}</td>
    <td>${u.username || "-"}</td>
    <td>${u.role || "-"}</td>
    <td>${u.adminType || "-"}</td>
    <td>${u.tree || "-"}</td>
    <td>${u.status || "active"}</td>
    <td>Protected</td>
  </tr>
`;

});
html += `
</table>
`;
const main = document.getElementById( "mainContent" );
if (main) {
main.innerHTML = html;

} }
/* ================= CREATE ADMIN ================= */
function loadCreateAdmin() {
const main = document.getElementById( "mainContent" );
if (!main) return;
if (typeof window.open === "function") {
window.open(
  "system_admin_create_admin.html",
  "_blank"
);

} else {
main.innerHTML = `
  <div class="card">

    <h3>Create Admin</h3>

    <p>Unable to open create admin page.</p>

  </div>
`;

} }
/* ================= PINS ================= */
function loadPinsSafe() {
if (typeof loadPins === "function") {
loadPins();

return;

}
const main = document.getElementById( "mainContent" );
if (!main) return;
main.innerHTML = `
<h3>PIN Management</h3>
<p>PIN module not loaded.</p>
`;
/* ================= SETTINGS ================= */
function loadSettings() {
const main = document.getElementById( "mainContent" );
if (!main) return;
main.innerHTML = `
<h3>System Settings</h3>
<p>Settings module will be connected here.</p>
`;
/* ================= LOGOUT ================= */
function logout() {
redirectLogin(); }
/* ================= EXPORTS ================= */
window.loadHome = loadHome; window.loadUsers = loadUsers; window.loadCreateAdmin = loadCreateAdmin; window.loadPinsSafe = loadPinsSafe; window.loadSettings = loadSettings; window.logout = logout;
/* ================= MODULE FLAGS ================= */
window.SYSTEM_ADMIN_DASHBOARD = true;
window.SYSTEM_ADMIN_DASHBOARD_MODULE = {
loaded: true,
name: "system_admin_dashboard",
time: Date.now() };
/* ================= SAFE STARTUP ================= */
document.addEventListener( "DOMContentLoaded", function () {
try {

  initPage();
  checkAuth();
  bindEvents();
  loadHome();

  console.log(
    "[SYSTEM ADMIN DASHBOARD] SAFE INIT COMPLETE"
  );

} catch (err) {

  console.error(
    "[SYSTEM ADMIN DASHBOARD INIT ERROR]",
    err
  );
}

} );
console.log( "[SYSTEM ADMIN DASHBOARD] MODULE LOADED OK" );

