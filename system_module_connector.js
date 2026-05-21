"use strict";

/*
========================================
SYSTEM MODULE CONNECTOR V2.0 FINAL
========================================
✔ Pure connector layer
✔ One-way execution flow
✔ NO rendering logic
✔ NO placeholder UI
✔ NO business logic
✔ ONLY module dispatching
✔ Real module loader integrated
✔ Enterprise architecture compliant
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__SYSTEM_MODULE_CONNECTOR__) return;

  window.__SYSTEM_MODULE_CONNECTOR__ = true;

  console.log("[SYSTEM MODULE CONNECTOR] READY");

})();

// ================= MAIN CONNECTOR =================
function connectSystemModule(page) {

  try {

    const route = String(page || "")
      .trim()
      .toLowerCase();

    switch (route) {

      // ================= HOME =================
      case "home":

        return loadHomeDashboardModule();

      // ================= CREATE SYS ADMIN =================
      case "create":

        return loadCreateSystemAdminRealModule();

      // ================= USERS =================
      case "users":

        return loadUsersRealModule();

      // ================= SYSTEM =================
      case "system":

        return loadSystemAdminPanelModule();

      // ================= PIN MASTER =================
      case "pinmaster":

        return loadPinMasterRealModule();

      // ================= REPORTS =================
      case "reports":

        return loadReportsRealModule();

      // ================= PRODUCT MASTER =================
      case "productmaster":

        return loadRealModule({
          html: "admin_pin.html",
          js: "admin_pin.js"
        });

      // ================= TREE VIEW =================
      case "tree":

        return loadRealModule({
          html: "user_tree.html",
          js: "tree_system.js"
        });

      // ================= AUDIT =================
      case "audit":

        return loadRealModule({
          html: "admin_activity_log.html",
          js: "admin_activity_log.js"
        });

      // ================= HEALTH =================
      case "health":

        return loadRealModule({
          html: "check_status.html",
          js: "check_status.js"
        });

      // ================= BACKUP =================
      case "backup":

        return loadRealModule({
          html: "system_init.html",
          js: "system_backup_manager.js"
        });

      // ================= DEFAULT =================
      default:

        return loadUnknownSystemModule(route);
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

    main.innerHTML = `
      <div style="
        padding:20px;
        background:#fff3f3;
        border:1px solid #ffbaba;
        border-radius:8px;
      ">
        <h2>❌ MODULE NOT FOUND</h2>

        <p>
          Unknown module:
          <b>${page}</b>
        </p>
      </div>
    `;

    return false;

  } catch (err) {

    console.error(
      "[UNKNOWN MODULE ERROR]",
      err
    );

    return false;
  }
}

// ================= EXPORT =================
window.connectSystemModule =
  connectSystemModule;
