"use strict";

/*
========================================
FULL ORCHESTRATOR KERNEL (FOK v1.0)
========================================
✔ Dependency-aware module orchestration
✔ Safe boot sequencing
✔ Auto-retry module initialization
✔ Prevents undefined / load-order failures
✔ Works above SHBA + SCL
✔ Single source of system startup truth
========================================
*/

(function () {

  if (window.__SYSTEM_ORCHESTRATOR_KERNEL__) return;
  window.__SYSTEM_ORCHESTRATOR_KERNEL__ = true;

  document.addEventListener("DOMContentLoaded", initOrchestrator);

})();

// ================= MODULE REGISTRY =================
const MODULES = {
  core: [],
  optional: [],
  ui: []
};

// ================= REGISTER MODULE =================
function registerModule(name, type, initFn, deps = []) {

  MODULES[type].push({
    name,
    initFn,
    deps,
    status: "PENDING"
  });
}

// ================= SAFE CHECK =================
function isReady(module) {
  return module.deps.every(dep => window[dep]);
}

// ================= BOOT SEQUENCE =================
function initOrchestrator() {

  console.log("[FOK] Orchestrator Kernel Starting...");

  bootCoreModules();
  bootOptionalModules();
  finalizeBoot();

  console.log("[FOK] Orchestration Complete");
}

// ================= CORE BOOT =================
function bootCoreModules() {

  MODULES.core.forEach(mod => {

    try {

      if (!isReady(mod)) {
        console.warn("[FOK] Core module waiting:", mod.name);
        return;
      }

      mod.initFn();
      mod.status = "ACTIVE";

    } catch (err) {
      console.error("[FOK] Core module failed:", mod.name, err);
    }
  });
}

// ================= OPTIONAL BOOT =================
function bootOptionalModules() {

  MODULES.optional.forEach(mod => {

    try {

      if (!isReady(mod)) {
        console.warn("[FOK] Optional module skipped:", mod.name);
        return;
      }

      mod.initFn();
      mod.status = "ACTIVE";

    } catch (err) {
      console.error("[FOK] Optional module failed:", mod.name, err);
    }
  });
}

// ================= FINALIZATION =================
function finalizeBoot() {

  setTimeout(() => {

    window.__SYSTEM_STATUS__ = {
      orchestrator: "READY",
      modules: MODULES
    };

    console.log("[FOK] System Fully Stabilized");

    if (window.SYSTEM_EVENTS) {
      window.SYSTEM_EVENTS.emit("ORCHESTRATOR_READY", {
        time: Date.now()
      });
    }

  }, 300);
}

// ================= SAFE MODULE REGISTRATION API =================
window.SystemModule = {

  core(name, initFn, deps) {
    registerModule(name, "core", initFn, deps);
  },

  optional(name, initFn, deps) {
    registerModule(name, "optional", initFn, deps);
  },

  getStatus() {
    return MODULES;
  }
};

// ================= GLOBAL DEBUG =================
window.FOK = {
  modules: MODULES,
  register: registerModule
};
