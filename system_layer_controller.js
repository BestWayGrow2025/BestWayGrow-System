"use strict";

/*
========================================
SYSTEM LAYER CONTROLLER (SLC) V1.0
========================================
✔ Master system scheduler
✔ Controls all system modules
✔ Prevents duplicate execution
✔ Central lifecycle manager
✔ Safe startup/shutdown engine
========================================
*/

(function () {

  if (window.__SYSTEM_LAYER_CONTROLLER__) return;
  window.__SYSTEM_LAYER_CONTROLLER__ = true;

  document.addEventListener("DOMContentLoaded", initSLC);

})();

// ================= REGISTRY =================
const MODULES = {};

let MASTER_TICK = null;
let SYSTEM_MODE = "NORMAL";

// ================= INIT =================
function initSLC() {

  console.log("SLC: Initializing System Layer Controller...");

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

  console.log("SLC: Modules registered", MODULES);
}

// ================= MASTER LOOP =================
function startMasterTick() {

  if (MASTER_TICK) clearInterval(MASTER_TICK);

  MASTER_TICK = setInterval(() => {

    if (SYSTEM_MODE === "LOCKDOWN") return;

    runCycle();

  }, 3000);
}

// ================= CYCLE =================
function runCycle() {

  const now = Date.now();

  Object.values(MODULES).forEach(module => {

    if (!module.active) return;

    // throttle execution per module (5s minimum)
    if (now - module.lastRun < 5000) return;

    executeModule(module);
    module.lastRun = now;
  });

}

// ================= EXECUTION =================
function executeModule(module) {

  try {

    const fnName = "run" + capitalize(module.name);

    if (typeof window[fnName] === "function") {
      window[fnName]();
    }

  } catch (err) {
    console.error("SLC Execution Error:", module.name, err);
  }

}

// ================= MODE CONTROL =================
function setSystemMode(mode) {

  SYSTEM_MODE = mode;
  console.log("SLC: Mode switched to", mode);

  if (mode === "RECOVERY") {
    triggerRecovery();
  }

}

// ================= RECOVERY =================
function triggerRecovery() {

  if (window.systemRecoveryManager) {
    window.systemRecoveryManager.autoRecover();
  }

}

// ================= UTILS =================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================= GLOBAL API =================
window.SystemLayerController = {
  setMode: setSystemMode,
  getMode: () => SYSTEM_MODE,
  getModules: () => MODULES
};
