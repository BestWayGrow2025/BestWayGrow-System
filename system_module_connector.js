"use strict";

/*
========================================
SYSTEM MODULE CONNECTOR V2.2 FINAL
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

  if (window.__SYSTEM_MODULE_CONNECTOR__) return;

  window.__SYSTEM_MODULE_CONNECTOR__ = true;

  console.log("[SYSTEM MODULE CONNECTOR] READY");

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
function connectSystemModule(page) {

  try {

    const main =
      document.getElementById("mainContent");

    if (!main) {

      console.error(
        "[SYSTEM CONNECTOR] mainContent missing"
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
        html: "rank_master.html",
        js: "rank_master_view.js"
      }
    );

  // ================= TREE VIEW =================
  case "tree":

    return safeCall(
      loadRealModule,
      false,
      {
        html: "user_tree.html",
        js: "tree_system.js"
      }
    );

      // ================= AUDIT =================
      case "audit":

        return safeCall(
          loadRealModule,
          false,
          {
            html: "admin_activity_log.html",
            js: "admin_activity_log.js"
          }
        );

      // ================= HEALTH =================
      case "health":

        return safeCall(
          loadRealModule,
          false,
          {
            html: "check_status.html",
            js: "check_status.js"
          }
        );

      // ================= BACKUP =================
      case "backup":

        return safeCall(
          loadRealModule,
          false,
          {
            html: "system_backup_panel.html",
            js: "system_backup_manager.js"
          }
        );

      // ================= DEFAULT =================
      default:

        return loadUnknownSystemModule(
          route
        );
    }

  } catch (err) {

    console.error(
      "[SYSTEM MODULE CONNECTOR ERROR]",
      err
    );

    return false;
  }
}

// ================= UNKNOWN MODULE =================
function loadUnknownSystemModule(page) {

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

window.connectSystemModule =
  connectSystemModule;

window.loadUnknownSystemModule =
  loadUnknownSystemModule;
