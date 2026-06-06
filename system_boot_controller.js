"use strict";

/*
========================================
SYSTEM BOOT CONTROLLER v1.0 FINAL
SINGLE ENTRY POINT (CLEAN STABLE)
========================================
*/

(function () {

  if (window.__SYSTEM_BOOT_CONTROLLER__) return;
  window.__SYSTEM_BOOT_CONTROLLER__ = true;

  console.log("[BOOT CONTROLLER] INITIALIZING");

  // ================= SAFE START =================
  function safeStart(fn, name) {
    try {
      if (typeof fn === "function") {
        fn();
        console.log("[BOOT]", name, "OK");
      }
    } catch (err) {
      console.error("[BOOT ERROR]", name, err);
    }
  }

  // ================= WAIT FOR DEPENDENCIES =================
  function waitForDependencies(cb) {

    if (window.__DEPENDENCY_READY__) {
      cb();
      return;
    }

    const interval = setInterval(() => {
      if (window.__DEPENDENCY_READY__) {
        clearInterval(interval);
        cb();
      }
    }, 50);
  }

  // ================= BOOT SYSTEM =================
  function bootSystem() {

    console.log("[BOOT] SEQUENCE START");

    // ONLY START DEPENDENCY MONITOR
    safeStart(() => window.startDependencyMonitor?.(), "DEPENDENCY_MONITOR");

    waitForDependencies(() => {

      console.log("[BOOT] DEPENDENCIES READY");

      // SESSION
      safeStart(() => window.getSession?.(), "SESSION_READY");

      // AUTO WIRING
      safeStart(() => window.initAutoWiring?.(), "AUTO_WIRING");

      // ORCHESTRATOR
      safeStart(() => window.initOrchestrator?.(), "ORCHESTRATOR");

      // PIN LIVE
      safeStart(() => window.initPinLiveOrchestrator?.(), "PIN_LIVE");

      // AI ORCHESTRATOR
      safeStart(() => window.initAIOrchestrator?.(), "AI");

      // ROUTER
      safeStart(() => window.initSystemPageRouter?.(), "ROUTER");

      console.log("[BOOT] SYSTEM FULLY STABLE ✔");
    });
  }

  // ================= INIT (ONLY ENTRY) =================
  function init() {
    bootSystem();
  }

  window.initSystemBoot = init;

  // ❌ IMPORTANT: DO NOT AUTO BOOT ANY MODULE HERE EXCEPT THIS
 if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

})();
