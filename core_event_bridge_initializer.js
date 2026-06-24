"use strict";

/*
========================================
EVENT BRIDGE LOADER V1.0 (FINAL)
========================================
✔ Centralized initialization of all event bridges
✔ Ensures correct startup order
✔ Safe delayed initialization
✔ Duplicate-init protection
✔ Non-blocking bridge bootstrap
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__EVENT_BRIDGE_LOADER__) return;

  window.__EVENT_BRIDGE_LOADER__ = true;

  // Wait until DOM is ready, then bootstrap bridges
if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      setTimeout(initEventBridgeLoader, 0);
    }
  );

} else {

  setTimeout(initEventBridgeLoader, 0);

}

})();

// ================= BRIDGE REGISTRY =================
const EVENT_BRIDGE_INITIALIZERS = [
  "initUpgradeEventBridge",
  "initWalletEventBridge",
  "initIncomeEventBridge",
  "initPayoutEventBridge"
];

// ================= INIT =================
function initEventBridgeLoader() {

  // SYSTEM_EVENTS must exist first
 if (
  typeof window.SYSTEM_EVENTS === "undefined" ||
  typeof window.SYSTEM_EVENTS.emit !== "function"
) {

  console.warn(
    "EVENT BRIDGE LOADER: SYSTEM_EVENTS not available"
  );

  setTimeout(initEventBridgeLoader, 500);

  return;
}

  EVENT_BRIDGE_INITIALIZERS.forEach(fnName => {

    try {

      const fn = window[fnName];

      if (typeof fn === "function") {
        fn();
      }

    } catch (err) {

      console.error(
        "EVENT BRIDGE LOADER ERROR:",
        fnName,
        err
      );
    }
  });

  // Broadcast that all bridges are initialized
  try {
    SYSTEM_EVENTS.emit("EVENT_BRIDGES_INITIALIZED", {
      bridges: EVENT_BRIDGE_INITIALIZERS.slice(),
      timestamp: Date.now()
    });
  } catch (_) {}
}

// ================= MANUAL RELOAD API =================
function reloadEventBridges() {
  initEventBridgeLoader();
}

// ================= EXPORT =================
window.initEventBridgeLoader = initEventBridgeLoader;
window.reloadEventBridges = reloadEventBridges;
