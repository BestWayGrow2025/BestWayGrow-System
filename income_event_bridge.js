"use strict";

/*
========================================
INCOME EVENT BRIDGE V1.0 (FINAL)
========================================
✔ Connects income_engine.js to SYSTEM_EVENTS
✔ Broadcasts income creation lifecycle
✔ Synchronizes income logs and hold income
✔ Triggers dashboard and report refresh
✔ No business logic changes
✔ Safe wrapper only
✔ Duplicate-hook protection
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__INCOME_EVENT_BRIDGE__) return;

  window.__INCOME_EVENT_BRIDGE__ = true;

  initIncomeEventBridge();

})();

// ================= INIT =================
function initIncomeEventBridge() {

  if (typeof window.SYSTEM_EVENTS === "undefined") {
    return;
  }

  // Hook common income functions if they exist
  hookIncomeFunction("processIncome", "INCOME_PROCESSED");
  hookIncomeFunction("creditIncome", "INCOME_CREDIT");
  hookIncomeFunction("createIncomeLog", "INCOME_LOG_CREATED");
  hookIncomeFunction("releaseHoldIncome", "HOLD_INCOME_RELEASED");
}

// ================= SAFE HOOK =================
function hookIncomeFunction(fnName, eventName) {

  if (typeof window[fnName] !== "function") {
    return;
  }

  // Prevent duplicate wrapping
  if (window[fnName].__eventBridgeWrapped) {
    return;
  }

  const original = window[fnName];

  function wrappedIncomeFunction(...args) {

    // BEFORE EVENT
    try {
      SYSTEM_EVENTS.emit(eventName + "_BEFORE", {
        functionName: fnName,
        args,
        timestamp: Date.now()
      });
    } catch (_) {}

    // EXECUTE ORIGINAL
    const result = original.apply(this, args);

    // MAIN EVENT
    try {
      SYSTEM_EVENTS.emit(eventName, {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    // GENERIC INCOME CHANGED EVENT
    try {
      SYSTEM_EVENTS.emit("INCOME_UPDATED", {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    return result;
  }

  wrappedIncomeFunction.__eventBridgeWrapped = true;

  window[fnName] = wrappedIncomeFunction;
}

// ================= DEFAULT SYSTEM SYNC =================
if (typeof window.onSystemEvent === "function") {

  onSystemEvent("INCOME_UPDATED", function () {

    try {
      if (typeof window.loadIncomeSummary === "function") {
        window.loadIncomeSummary();
      }
    } catch (_) {}

    try {
      if (typeof window.loadIncomeLogs === "function") {
        window.loadIncomeLogs();
      }
    } catch (_) {}

    try {
      if (typeof window.refreshDashboardBalances === "function") {
        window.refreshDashboardBalances();
      }
    } catch (_) {}

    try {
      if (typeof window.refreshReports === "function") {
        window.refreshReports();
      }
    } catch (_) {}
  });
}

// ================= EXPORT =================
window.initIncomeEventBridge = initIncomeEventBridge;
