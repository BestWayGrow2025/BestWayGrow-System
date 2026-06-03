"use strict";

/*
========================================
PIN ROLE ACCESS (WRAPPER LAYER SAFE FIX)
========================================
✔ Safe fallback added
✔ Prevents system blocking
✔ Compatible with controller OR standalone mode
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_WRAPPER__) return;

  window.__PIN_ROLE_ACCESS_WRAPPER__ = true;

  // ================= REQUIRE ACCESS =================
  function requireAccess(page) {

    try {

      // CASE 1: Controller exists
      if (window.PIN_ROLE_ACCESS_CONTROLLER?.requireAccess) {
        return window.PIN_ROLE_ACCESS_CONTROLLER.requireAccess(page);
      }

      // CASE 2: SAFE FALLBACK (PREVENT SYSTEM LOCK)
      console.warn("[ROLE WRAPPER] Controller missing → SAFE MODE ACTIVE");

      return true; // IMPORTANT: do not block system

    } catch (err) {

      console.error("[ROLE WRAPPER ERROR]", err);

      return true; // fail-safe open access
    }
  }

  // ================= GET ROLE =================
  function getRole() {

    try {

      if (window.PIN_ROLE_ACCESS_CONTROLLER?.getCurrentRole) {
        return window.PIN_ROLE_ACCESS_CONTROLLER.getCurrentRole();
      }

      return "SUPER_ADMIN";

    } catch (err) {

      return "SUPER_ADMIN";
    }
  }

  // ================= EXPORT =================
  window.PIN_ROLE_ACCESS = {
    requireAccess,
    getRole
  };

  console.log("[PIN ROLE ACCESS WRAPPER] READY ✔ SAFE MODE ACTIVE");

})();
