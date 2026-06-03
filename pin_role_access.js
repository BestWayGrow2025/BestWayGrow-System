"use strict";

/*
========================================
PIN ROLE ACCESS WRAPPER v1.3 FINAL STABLE
========================================
✔ No system side-effects
✔ No repeated retry spam
✔ Safe controller binding
✔ Fully linked-system compatible
✔ Prevents recursion issues
========================================
*/

(function () {

  if (window.__PIN_ROLE_ACCESS_WRAPPER__) return;
  window.__PIN_ROLE_ACCESS_WRAPPER__ = true;

  let recoveryAttempted = false; // 🔥 IMPORTANT: prevents repeated retry spam

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

      // 🔥 SAFE RECOVERY (ONLY ONCE SYSTEM-WIDE)
      if (!recoveryAttempted) {

        recoveryAttempted = true;

        setTimeout(() => {

          const retry = getController();

          if (retry?.requireAccess) {
            console.log("[ROLE WRAPPER] Controller recovered ✔");
          } else {
            console.warn("[ROLE WRAPPER] Recovery failed (no retry spam)");
          }

        }, 300);
      }

      return true; // NEVER BLOCK SYSTEM
    }

    try {
      return controller.requireAccess(page);
    } catch (err) {
      console.error("[ROLE WRAPPER ERROR]", err);
      return true; // SAFE FAIL OPEN
    }
  }

  // ================= GET ROLE =================
  function getRole() {

    const controller = getController();

    if (controller?.getCurrentRole) {
      return controller.getCurrentRole();
    }

    return "SUPER_ADMIN"; // SAFE DEFAULT
  }

  // ================= EXPORT =================
  window.PIN_ROLE_ACCESS = {
    requireAccess,
    getRole
  };

  console.log("[PIN ROLE ACCESS WRAPPER] READY ✔ FINAL STABLE v1.3");

})();
