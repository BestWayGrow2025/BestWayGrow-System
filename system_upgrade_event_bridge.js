"use strict";

/*
========================================
UPGRADE EVENT BRIDGE V1.0 (FINAL)
========================================
✔ Connects upgrade_engine.js to SYSTEM_EVENTS
✔ Broadcasts upgrade lifecycle events
✔ Supports wallet/income/rank sync
✔ Safe wrapper only
✔ Duplicate-hook protection
✔ Boot-safe lifecycle control
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__UPGRADE_EVENT_BRIDGE__) return;

  window.__UPGRADE_EVENT_BRIDGE__ = {
    initialized: true,
    ready: false,
    timestamp: Date.now()
  };

})();

// ================= INIT =================
function initUpgradeEventBridge() {

  if (
    !window.SYSTEM_EVENTS ||
    typeof window.SYSTEM_EVENTS.emit !== "function"
  ) {
    return;
  }

  hookUpgradeFunction();
}

// ================= HOOK =================
function hookUpgradeFunction() {

  if (!window.executeUpgrade || window.executeUpgrade.__eventBridgeWrapped) {
    return;
  }

  const original = window.executeUpgrade;

  function wrappedExecuteUpgrade(...args) {

    try {
      window.SYSTEM_EVENTS.emit("UPGRADE_BEFORE", {
        args,
        timestamp: Date.now()
      });
    } catch (_) {}

    const result = original.apply(this, args);

    try {
      window.SYSTEM_EVENTS.emit("UPGRADE_COMPLETED", {
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

// ================= GLOBAL BROADCAST =================
window.broadcastUpgradeEvent = function (payload = {}) {

  try {
    if (window.SYSTEM_EVENTS?.emit) {
      window.SYSTEM_EVENTS.emit("UPGRADE_EVENT", {
        ...payload,
        timestamp: Date.now()
      });
    }
  } catch (_) {}

  console.log("[UPGRADE BRIDGE] Event broadcasted");
};

// ================= EXPORT =================
window.initUpgradeEventBridge = initUpgradeEventBridge;
window.__UPGRADE_SYSTEM_ACTIVE__ = true;

// ================= BOOT =================
(function upgradeBoot() {

  function start() {

    if (window.__UPGRADE_BOOTED__) return;

    window.__UPGRADE_BOOTED__ = true;

    initUpgradeEventBridge();

    // SAFE SYNC (after system ready)
    if (window.onSystemEvent) {

      window.onSystemEvent("UPGRADE_COMPLETED", function () {

        try { window.refreshDashboardBalances?.(); } catch (_) {}
        try { window.loadIncomeSummary?.(); } catch (_) {}
        try { window.refreshQualificationStatus?.(); } catch (_) {}

      });
    }

    console.log("[UPGRADE BRIDGE] BOOT COMPLETE");
  }

  const wait = setInterval(() => {

    if (window.SYSTEM_EVENTS?.on && window.executeUpgrade) {

      clearInterval(wait);

      window.SYSTEM_EVENTS.on("SYSTEM_READY", start);

      // SAFE BACKUP EXECUTION
      start();
    }

  }, 50);

})();
