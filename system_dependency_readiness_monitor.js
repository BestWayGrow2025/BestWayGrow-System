"use strict";

/*
========================================
SYSTEM BOOT DEPENDENCY GUARD v1.0 (FINAL CLEAN)
========================================
✔ Passive monitor only
✔ No auto execution
✔ Boot-controller controlled
✔ Safe dependency readiness detection
✔ Event-based notification system
========================================
*/

// =====================
// GLOBAL FLAGS
// =====================
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
// RESET MONITOR (NEW FIX)
// =====================
function resetDependencyMonitor() {

  if (window.__DEPENDENCY_CHECK_INTERVAL__) {
    clearInterval(window.__DEPENDENCY_CHECK_INTERVAL__);
  }

  window.__DEPENDENCY_CHECK_INTERVAL__ = null;
  window.__DEPENDENCY_READY__ = false;

  console.log("[BOOT GUARD] RESET COMPLETE");
}

// =====================
// START MONITOR (PASSIVE ONLY)
// =====================
function startDependencyMonitor() {

  resetDependencyMonitor();

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

  if (!checkCoreDependencies()) return false;

  window.__DEPENDENCY_READY__ = true;

  if (window.__DEPENDENCY_CHECK_INTERVAL__) {
    clearInterval(window.__DEPENDENCY_CHECK_INTERVAL__);
    window.__DEPENDENCY_CHECK_INTERVAL__ = null;
  }

  window.dispatchEvent(new Event("DEPENDENCY_READY"));

  console.log("[BOOT GUARD] MANUAL READY");

  return true;
}

// =====================
// SAFE WAIT HELPER
// =====================
window.waitForDependencies = function (cb) {

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
// EXPORTS
// =====================
window.startDependencyMonitor = startDependencyMonitor;
window.markDependenciesReady = markDependenciesReady;
window.resetDependencyMonitor = resetDependencyMonitor;
window.checkCoreDependencies = checkCoreDependencies;

console.log("[BOOT GUARD] LOADED ✔");

