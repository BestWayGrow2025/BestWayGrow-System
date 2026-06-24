"use strict";

/*
========================================
SYSTEM BOOT CONTROLLER v1.0 FINAL
SINGLE ENTRY POINT - STRICT PIPELINE
========================================
*/

(function () {
  if (window.__BOOT_LOCK__) return;
  window.__BOOT_LOCK__ = true;

  console.log("[BOOT] CONTROLLER START");

  // ================= BOOT STATE =================
  window.__BOOT_STATE__ = {
    started: false,
    dependencies: false,
    session: false,
    autoWiring: false,
    orchestrator: false,
    pin: false,
    ai: false,
    router: false,
    complete: false
  };

  // ================= SAFE RUN =================
  function safeRun(fn, name) {
    try {
      if (typeof fn === "function") {
        fn();
        console.log("[BOOT]", name, "OK");
        return true;
      }
      console.warn("[BOOT]", name, "NOT A FUNCTION");
      return false;
    } catch (err) {
      console.error("[BOOT ERROR]", name, err);
      return false;
    }
  }

  // ================= BOOT PIPELINE =================
  const BOOT_STEPS = [
    ["dependencies", () => window.startDependencyMonitor?.()],
    ["session", () => window.getSession?.()],
    ["autoWiring", () => window.initAutoWiring?.()],
    ["orchestrator", () => window.initOrchestrator?.()],
    ["pin", () => window.initPinLiveOrchestrator?.()],
    ["ai", () => window.initAIOrchestrator?.()],
    ["router", () => window.initSystemPageRouter?.()]
  ];

  // ================= BOOT EXECUTOR =================
  function runBoot() {
    window.__BOOT_STATE__.started = true;

    console.log("[BOOT] SEQUENCE START");

    for (const [key, fn] of BOOT_STEPS) {
      const ok = safeRun(fn, key);
      window.__BOOT_STATE__[key] = ok;
    }

    window.__BOOT_STATE__.complete = true;

    console.log("[BOOT] COMPLETE ✔", window.__BOOT_STATE__);
  }

  // ================= ENTRY =================
  function init() {
    runBoot();
  }

  window.initSystemBoot = init;

  // ================= TRIGGER =================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
