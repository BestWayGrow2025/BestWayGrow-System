"use strict";

/*
========================================
CORE MODULE ASSET LOADER v2.2 FINAL
========================================
✔ Dynamic HTML Module Loader
✔ Dynamic JavaScript Module Loader
✔ Enterprise Asset Loader
✔ Connector Compatible
✔ One-Way Execution Flow
✔ No Routing Logic
✔ No Business Logic
✔ No Dashboard Recursion
✔ SAFE renderModule Bridge Support
✔ Income Control Connector Support
✔ Duplicate Script Protection
✔ HTML Load Verification
✔ Module Init Verification
✔ Registration Queue Dashboard Support
✔ Production Stable
========================================
*/


// ================= INIT GUARD =================

(function () {

  if (window.__SYSTEM_REAL_MODULE_LOADER__) {
    return;
  }

  window.__SYSTEM_REAL_MODULE_LOADER__ = true;

  console.log(
    "[REAL MODULE LOADER] READY"
  );

})();


// ================= MAIN CONTENT =================

function getSystemMainContent() {

  return document.getElementById(
    "mainContent"
  );

}


// ================= SAFE HTML LOAD =================

async function loadHtmlIntoMain(htmlFile) {

  try {

    const main =
      getSystemMainContent();

    if (!main) {

      throw new Error(
        "mainContent not found"
      );

    }

    const response =
      await fetch(htmlFile);

    if (!response.ok) {

      throw new Error(
        "Failed to load: " + htmlFile
      );

    }

    const html =
      await response.text();


    /*
    ========================================
    RENDER MODULE BRIDGE
    ========================================
    */

    if (
      typeof window.renderModule ===
      "function"
    ) {

      window.renderModule(
        "module",
        html
      );

    }

    else {

      /*
      Safe fallback.
      No renderModule dependency.
      */

      main.innerHTML = html;

    }


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

  return new Promise(
    function (resolve, reject) {

      try {

        const existing =
          Array.from(
            document.scripts
          ).some(
            function (script) {

              return (
                script.src &&
                script.src.includes(
                  scriptFile
                )
              );

            }
          );


        if (existing) {

          console.log(
            "[MODULE SCRIPT ALREADY LOADED]",
            scriptFile
          );

          resolve(true);

          return;

        }


        const script =
          document.createElement(
            "script"
          );


        script.src =
          scriptFile;

        script.async =
          false;

        script.dataset.systemModule =
          scriptFile;


        script.onload =
          function () {

            console.log(
              "[MODULE SCRIPT LOADED]",
              scriptFile
            );

            resolve(true);

          };


        script.onerror =
          function () {

            reject(
              new Error(
                "Failed script load: " +
                scriptFile
              )
            );

          };


        document.body.appendChild(
          script
        );


      } catch (err) {

        reject(err);

      }

    }
  );

}


// ================= GENERIC MODULE LOADER =================

async function loadRealModule(config = {}) {

  try {

    if (!config.html) {

      throw new Error(
        "Missing html file"
      );

    }


    // ========================================
    // STEP 1 — LOAD HTML
    // ========================================

    const htmlLoaded =
      await loadHtmlIntoMain(
        config.html
      );


    if (!htmlLoaded) {

      throw new Error(
        "HTML module failed: " +
        config.html
      );

    }


    // ========================================
    // STEP 2 — LOAD JAVASCRIPT
    // ========================================

    if (config.js) {

      await loadScriptOnce(
        config.js
      );

    }


    // ========================================
    // STEP 3 — RESOLVE INITIALIZER
    // ========================================

    const initFn =
      config.init ||
      config.initFunction;


    if (initFn) {

      if (
        typeof window[initFn] !==
        "function"
      ) {

        throw new Error(
          "Module initializer not found: " +
          initFn
        );

      }


      console.log(
        "[MODULE INIT]",
        initFn
      );


      const result =
        await window[initFn]();


      console.log(
        "[MODULE INIT COMPLETE]",
        initFn,
        result
      );

    }


    // ========================================
    // SUCCESS
    // ========================================

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

  const html = `

    <div class="dashboard-home">

      <h2>
        🏠 SUPER ADMIN CONTROL CENTER
      </h2>

      <p>
        Enterprise control layer active.
      </p>

      <div>

        <h3>
          System Status
        </h3>

        <ul>

          <li>✔ Dashboard Active</li>
          <li>✔ Routing Active</li>
          <li>✔ Module Loader Active</li>
          <li>✔ Enterprise Core Active</li>

        </ul>

      </div>

    </div>

  `;


  if (
    typeof window.renderModule ===
    "function"
  ) {

    window.renderModule(
      "home",
      html
    );

  }

  else {

    const main =
      getSystemMainContent();

    if (main) {

      main.innerHTML =
        html;

    }

  }


  return true;

}


// ========================================
// CREATE SYSTEM ADMIN
// ========================================

function loadCreateSystemAdminRealModule() {

  return loadRealModule({

    html:
      "super_admin_system_admin_creation_dashboard.html",

    js:
      "super_admin_system_admin_creation_controller.js",

    init:
      "startSuperAdminCreateSystemAdmin"

  });

}


// ========================================
// SYSTEM ADMIN PANEL
// ========================================

function loadSystemAdminPanelModule() {

  return loadRealModule({

    html:
      "super_admin_system_control_dashboard.html",

    js:
      "super_admin_system_control_authority.js",

    init:
      "initPage"

  });

}


// ========================================
// PIN MASTER
// ========================================

function loadPinMasterRealModule() {

  return loadRealModule({

    html:
      "system_admin_pin_request_panel.html",

    js:
      "system_admin_pin_request_dashboard.js"

  });

}


// ========================================
// REPORTS
// ========================================

function loadReportsRealModule() {

  return loadRealModule({

    html:
      "admin_reporting_dashboard.html",

    js:
      "admin_reporting_dashboard.js"

  });

}


// ========================================
// USERS / REGISTRATION APPROVAL
// ========================================

function loadUsersRealModule() {

  return loadRealModule({

    html:
      "platform_registration_approval_dashboard.html",

    js:
      "platform_registration_approval_dashboard.js",

    init:
      "initRegistrationApprovalDashboard"

  });

}


// ========================================
// INCOME CONTROL
// ========================================

function loadIncomeControlRealModule() {

  try {

    if (
      typeof window.initIncomeControl ===
      "function"
    ) {

      const result =
        window.initIncomeControl();


      console.log(
        "[INCOME CONTROL] ACTIVE",
        result
      );


      return true;

    }


    console.error(
      "[INCOME CONTROL] INIT FUNCTION NOT FOUND"
    );


    return false;


  } catch (err) {

    console.error(
      "[INCOME CONTROL ERROR]",
      err
    );


    return false;

  }

}


// ========================================
// EXPORTS
// ========================================

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


window.loadIncomeControlRealModule =
  loadIncomeControlRealModule;


