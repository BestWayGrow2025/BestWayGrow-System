"use strict";

/*
========================================
SYSTEM MODULE CONNECTOR V1.0
========================================
✔ Connects router → real modules
✔ One-way execution flow
✔ No routing logic inside
✔ No business logic
✔ Only module activation
✔ Enterprise structure
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_MODULE_CONNECTOR__) return;

  window.__SYSTEM_MODULE_CONNECTOR__ = true;

})();

// ================= MAIN CONNECTOR =================
function connectSystemModule(page) {

  try {

    switch (String(page || "").toLowerCase()) {

      // ================= HOME =================
      case "home":

        renderHomeModule();
        break;

      // ================= CREATE SYS ADMIN =================
      case "create":

        renderCreateSystemAdminModule();
        break;

      // ================= USERS =================
      case "users":

        renderUsersModule();
        break;

      // ================= SYSTEM =================
      case "system":

        renderSystemModule();
        break;

      // ================= PIN MASTER =================
      case "pinmaster":

        renderPinMasterModule();
        break;

      // ================= PRODUCT MASTER =================
      case "productmaster":

        renderProductMasterModule();
        break;

      // ================= REPORTS =================
      case "reports":

        renderReportsModule();
        break;

      default:

        renderUnknownModule(page);
    }

  } catch (err) {

    console.error("[MODULE CONNECTOR ERROR]", err);
  }
}

// ================= MAIN TARGET =================
function getMainContent() {

  return document.getElementById("mainContent");
}

// ================= HOME =================
function renderHomeModule() {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>🏠 Home Dashboard</h2>
    <p>System operational.</p>
  `;
}

// ================= CREATE SYSTEM ADMIN =================
function renderCreateSystemAdminModule() {

  const main = getMainContent();

  if (!main) return;

  // Existing repo integration
  if (typeof loadCreateSystemAdminPanel === "function") {

    loadCreateSystemAdminPanel();
    return;
  }

  main.innerHTML = `
    <h2>👑 Create System Admin</h2>
    <p>System Admin module ready.</p>
  `;
}

// ================= USERS =================
function renderUsersModule() {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>👥 User Management</h2>
    <p>User management module connected.</p>
  `;
}

// ================= SYSTEM =================
function renderSystemModule() {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>⚙️ System Panel</h2>
    <p>System controls connected.</p>
  `;
}

// ================= PIN MASTER =================
function renderPinMasterModule() {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>📌 PIN Master</h2>

    <div style="margin-bottom:15px;">

      <button onclick="openAssignPinPanel()">
        Assign PIN
      </button>

      <button onclick="openPinRequestPanel()">
        Request PIN
      </button>

      <button onclick="openApprovePanel({requestId:'MANUAL'})">
        Approve
      </button>

    </div>

    <div id="pinLivePanel"></div>
  `;

  // Auto load live panel
  if (typeof initLivePanel === "function") {
    initLivePanel();
  }
}

// ================= PRODUCT MASTER =================
function renderProductMasterModule() {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>📦 Product Master</h2>
    <p>Product management module connected.</p>
  `;
}

// ================= REPORTS =================
function renderReportsModule() {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>📊 Reports</h2>
    <p>Reports module connected.</p>
  `;
}

// ================= UNKNOWN =================
function renderUnknownModule(page) {

  const main = getMainContent();

  if (!main) return;

  main.innerHTML = `
    <h2>❌ Module Not Found</h2>
    <p>${page}</p>
  `;
}

// ================= EXPORT =================
window.connectSystemModule = connectSystemModule;
