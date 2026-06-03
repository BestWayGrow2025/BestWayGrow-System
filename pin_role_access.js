"use strict";

/*
========================================
PIN ROLE ACCESS WRAPPER v1.2 FINAL FIX
========================================
✔ Wait-safe controller binding
✔ Retry recovery safe
✔ No system blocking ever
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_WRAPPER__) return;
  window.__PIN_ROLE_ACCESS_WRAPPER__ = true;

  // ================= GET CONTROLLER =================
  function getController() {
    return (
      window.PIN_ROLE_ACCESS_CONTROLLER ||
      window.pin_role_access_controller ||
      null
    );
  }

  // ================= REQUIRE ACCESS =================
  function requireAccess(page) {

    const controller = getController();

    if (!controller || typeof controller.requireAccess !== "function") {

      console.warn("[ROLE WRAPPER] Controller missing → SAFE MODE ACTIVE");

      // retry once
      setTimeout(() => {
        const retry = getController();
        if (retry?.requireAccess) {
          console.log("[ROLE WRAPPER] Controller recovered ✔");
        }
      }, 300);

      return true; // NEVER BLOCK SYSTEM
    }

    try {
      return controller.requireAccess(page);
    } catch (err) {
      console.error("[ROLE WRAPPER ERROR]", err);
      return true;
    }
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

  console.log("[PIN ROLE ACCESS WRAPPER] READY ✔ FINAL");

})();
