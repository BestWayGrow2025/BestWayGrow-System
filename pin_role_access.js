"use strict";

/*
========================================
PIN ROLE ACCESS (WRAPPER LAYER ONLY)
========================================
✔ No duplication of controller logic
✔ Uses pin_role_access_controller.js
✔ Safe alias for router compatibility
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_WRAPPER__) return;

  window.__PIN_ROLE_ACCESS_WRAPPER__ = true;

  // ================= DELEGATE TO CONTROLLER =================
  function requireAccess(page) {

    if (!window.PIN_ROLE_ACCESS_CONTROLLER?.requireAccess) {

      console.error("[ROLE WRAPPER] Controller missing");

      return false;
    }

    return window.PIN_ROLE_ACCESS_CONTROLLER.requireAccess(page);
  }

  function getRole() {

    if (window.PIN_ROLE_ACCESS_CONTROLLER?.getCurrentRole) {
      return window.PIN_ROLE_ACCESS_CONTROLLER.getCurrentRole();
    }

    return "USER";
  }

  // ================= EXPORT =================
  window.PIN_ROLE_ACCESS = {

    requireAccess,
    getRole
  };

  console.log("[PIN ROLE ACCESS WRAPPER] READY ✔");

})();
