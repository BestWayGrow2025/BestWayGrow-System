"use strict";

/*
========================================
SYSTEM BOOT DEPENDENCY GUARD v1.0
========================================
✔ Prevents session_manager early execution failure
✔ Ensures core functions are actually attached
✔ Creates unified readiness flag
✔ Fixes "getUserById missing" root cause
========================================
*/

window.__DEPENDENCY_READY__ = false;
window.__DEPENDENCY_CHECK_INTERVAL__ = null;

// =====================
// DEPENDENCY CHECKER
// =====================
function checkCoreDependencies() {

  return (
    typeof window.getUserById === "function" &&
    typeof window.safeGet === "function" &&
    typeof window.safeSet === "function" &&
    typeof window.normalizeUser === "function" &&
    typeof window.getUsers === "function"
  );
}

// =====================
// START MONITOR
// =====================
function startDependencyMonitor() {

  if (window.__DEPENDENCY_CHECK_INTERVAL__) return;

  window.__DEPENDENCY_CHECK_INTERVAL__ = setInterval(() => {

    if (checkCoreDependencies()) {

      window.__DEPENDENCY_READY__ = true;

      clearInterval(window.__DEPENDENCY_CHECK_INTERVAL__);
      window.__DEPENDENCY_CHECK_INTERVAL__ = null;

      console.log("[BOOT GUARD] DEPENDENCIES READY");

      window.dispatchEvent(new Event("DEPENDENCY_READY"));
    }

  }, 50);
}

// =====================
// MANUAL TRIGGER
// =====================
function markDependenciesReady() {

  if (checkCoreDependencies()) {

    window.__DEPENDENCY_READY__ = true;

    if (window.__DEPENDENCY_CHECK_INTERVAL__) {
      clearInterval(window.__DEPENDENCY_CHECK_INTERVAL__);
      window.__DEPENDENCY_CHECK_INTERVAL__ = null;
    }

    window.dispatchEvent(new Event("DEPENDENCY_READY"));

    console.log("[BOOT GUARD] MANUAL READY");
  }
}

// =====================
// WAIT HELPER (FINAL SAFE)
// =====================
window.waitForDependencies = function (cb) {

  if (window.__WAIT_DEP_READY__) return;
  window.__WAIT_DEP_READY__ = true;

  if (typeof cb !== "function") return;

  if (checkCoreDependencies()) {
    cb();
    return;
  }

  const interval = setInterval(() => {
    if (checkCoreDependencies()) {
      clearInterval(interval);
      cb();
    }
  }, 50);
};

// =====================
// EXPORT
// =====================
window.startDependencyMonitor = startDependencyMonitor;
window.markDependenciesReady = markDependenciesReady;
window.checkCoreDependencies = checkCoreDependencies;

console.log("[BOOT GUARD] LOADED ✔");
