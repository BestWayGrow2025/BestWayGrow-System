"use strict";

/*
========================================
CORE MODULE ROUTER V1.0
========================================
✔ Pure connector layer
✔ One-way execution flow
✔ SAFE module dispatching
✔ NO UI rendering logic
✔ NO business logic
✔ SAFE function guards added
✔ Enterprise production safe
✔ Loader-compatible architecture
✔ mainContent protection added
✔ HTML injection removed
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__CORE_MODULE_ROUTER__ ) return;

  window.__CORE_MODULE_ROUTER__ = true;

 console.log("[CORE MODULE ROUTER] READY");

})();

// ================= SAFE CALL WRAPPER =================
function safeCall(fn, fallback, ...args) {

  try {

    if (typeof fn === "function") {
      return fn(...args);
    }

    console.warn("[MODULE MISSING FUNCTION]", fn);

    return fallback || false;

  } catch (err) {

    console.error("[SAFE CALL ERROR]", err);

    return false;
  }
}

// ================= MAIN CONNECTOR =================
function connectCoreModule(page) {

  try {

    const main =
      document.getElementById("mainContent");

   if (!main) {

  console.error(
    "[CORE MODULE ROUTER] mainContent missing"
  );

  return false;
}

    const route = String(page || "")
      .trim()
      .toLowerCase();

    switch (route) {

      // ================= HOME =================
      case "home":

        return safeCall(
          loadHomeDashboardModule
        );

      // ================= CREATE SYS ADMIN =================
      case "create":

        return safeCall(
          loadCreateSystemAdminRealModule
        );

      // ================= USERS =================
      case "users":

        return safeCall(
          loadUsersRealModule
        );

      // ================= SYSTEM =================
      case "system":

        return safeCall(
          loadSystemAdminPanelModule
        );

      // ================= PIN MASTER =================
      case "pinmaster":

        return safeCall(
          loadPinMasterRealModule
        );

     // ================= REPORTS =================
case "reports":

  return safeCall(
    loadReportsRealModule
  );


// ================= INCOME CONTROL =================
case "incomecontrol":

  return safeCall(
    loadRealModule,
    false,
    {
     html: "system_income_policy_dashboard.html",
js: "system_income_policy_dashboard.js",
init: "initIncomeControlUI"
    }
  );
        
// ================= PRODUCT MASTER =================
case "productmaster":

    return safeCall(
      loadRealModule,
      false,
      {
        html: "product_master_connector.html",
        js: "product_master_connector.js"
      }
    );

  // ================= RANK MASTER =================
  case "rankmaster":

    return safeCall(
      loadRealModule,
      false,
      {
       html: "platform_rank_master_registry_dashboard.html",
js: "platform_rank_registry_dashboard_view.js"
      }
    );

  // ================= TREE VIEW =================
  case "tree":

    return safeCall(
      loadRealModule,
      false,
      {
        html: "user_tree.html",
       js: "user_tree.js"
      }
    );

      // ================= AUDIT =================
      case "audit":

        return safeCall(
          loadRealModule,
          false,
          {
           html: "platform_activity_audit_dashboard.html",
js: "platform_activity_audit_dashboard.js"
          }
        );

      // ================= HEALTH =================
      case "health":

        return safeCall(
          loadRealModule,
          false,
          {
           html: "platform_status_audit_dashboard.html",
js: "platform_status_audit_dashboard.js"
          }
        );

      // ================= BACKUP =================
     case "backup":

  return safeCall(
    loadRealModule,
    false,
    {
      html: "platform_backup_management_dashboard.html",
      js: "platform_backup_management_dashboard.js"
    }
  );

      // ================= DEFAULT =================
      default:

       return loadUnknownCoreModule(
  route
);
    }

  } catch (err) {

    console.error(
  "[CORE MODULE ROUTER ERROR]",
  err
);

    return false;
  }
}

// ================= UNKNOWN MODULE =================
function loadUnknownCoreModule(page) {

  try {

    const main =
      document.getElementById("mainContent");

    if (!main) return false;

    main.textContent =
      "MODULE NOT FOUND : " + page;

    return false;

  } catch (err) {

    console.error(
      "[UNKNOWN MODULE ERROR]",
      err
    );

    return false;
  }
}

/* ================= EXPORT ================= */

window.connectCoreModule =
  connectCoreModule;

window.loadUnknownCoreModule = loadUnknownCoreModule;
