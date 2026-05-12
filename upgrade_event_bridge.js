"use strict";

/*
========================================
UPGRADE EVENT BRIDGE V1.0 (FINAL)
========================================
✔ Connects upgrade_engine.js to SYSTEM_EVENTS
✔ Broadcasts upgrade lifecycle events
✔ Supports wallet/income/rank sync
✔ No business logic changes
✔ Safe wrapper only
✔ Duplicate-hook protection
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__UPGRADE_EVENT_BRIDGE__) return;

  window.__UPGRADE_EVENT_BRIDGE__ = true;

  initUpgradeEventBridge();

})();

// ================= INIT =================
function initUpgradeEventBridge() {

  if (
    typeof window.SYSTEM_EVENTS === "undefined" ||
    typeof window.executeUpgrade !== "function"
  ) {
    return;
  }

  hookUpgradeFunction();
}

// ================= HOOK =================
function hookUpgradeFunction() {

  // Prevent duplicate wrapping
  if (window.executeUpgrade.__eventBridgeWrapped) {
    return;
  }

  const original = window.executeUpgrade;

  function wrappedExecuteUpgrade(...args) {

    // BEFORE EVENT
    try {
      SYSTEM_EVENTS.emit("UPGRADE_BEFORE", {
        args,
        timestamp: Date.now()
      });
    } catch (_) {}

    // EXECUTE ORIGINAL
    const result = original.apply(this, args);

    // AFTER EVENT
    try {
      SYSTEM_EVENTS.emit("UPGRADE_COMPLETED", {
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    return result;
  }

  wrappedExecuteUpgrade.__eventBridgeWrapped = true;

  window.executeUpgrade = wrappedExecuteUpgrade;
}

// ================= OPTIONAL DEFAULT SYNC =================
if (typeof window.onSystemEvent === "function") {

  // Refresh dashboards after upgrade
  onSystemEvent("UPGRADE_COMPLETED", function () {

    try {
      if (typeof window.refreshDashboardBalances === "function") {
        window.refreshDashboardBalances();
      }
    } catch (_) {}

    try {
      if (typeof window.loadIncomeSummary === "function") {
        window.loadIncomeSummary();
      }
    } catch (_) {}

    try {
      if (typeof window.refreshQualificationStatus === "function") {
        window.refreshQualificationStatus();
      }
    } catch (_) {}
  });
}

// ================= EXPORT =================
window.initUpgradeEventBridge = initUpgradeEventBridge;


