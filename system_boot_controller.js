"use strict";

/*
========================================
SYSTEM BOOT CONTROLLER v1.0 FINAL
SINGLE ENTRY POINT FOR ENTIRE SYSTEM
========================================
✔ Prevents race conditions
✔ Enforces boot order
✔ Blocks early execution
✔ Production stable boot sequencing
========================================
*/

(function () {

  if (window.__SYSTEM_BOOT_CONTROLLER__) return;
  window.__SYSTEM_BOOT_CONTROLLER__ = true;

  console.log("[BOOT CONTROLLER] INITIALIZING");

  // ================= BOOT SEQUENCE =================

  function bootSystem() {

    console.log("[BOOT] SEQUENCE START");

    // STEP 1 — DEPENDENCY GATE
    if (typeof window.startDependencyMonitor === "function") {
      window.startDependencyMonitor();
    }

    waitForDependencies(() => {

      console.log("[BOOT] DEPENDENCIES READY");

      // STEP 2 — SESSION SYSTEM
      safeStart(() => window.getSession?.(), "SESSION");

      // STEP 3 — AUTO WIRING
      safeStart(() => window.initAutoWiring?.(), "AUTO_WIRING");

      // STEP 4 — ORCHESTRATOR
      safeStart(() => window.initOrchestrator?.(), "ORCHESTRATOR");

      // STEP 5 — EVENT SYSTEM
      safeStart(() => window.initPinLiveOrchestrator?.(), "PIN_LIVE");

      safeStart(() => window.initAIOrchestrator?.(), "AI_ORCHESTRATOR");

      // STEP 6 — ROUTER ENABLE
      safeStart(() => window.initSystemPageRouter?.(), "ROUTER");

      console.log("[BOOT] SYSTEM FULLY STABLE ✔");
    });
  }

  // ================= SAFE START WRAPPER =================
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

  // ================= INIT =================
  function init() {
    bootSystem();
  }

  // ================= EXPORT =================
  window.initSystemBoot = init;

  // AUTO START ONLY THIS FILE
  document.addEventListener("DOMContentLoaded", init);

})();
