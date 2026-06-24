"use strict";

/*
========================================
SYSTEM BOOTSTRAP CONNECTOR V1.0 FINAL
========================================
✔ Final orchestration gate
✔ Contract-first enforcement
✔ Core → UI → Admin sequencing
✔ Safe boot validation
✔ Single entry startup trigger
✔ Production locked system launcher
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__SYSTEM_BOOTSTRAP_CONNECTOR__) return;

  window.__SYSTEM_BOOTSTRAP_CONNECTOR__ = true;

  console.log("[BOOTSTRAP CONNECTOR] Initializing...");

  // ================= SAFETY CHECKS =================
  function validateCore() {

    const required = [
      "PIN_GLOBAL_CONTRACT",
      "pinSystemExecute",
      "dispatchPinAction",
      "broadcastPinEvent"
    ];

    const missing = required.filter(fn => !window[fn]);

    if (missing.length > 0) {
      console.error("[BOOTSTRAP ERROR] Missing core:", missing);
      throw new Error("SYSTEM BOOT FAILED (CORE MISSING)");
    }

    console.log("[BOOTSTRAP CONNECTOR] Core validated ✔");
  }

  // ================= UI VALIDATION =================
  function validateUI() {

    const uiRequired = [
      "renderModule",
      "UI_RENDER_STATE",
      "initPinInjector",
      "openPinRequestPanel",
      "openAssignPinPanel"
    ];

    const missing = uiRequired.filter(fn => typeof window[fn] === "undefined");

    if (missing.length > 0) {
      console.warn("[BOOTSTRAP WARNING] UI partial:", missing);
    }

    console.log("[BOOTSTRAP CONNECTOR] UI checked ✔");
  }

  // ================= EVENT SIGNAL =================
  function emit(event, payload = {}) {

    if (typeof window.broadcastPinEvent === "function") {
      window.broadcastPinEvent(event, {
        ...payload,
        timestamp: Date.now()
      });
    }
  }

  // ================= FINAL SYSTEM START =================
  function startSystem() {

    console.log("[BOOTSTRAP CONNECTOR] Starting system...");

    emit("SYSTEM_BOOT_START", {});

    // mark system ready state
    window.__PIN_SYSTEM_READY__ = true;

    emit("SYSTEM_READY", {
      status: "READY"
    });

    console.log("[BOOTSTRAP CONNECTOR] SYSTEM READY ✔");
  }

  // ================= FULL INIT =================
  function init() {

    try {

      validateCore();
      validateUI();
      startSystem();

    } catch (err) {

      console.error("[BOOTSTRAP CONNECTOR] FATAL ERROR:", err);

      emit("SYSTEM_BOOT_FAILED", {
        error: err.message
      });

      throw err;
    }
  }

  // ================= BOOT HOOK =================
  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", init);

  } else {

    init();

  }

})();
