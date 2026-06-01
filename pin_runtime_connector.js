"use strict";

/*
========================================
PIN RUNTIME CONNECTOR V1.0
========================================
✔ Runtime dependency validator
✔ PIN module readiness checker
✔ Safe startup verification
✔ Missing module detection
✔ Global runtime state exposure
✔ NO routing logic
✔ NO UI logic
✔ NO business logic
✔ Single responsibility only
✔ Production LOCKED
========================================
*/

// ================= REQUIRED MODULES =================
const PIN_RUNTIME_REQUIRED_MODULES = [
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

  PIN_RUNTIME_REQUIRED_MODULES.forEach(function (moduleName) {

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

// ================= SAFE BOOT (NO AUTO EXECUTION) =================
function bootPinRuntimeConnector() {
  return initializePinRuntime();
}

// ================= EXPORT =================
window.isPinRuntimeReady = isPinRuntimeReady;
window.getPinRuntimeStatus = getPinRuntimeStatus;
window.bootPinRuntimeConnector = bootPinRuntimeConnector;
