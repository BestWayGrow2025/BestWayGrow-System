"use strict";

/*
========================================
FULL ORCHESTRATOR KERNEL (FOK v1.2 FINAL)
========================================
✔ Boot Manager compatible
✔ No automatic self-start
✔ Safe duplicate protection
✔ Dependency-aware module orchestration
✔ Core and optional module boot
✔ SYSTEM_READY driven initialization
✔ Global initOrchestrator exposure
✔ ORCHESTRATOR_READY event emission
✔ Production stable
========================================
*/

(function () {

  // ================= DUPLICATE LOAD PROTECTION =================
  if (window.__SYSTEM_ORCHESTRATOR_KERNEL__) {
    console.log("[FOK] Already Loaded");
    return;
  }

  window.__SYSTEM_ORCHESTRATOR_KERNEL__ = true;

  console.log("[FOK] LOADING");

  // ================= MODULE STORE =================
  window.FOK_MODULES = window.FOK_MODULES || {
    core: [],
    optional: [],
    ui: []
  };

  /* ========================================
     REGISTER MODULE
  ======================================== */

  function registerModule(name, type, initFn, deps = []) {

    if (!name || typeof initFn !== "function") {
      console.warn("[FOK] Invalid module registration:", name);
      return;
    }

    if (!window.FOK_MODULES[type]) {
      window.FOK_MODULES[type] = [];
    }

    // Prevent duplicate registrations
    const exists = window.FOK_MODULES[type].some(
      mod => mod.name === name
    );

    if (exists) {
      console.log("[FOK] Module already registered:", name);
      return;
    }

    window.FOK_MODULES[type].push({
      name: name,
      initFn: initFn,
      deps: Array.isArray(deps) ? deps : [],
      status: "PENDING",
      lastError: null,
      initializedAt: null
    });

    console.log("[FOK] Registered:", type.toUpperCase(), name);
  }

  /* ========================================
     DEPENDENCY CHECK
  ======================================== */

  function isReady(module) {

    if (!module || !Array.isArray(module.deps)) {
      return true;
    }

    return module.deps.every(dep => !!window[dep]);
  }

  /* ========================================
     BOOT MODULE LIST
  ======================================== */

  function bootModules(type) {

    const modules = window.FOK_MODULES[type] || [];

    modules.forEach(mod => {

      // Skip already active modules
      if (mod.status === "ACTIVE") {
        return;
      }

      try {

        // Dependency check
        if (!isReady(mod)) {
          console.warn("[FOK] Waiting for dependencies:", mod.name);
          return;
        }

        // Execute module initializer
        mod.initFn();

        // Update status
        mod.status = "ACTIVE";
        mod.lastError = null;
        mod.initializedAt = Date.now();

        console.log("[FOK] ACTIVE:", mod.name);

      } catch (err) {

        mod.status = "FAILED";
        mod.lastError = err.message;

        console.error("[FOK] ERROR:", mod.name, err);
      }
    });
  }

  /* ========================================
     CORE BOOT
  ======================================== */

  function bootCoreModules() {
    bootModules("core");
  }

  /* ========================================
     OPTIONAL BOOT
  ======================================== */

  function bootOptionalModules() {
    bootModules("optional");
  }

  /* ========================================
     UI BOOT (OPTIONAL)
  ======================================== */

  function bootUIModules() {
    bootModules("ui");
  }

  /* ========================================
     FINALIZE
  ======================================== */

  function finalizeBoot() {

    window.__SYSTEM_STATUS__ = {
      orchestrator: "READY",
      timestamp: Date.now(),
      modules: window.FOK_MODULES
    };

    console.log("[FOK] SYSTEM STABLE");

    if (window.SYSTEM_EVENTS &&
        typeof window.SYSTEM_EVENTS.emit === "function") {

      window.SYSTEM_EVENTS.emit("ORCHESTRATOR_READY", {
        time: Date.now(),
        status: window.__SYSTEM_STATUS__
      });
    }
  }

  /* ========================================
     MAIN INITIALIZER
  ======================================== */

  function initOrchestrator() {

    // Prevent duplicate initialization
    if (window.__FOK_INITIALIZED__) {
      console.log("[FOK] Already Initialized");
      return;
    }

    window.__FOK_INITIALIZED__ = true;

    console.log("[FOK] Orchestrator Starting...");

    // Boot in strict order
    bootCoreModules();
    bootOptionalModules();
    bootUIModules();

    // Final stabilization
    setTimeout(finalizeBoot, 200);

    console.log("[FOK] Orchestration Complete");
  }

  /* ========================================
     PUBLIC API
  ======================================== */

  window.SystemModule = {

    core(name, initFn, deps = []) {
      registerModule(name, "core", initFn, deps);
    },

    optional(name, initFn, deps = []) {
      registerModule(name, "optional", initFn, deps);
    },

    ui(name, initFn, deps = []) {
      registerModule(name, "ui", initFn, deps);
    },

    getStatus() {
      return window.FOK_MODULES;
    }
  };

  /* ========================================
     GLOBAL EXPORTS (CRITICAL FOR BOOT MANAGER)
  ======================================== */

  // Boot Manager calls this function directly
  window.initOrchestrator = initOrchestrator;

  // Debug interface
  window.FOK = {
    modules: window.FOK_MODULES,
    register: registerModule,
    init: initOrchestrator,
    getStatus: function () {
      return window.FOK_MODULES;
    }
  };

  console.log("[FOK] READY");

})();
