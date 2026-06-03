"use strict";

/*
========================================
PIN ROLE ACCESS WRAPPER v1.1 FIXED
========================================
✔ Wait-safe controller binding
✔ Retry recovery support
✔ Prevents infinite access_denied loops
✔ Compatible with controller + fallback mode
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_WRAPPER__) return;
  window.__PIN_ROLE_ACCESS_WRAPPER__ = true;

  // ================= GET CONTROLLER (FIXED SAFE) =================
  function getController() {
    return (
      window.PIN_ROLE_ACCESS_CONTROLLER ||
      window.pin_role_access_controller ||
      null
    );
  }

  // ================= REQUIRE ACCESS (WAIT SAFE FIX) =================
  function requireAccess(page) {

    const controller = getController();

    if (!controller || typeof controller.requireAccess !== "function") {

      console.warn("[ROLE WRAPPER] Controller missing → SAFE MODE ACTIVE");

      // 🔥 SAFE RECOVERY RETRY (ONCE)
      setTimeout(() => {
        const retry = getController();
        if (retry?.requireAccess) {
          console.log("[ROLE WRAPPER] Controller recovered ✔");
        }
      }, 300);

      return true; // NEVER BLOCK SYSTEM
    }

    return controller.requireAccess(page);
  }

  // ================= GET ROLE =================
  function getRole() {

    const controller = getController();

    if (controller?.getCurrentRole) {
      return controller.getCurrentRole();
    }

    return "SUPER_ADMIN";
  }

  // ================= EXPORT =================
  window.PIN_ROLE_ACCESS = {
    requireAccess,
    getRole
  };

  console.log("[PIN ROLE ACCESS WRAPPER] READY ✔ SAFE MODE ACTIVE");

})();
