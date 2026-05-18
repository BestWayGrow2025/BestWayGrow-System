"use strict";

/*
========================================
MASTER BOOT CONTROLLER v1.2 (ENTERPRISE FINAL)
========================================
✔ Controlled startup sequence
✔ Prevents undefined init functions
✔ Guarantees CORE → ORCHESTRATOR → WIRING
✔ Event-driven SYSTEM_READY architecture
✔ Safe re-entry protection
✔ Duplicate load protection
✔ Global bootSystem exposure
✔ Production stable boot layer
========================================
*/

(function () {

  // ========================================
  // DUPLICATE LOAD PROTECTION
  // ========================================
  if (window.__BOOT_MANAGER__) {
    console.log("[BOOT] Boot Manager Already Loaded");
    return;
  }

  window.__BOOT_MANAGER__ = {
    loaded: true,
    version: "1.2"
  };

  console.log("[BOOT] Boot Manager Loaded");

  // ================= GLOBAL BOOT STATE =================
  window.__SYSTEM_BOOT__ = window.__SYSTEM_BOOT__ || {
    started: false,
    coreReady: false,
    orchestratorReady: false,
    wiringReady: false,
    ready: false,
    version: "1.2",
    startedAt: null,
    completedAt: null
  };

  // ================= EVENT BUS (SAFE GLOBAL) =================
  window.SYSTEM_EVENTS = window.SYSTEM_EVENTS || {
    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(event, { detail: data })
      );
    },

    on(event, callback) {
      window.addEventListener(event, function (e) {
        callback(e.detail);
      });
    }
  };

  // ================= SAFE CALL WRAPPER =================
  function safeCall(fn, label) {

    try {

      if (typeof fn === "function") {
        fn();
        console.log(`[BOOT] ${label} OK`);
        return true;
      }

      console.warn(`[BOOT] ${label} NOT FOUND`);
      return false;

    } catch (err) {

      console.error(`[BOOT ERROR] ${label}`, err);
      return false;
    }
  }

  // ================= CORE INIT =================
  function initCore() {
    const ok = safeCall(
      window.initCoreSystem,
      "CORE SYSTEM"
    );

    window.__SYSTEM_BOOT__.coreReady = ok;
    return ok;
  }

  // ================= ORCHESTRATOR INIT =================
  function initOrchestrator() {
    const ok = safeCall(
      window.initOrchestrator,
      "ORCHESTRATOR"
    );

    window.__SYSTEM_BOOT__.orchestratorReady = ok;
    return ok;
  }

  // ================= AUTO WIRING INIT =================
  function initWiring() {
    const ok = safeCall(
      window.initAutoWiring,
      "AUTO WIRING"
    );

    window.__SYSTEM_BOOT__.wiringReady = ok;
    return ok;
  }

  // ================= FINALIZE SYSTEM =================
  function finalizeBoot() {

    window.__SYSTEM_BOOT__.ready = true;
    window.__SYSTEM_BOOT__.completedAt = Date.now();

    console.log("[BOOT] SYSTEM FULLY READY");

    window.SYSTEM_EVENTS.emit("SYSTEM_READY", {
      timestamp: Date.now(),
      state: window.__SYSTEM_BOOT__
    });
  }

  // ================= BOOT SEQUENCE =================
  function bootSystem() {

    // Prevent re-entry
    if (window.__SYSTEM_BOOT__.started) {
      return;
    }

    window.__SYSTEM_BOOT__.started = true;
    window.__SYSTEM_BOOT__.startedAt = Date.now();

    console.log("[BOOT] STARTING SYSTEM SEQUENCE...");

    // STEP 1 → CORE
    initCore();

    // STEP 2 → ORCHESTRATOR
    initOrchestrator();

    // STEP 3 → AUTO WIRING
    initWiring();

    // STEP 4 → FINAL STABILIZATION
    setTimeout(finalizeBoot, 400);
  }

  // ================= GLOBAL EXPORT =================
  window.bootSystem = bootSystem;

  // ================= SAFE START =================
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      bootSystem
    );
  } else {
    bootSystem();
  }

})();
