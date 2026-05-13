"use strict";

/*
========================================
SYSTEM LAYER CONTROLLER (SLC) V1.0
========================================
✔ Master system scheduler
✔ Controls system execution flow
✔ SAFE MODE + NORMAL MODE switch
✔ Prevents module overload
✔ Recovery integration ready
========================================
*/

(function () {

  if (window.__SYSTEM_LAYER_CONTROLLER__) return;

  window.__SYSTEM_LAYER_CONTROLLER__ = true;

  document.addEventListener("DOMContentLoaded", initSLC);

})();

// ================= STATE =================
const MODULES = {};

let MASTER_TICK = null;
let SYSTEM_MODE = "NORMAL";

// ================= INIT =================
function initSLC() {

  console.log("[SLC] Initializing System Layer Controller...");

  if (!window.SYSTEM_EVENTS) {
    console.warn("[SLC] SYSTEM_EVENTS missing - running in limited mode");
  }

  registerCoreModules();
  startMasterTick();
}

// ================= MODULE REGISTRY =================
function registerCoreModules() {

  MODULES.diagnostics = {
    name: "system_diagnostics",
    active: true,
    lastRun: 0
  };

  MODULES.controlCenter = {
    name: "system_control_center",
    active: true,
    lastRun: 0
  };

  MODULES.recovery = {
    name: "system_recovery_manager",
    active: true,
    lastRun: 0
  };

  MODULES.orchestrator = {
    name: "system_orchestrator_ai",
    active: true,
    lastRun: 0
  };

  MODULES.health = {
    name: "system_health_dashboard",
    active: true,
    lastRun: 0
  };

  console.log("[SLC] Modules registered");
}

// ================= MASTER LOOP =================
function startMasterTick() {

  if (MASTER_TICK) clearInterval(MASTER_TICK);

  MASTER_TICK = setInterval(() => {

    // BLOCK EXECUTION IN LOCKDOWN MODE
    if (SYSTEM_MODE === "LOCKDOWN") return;

    runCycle();

  }, 3000);
}

// ================= EXECUTION CYCLE =================
function runCycle() {

  const now = Date.now();

  Object.values(MODULES).forEach(module => {

    if (!module.active) return;

    // throttle per module (5s rule)
    if (now - module.lastRun < 5000) return;

    executeModule(module);
    module.lastRun = now;
  });

}

// ================= MODULE EXECUTION =================
function executeModule(module) {

  try {

    const fnName = "run" + capitalize(module.name);

    if (typeof window[fnName] === "function") {
      window[fnName]();
    }

  } catch (err) {
    console.error("[SLC] Execution Error:", module.name, err);
  }
}

// ================= MODE CONTROL =================
function setSystemMode(mode) {

  SYSTEM_MODE = mode;

  console.log("[SLC] Mode switched →", mode);

  // Trigger recovery if LOCKDOWN
  if (mode === "LOCKDOWN") {
    triggerRecovery();
  }
}

// ================= RECOVERY =================
function triggerRecovery() {

  if (window.systemRecoveryManager) {
    try {
      window.systemRecoveryManager.autoRecover();
    } catch (err) {
      console.error("[SLC] Recovery failed:", err);
    }
  }
}

// ================= UTIL =================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================= GLOBAL API =================
window.SystemLayerController = {

  setMode: setSystemMode,
  getMode: () => SYSTEM_MODE,
  getModules: () => MODULES,

  // optional manual recovery trigger
  triggerRecovery: triggerRecovery
};
