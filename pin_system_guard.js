"use strict";

/*
========================================
PIN SYSTEM GUARD V1.0
========================================
✔ Core safety validation layer
✔ System readiness checker
✔ Income safety checker
✔ PIN flow safety validator
✔ NO routing logic
✔ NO UI logic
✔ NO business execution
✔ Single responsibility only
✔ Production LOCKED
========================================
*/

// ================= CORE CHECK =================
function isPinCoreReady() {

  return !!(
    window.__CORE_STATE__ &&
    window.__CORE_STATE__.initialized === true
  );
}

// ================= SYSTEM SAFE =================
function isPinSystemSafeState() {

  try {

    if (typeof isSystemSafe === "function") {
      return isSystemSafe() === true;
    }

    return true;

  } catch (_) {

    return false;
  }
}

// ================= INCOME SAFE =================
function isPinIncomeSafeState() {

  try {

    if (typeof isIncomeSystemSafe === "function") {
      return isIncomeSystemSafe() === true;
    }

    return true;

  } catch (_) {

    return false;
  }
}

// ================= FINAL FLOW SAFETY =================
function isPinFlowSystemSafe() {

  // CORE
  if (!isPinCoreReady()) {
    return false;
  }

  // SYSTEM
  if (!isPinSystemSafeState()) {
    return false;
  }

  // INCOME
  if (!isPinIncomeSafeState()) {
    return false;
  }

  return true;
}

// ================= EXPORT =================
window.isPinCoreReady = isPinCoreReady;

window.isPinSystemSafeState = isPinSystemSafeState;

window.isPinIncomeSafeState = isPinIncomeSafeState;

window.isPinFlowSystemSafe = isPinFlowSystemSafe;
