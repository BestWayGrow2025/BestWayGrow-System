"use strict";

/*
========================================
SYSTEM REAL MODULE LOADER V2.0 FINAL
========================================
✔ Loads REAL dashboard modules
✔ Connector-compatible
✔ One-way execution flow
✔ No routing logic
✔ No business logic
✔ No dashboard recursion
✔ Real module activation only
✔ Enterprise architecture safe
✔ FIXED: Home module recursion issue
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_REAL_MODULE_LOADER__) return;

  window.__SYSTEM_REAL_MODULE_LOADER__ = true;

  console.log("[REAL MODULE LOADER] READY");

})();

// ================= MAIN CONTENT =================
function getSystemMainContent() {

  return document.getElementById("mainContent");
}

// ================= SAFE HTML LOAD =================
async function loadHtmlIntoMain(htmlFile) {

  try {

    const main = getSystemMainContent();

    if (!main) {
      throw new Error("mainContent not found");
    }

    const response = await fetch(htmlFile);

    if (!response.ok) {
      throw new Error(
        "Failed to load: " + htmlFile
      );
    }

    const html = await response.text();

    main.innerHTML = html;

    return true;

  } catch (err) {

    console.error(
      "[REAL MODULE HTML LOAD ERROR]",
      err
    );

    return false;
  }
}

// ================= SAFE SCRIPT LOAD =================
function loadScriptOnce(scriptFile) {

  return new Promise((resolve, reject) => {

    try {

      // ALREADY LOADED
      const existing =
        document.querySelector(
          'script[data-system-module="' +
          scriptFile +
          '"]'
        );

      if (existing) {

        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src = scriptFile;

      script.async = false;

      script.dataset.systemModule =
        scriptFile;

      script.onload = function () {

        resolve(true);
      };

      script.onerror = function () {

        reject(
          new Error(
            "Failed script load: " +
            scriptFile
          )
        );
      };

      document.body.appendChild(script);

    } catch (err) {

      reject(err);
    }

  });
}

// ================= GENERIC MODULE LOADER =================
async function loadRealModule(config = {}) {

  try {

    if (!config.html) {
      throw new Error("Missing html file");
    }

    // STEP 1 → HTML
    await loadHtmlIntoMain(config.html);

    // STEP 2 → JS
    if (config.js) {
      await loadScriptOnce(config.js);
    }

    // STEP 3 → INIT
    if (
      config.initFunction &&
      typeof window[
        config.initFunction
      ] === "function"
    ) {

      window[
        config.initFunction
      ]();
    }

    console.log(
      "[REAL MODULE LOADER] SUCCESS:",
      config.html
    );

    return true;

  } catch (err) {

    console.error(
      "[REAL MODULE LOADER ERROR]",
      err
    );

    return false;
  }
}

// ========================================
// HOME MODULE
// ========================================
function loadHomeDashboardModule() {

  try {

    const main = getSystemMainContent();

    if (!main) return false;

    main.innerHTML = `
      <div class="dashboard-home">

        <h2>
          🏠 SUPER ADMIN CONTROL CENTER
        </h2>

        <p>
          Enterprise control layer active.
        </p>

        <div style="
          margin-top:20px;
          padding:15px;
          border:1px solid #ddd;
          border-radius:8px;
        ">

          <h3>System Status</h3>

          <ul>
            <li>✔ Dashboard Active</li>
            <li>✔ Routing Active</li>
            <li>✔ Module Loader Active</li>
            <li>✔ Enterprise Core Active</li>
          </ul>

        </div>

      </div>
    `;

    return true;

  } catch (err) {

    console.error(
      "[HOME MODULE ERROR]",
      err
    );

    return false;
  }
}

// ========================================
// CREATE SYSTEM ADMIN
// ========================================
function loadCreateSystemAdminRealModule() {

  return loadRealModule({

    html:
      "super_admin_create_system_admin.html",

    js:
      "super_admin_create_system_admin.js"
  });
}

// ========================================
// SYSTEM ADMIN PANEL
// ========================================
function loadSystemAdminPanelModule() {

  return loadRealModule({

    html:
      "system_admin_dashboard.html",

    js:
      "system_admin_dashboard.js"
  });
}

// ========================================
// PIN MASTER PANEL
// ========================================
function loadPinMasterRealModule() {

  return loadRealModule({

    html:
      "admin_pin_panel.html",

    js:
      "admin_pin_panel.js"
  });
}

// ========================================
// REPORTS MODULE
// ========================================
function loadReportsRealModule() {

  return loadRealModule({

    html:
      "admin_reports.html",

    js:
      "admin_reports.js"
  });
}

// ========================================
// USERS MODULE
// ========================================
function loadUsersRealModule() {

  return loadRealModule({

    html:
      "registration_approval.html",

    js:
      "registration_approval.js"
  });
}

// ================= EXPORTS =================
window.loadRealModule =
  loadRealModule;

window.loadHomeDashboardModule =
  loadHomeDashboardModule;

window.loadCreateSystemAdminRealModule =
  loadCreateSystemAdminRealModule;

window.loadSystemAdminPanelModule =
  loadSystemAdminPanelModule;

window.loadPinMasterRealModule =
  loadPinMasterRealModule;

window.loadReportsRealModule =
  loadReportsRealModule;

window.loadUsersRealModule =
  loadUsersRealModule;
