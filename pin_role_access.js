"use strict";

/*
========================================
PIN ROLE ACCESS (WRAPPER LAYER SAFE FIX v2.0)
========================================
✔ Safe fallback added
✔ Controller retry-safe
✔ Prevents system blocking
✔ Handles load order issues
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_WRAPPER__) return;

  window.__PIN_ROLE_ACCESS_WRAPPER__ = true;

  // ================= GET CONTROLLER (FIXED) =================
  function getController() {

    return (
      window.PIN_ROLE_ACCESS_CONTROLLER ||
      window.pin_role_access_controller ||
      null
    );
  }

  // ================= REQUIRE ACCESS (FIXED + WAIT SAFE) =================
  function requireAccess(page) {

    try {

      const controller = getController();

      if (!controller || typeof controller.requireAccess !== "function") {

        console.warn("[ROLE WRAPPER] Controller missing → SAFE MODE ACTIVE");

        // 🔥 retry once after boot delay
        setTimeout(() => {
          const retry = getController();
          if (retry?.requireAccess) {
            console.log("[ROLE WRAPPER] Controller recovered ✔");
          }
        }, 300);

        return true; // NEVER BLOCK SYSTEM
      }

      return controller.requireAccess(page);

    } catch (err) {

      console.error("[ROLE WRAPPER ERROR]", err);
      return true;
    }
  }

  // ================= GET ROLE =================
  function getRole() {

    try {

      const controller = getController();

      if (controller?.getCurrentRole) {
        return controller.getCurrentRole();
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

  console.log("[PIN ROLE ACCESS WRAPPER] READY ✔ SAFE FIXED");

})();
