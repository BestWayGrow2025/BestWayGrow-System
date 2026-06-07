"use strict";

/*
========================================
INCOME EVENT BRIDGE V2.0 (PRODUCTION FINAL)
========================================
✔ Connects income engine functions to SYSTEM_EVENTS
✔ Broadcasts income processing lifecycle events
✔ Emits generic INCOME_EVENT for diagnostics
✔ Supports dashboard and reports synchronization
✔ Safe wrapper only (no business logic changes)
✔ Duplicate-hook protection
✔ Diagnostics + Control Center compatible
✔ Production LOCKED
========================================
*/

// ================= INIT =================
function initIncomeEventBridge() {

  if (
    !window.SYSTEM_EVENTS ||
    typeof window.SYSTEM_EVENTS.emit !== "function"
  ) {
    return;
  }

  // Hook common income functions only if they exist
 hookIncomeFunction("processIncome", "INCOME_PROCESSED");
hookIncomeFunction("safeIncome", "INCOME_CREDIT");
hookIncomeFunction("addIncomeLog", "INCOME_LOG_CREATED");
hookIncomeFunction("releaseHoldIncome", "HOLD_INCOME_RELEASED");

  // Register global APIs and flags
  exposeIncomeBridgeAPI();

  // Attach default synchronization listeners
  bindDefaultIncomeSync();
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
      window.SYSTEM_EVENTS.emit(eventName + "_BEFORE", {
        functionName: fnName,
        args,
        timestamp: Date.now()
      });
    } catch (_) {}

    // EXECUTE ORIGINAL FUNCTION
    const result = original.apply(this, args);

    // MAIN EVENT
    try {
      window.SYSTEM_EVENTS.emit(eventName, {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    // GENERIC EVENT REQUIRED BY AUDIT/CONTROL CENTER
    try {
      window.SYSTEM_EVENTS.emit("INCOME_EVENT", {
        functionName: fnName,
        eventName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    // SUMMARY EVENT
    try {
      window.SYSTEM_EVENTS.emit("INCOME_UPDATED", {
        functionName: fnName,
        eventName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    return result;
  }

  wrappedIncomeFunction.__eventBridgeWrapped = true;
  wrappedIncomeFunction.__originalFunction = original;

  window[fnName] = wrappedIncomeFunction;
}

// ================= DEFAULT SYSTEM SYNC =================
function bindDefaultIncomeSync() {

  if (typeof window.onSystemEvent !== "function") {
    return;
  }

  window.onSystemEvent("INCOME_UPDATED", function () {

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

// ================= GLOBAL BROADCAST API =================
function broadcastIncomeEvent(payload = {}) {

  if (!window.SYSTEM_EVENTS) return;

  window.SYSTEM_EVENTS.emit("INCOME_EVENT", {
    ...payload,
    timestamp: Date.now()
  });
}

// ================= EXPORT =================
function exposeIncomeBridgeAPI() {

  // Required diagnostics flags
  window.__INCOME_SYSTEM_ACTIVE__ = true;
  window.income_event_bridge_loaded = true;

  // Required API for diagnostics
  window.broadcastIncomeEvent = broadcastIncomeEvent;

  // Initialization API
  window.initIncomeEventBridge = initIncomeEventBridge;
}

  // =====================
// READY
// =====================

window.__INCOME_EVENT_BRIDGE_SYSTEM__ = {
  initialized: true,
  ready: true,
  timestamp: Date.now()
};

// =====================
// EXPORTS
// =====================

window.initIncomeEventBridge =
  initIncomeEventBridge;

window.hookIncomeFunction =
  hookIncomeFunction;

window.bindDefaultIncomeSync =
  bindDefaultIncomeSync;

window.broadcastIncomeEvent =
  broadcastIncomeEvent;

window.exposeIncomeBridgeAPI =
  exposeIncomeBridgeAPI;

// =====================
// HEALTH FLAG
// =====================

window.INCOME_EVENT_BRIDGE_ACTIVE = true;

// =====================
// AUTO INIT (ADD THIS LAST)
// =====================

initIncomeEventBridge();
