"use strict";

/*
========================================
PIN RUNTIME CONNECTOR V1.1 (BOOT SAFE FIX)
========================================
✔ Dependency-safe initialization
✔ Circular-load protection safe
✔ Early-access protection fix
✔ Runtime validator hardened
✔ Global safe exposure
✔ Production READY
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_RUNTIME_CONNECTOR__) return;

  window.__PIN_RUNTIME_CONNECTOR__ = true;

  console.log("[PIN RUNTIME CONNECTOR] LOADED");

})();

// ================= SAFE GLOBAL MODULE LIST =================
// FIX: prevent "before initialization" crash
window.PIN_RUNTIME_REQUIRED_MODULES = window.PIN_RUNTIME_REQUIRED_MODULES || [
  "isPinFlowSystemSafe",
  "isPinSessionValid",
  "getPinSessionUserId",
  "getPinSessionRole",
  "executeWithPinLock",
  "executePinSafe",
  "dispatchPinAction",
  "executePinFlow"
];

// ================= INITIALIZER =================
function initializePinRuntime() {

  const validation = validatePinRuntimeModules();

  window.__PIN_RUNTIME_READY__ = validation.ready;
  window.__PIN_RUNTIME_STATUS__ = validation;

  if (!validation.ready) {

    console.error(
      "[PIN RUNTIME] Missing modules:",
      validation.missing
    );

    return false;
  }

  console.log("[PIN RUNTIME] READY ✔");

  return true;
}

// ================= VALIDATOR =================
function validatePinRuntimeModules() {

  const missing = [];

  const modules =
    window.PIN_RUNTIME_REQUIRED_MODULES || [];

  modules.forEach(function (moduleName) {

    if (typeof window[moduleName] !== "function") {
      missing.push(moduleName);
    }

  });

  return {
    ready: missing.length === 0,
    missing: missing,
    checkedAt: Date.now()
  };
}

// ================= STATUS CHECK =================
function isPinRuntimeReady() {
  return window.__PIN_RUNTIME_READY__ === true;
}

// ================= STATUS FETCH =================
function getPinRuntimeStatus() {
  return window.__PIN_RUNTIME_STATUS__ || {
    ready: false,
    missing: [],
    checkedAt: null
  };
}

// ================= SAFE BOOT =================
function bootPinRuntimeConnector() {
  return initializePinRuntime();
}

// ================= EXPORT =================
window.isPinRuntimeReady = isPinRuntimeReady;
window.getPinRuntimeStatus = getPinRuntimeStatus;
window.bootPinRuntimeConnector = bootPinRuntimeConnector;
