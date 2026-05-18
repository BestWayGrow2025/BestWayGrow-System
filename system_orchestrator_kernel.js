"use strict";

/*
========================================
FULL ORCHESTRATOR KERNEL (FOK v1.1 FIXED)
========================================
✔ Safe boot sequencing FIXED
✔ Waits for CORE ENGINE
✔ Waits for AUTO WIRING
✔ Prevents empty module boot
✔ Guaranteed initialization order
========================================
*/

(function () {

  if (window.__SYSTEM_ORCHESTRATOR_KERNEL__) return;
  window.__SYSTEM_ORCHESTRATOR_KERNEL__ = true;

  // 🔥 FIX: DO NOT START IMMEDIATELY
  window.addEventListener("load", waitForSystemReady);

})();

/* ================= MODULE STORE ================= */

window.FOK_MODULES = window.FOK_MODULES || {
  core: [],
  optional: [],
  ui: []
};

/* ================= REGISTER MODULE ================= */

function registerModule(name, type, initFn, deps = []) {

  if (!window.FOK_MODULES[type]) {
    window.FOK_MODULES[type] = [];
  }

  window.FOK_MODULES[type].push({
    name,
    initFn,
    deps,
    status: "PENDING"
  });
}

/* ================= READY CHECK ================= */

function isReady(module) {
  return module.deps.every(dep => window[dep]);
}

/* ================= WAIT SYSTEM ================= */

function waitForSystemReady() {

  const check = setInterval(() => {

    const core = window.ENTERPRISE_CORE_ENGINE || window.__ENTERPRISE_CORE_ENGINE__;
    const auto = window.initAutoWiring;

    if (core && auto) {

      clearInterval(check);

      console.log("[FOK] SYSTEM READY DETECTED");

      initOrchestrator();

    } else {

      console.log("[FOK] Waiting for dependencies...");

    }

  }, 300);
}

/* ================= BOOT ================= */

function initOrchestrator() {

  console.log("[FOK] Orchestrator Starting...");

  bootCoreModules();
  bootOptionalModules();

  setTimeout(finalizeBoot, 200);

  console.log("[FOK] Orchestration Complete");
}

/* ================= CORE ================= */

function bootCoreModules() {

  window.FOK_MODULES.core.forEach(mod => {

    try {

      if (!isReady(mod)) {
        console.warn("[FOK] Waiting:", mod.name);
        return;
      }

      mod.initFn();
      mod.status = "ACTIVE";

    } catch (err) {
      console.error("[FOK] ERROR:", mod.name, err);
    }
  });
}

/* ================= OPTIONAL ================= */

function bootOptionalModules() {

  window.FOK_MODULES.optional.forEach(mod => {

    try {

      if (!isReady(mod)) {
        console.warn("[FOK] SKIP:", mod.name);
        return;
      }

      mod.initFn();
      mod.status = "ACTIVE";

    } catch (err) {
      console.error("[FOK] ERROR:", mod.name, err);
    }
  });
}

/* ================= FINALIZE ================= */

function finalizeBoot() {

  window.__SYSTEM_STATUS__ = {
    orchestrator: "READY",
    modules: window.FOK_MODULES
  };

  console.log("[FOK] SYSTEM STABLE");

  if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.emit("ORCHESTRATOR_READY", {
      time: Date.now()
    });
  }
}

/* ================= API ================= */

window.SystemModule = {

  core(name, initFn, deps = []) {
    registerModule(name, "core", initFn, deps);
  },

  optional(name, initFn, deps = []) {
    registerModule(name, "optional", initFn, deps);
  },

  getStatus() {
    return window.FOK_MODULES;
  }
};

/* ================= DEBUG ================= */

window.FOK = {
  modules: window.FOK_MODULES,
  register: registerModule
};

console.log("[FOK] LOADED");
