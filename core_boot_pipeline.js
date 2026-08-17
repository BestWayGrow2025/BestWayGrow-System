"use strict";

/*
========================================
SYSTEM BOOT PIPELINE — COMPATIBILITY LAYER
========================================
✔ Does NOT create a second boot authority
✔ Delegates system startup to KB_044
✔ Preserves initSystemBoot() compatibility API
✔ Prevents duplicate boot execution
✔ Keeps boot authority centralized
========================================
*/

(function () {

  // ========================================
  // DUPLICATE LOAD PROTECTION
  // ========================================

  if (window.__BOOT_PIPELINE_COMPAT__) {
    return;
  }

  window.__BOOT_PIPELINE_COMPAT__ = true;

  // ========================================
  // COMPATIBILITY BOOT ENTRY
  // ========================================

  function initSystemBoot() {

    /*
    ========================================
    AUTHORITATIVE BOOT DELEGATION
    ========================================

    KB_044:
    core_boot_manager.js

    Authoritative function:
    window.bootSystem()

    KB_045 must not independently execute
    dependencies, session, wiring, PIN, AI,
    orchestrator, or router initialization.
    */

    if (typeof window.bootSystem !== "function") {

      console.error(
        "[BOOT PIPELINE] Authoritative bootSystem() NOT FOUND"
      );

      return false;
    }

    return window.bootSystem();
  }

  // ========================================
  // GLOBAL COMPATIBILITY EXPORT
  // ========================================

  window.initSystemBoot = initSystemBoot;

})();
