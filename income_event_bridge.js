"use strict";

/*
========================================
INCOME EVENT BRIDGE V2.0 (PRODUCTION FINAL)
========================================
✔ Connects income engine functions to SYSTEM_EVENTS
✔ Broadcasts income lifecycle events
✔ Emits INCOME_EVENT for diagnostics
✔ Dashboard + control sync ready
✔ Safe wrapper only
✔ Duplicate protection
✔ Enterprise boot support
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

  hookIncomeFunction("processIncome", "INCOME_PROCESSED");
  hookIncomeFunction("safeIncome", "INCOME_CREDIT");
  hookIncomeFunction("addIncomeLog", "INCOME_LOG_CREATED");
  hookIncomeFunction("releaseHoldIncome", "HOLD_INCOME_RELEASED");

  exposeIncomeBridgeAPI();
  bindDefaultIncomeSync();

  console.log("[INCOME BRIDGE] INIT COMPLETE");
}

// ================= SAFE HOOK =================
function hookIncomeFunction(fnName, eventName) {

  if (typeof window[fnName] !== "function") return;
  if (window[fnName].__eventBridgeWrapped) return;

  const original = window[fnName];

  function wrapped(...args) {

    try {
      window.SYSTEM_EVENTS.emit(eventName + "_BEFORE", {
        functionName: fnName,
        args,
        timestamp: Date.now()
      });
    } catch (_) {}

    const result = original.apply(this, args);

    try {
      window.SYSTEM_EVENTS.emit(eventName, {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    try {
      window.SYSTEM_EVENTS.emit("INCOME_EVENT", {
        functionName: fnName,
        eventName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

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

  wrapped.__eventBridgeWrapped = true;
  wrapped.__originalFunction = original;

  window[fnName] = wrapped;
}

// ================= SYNC =================
function bindDefaultIncomeSync() {

  if (typeof window.onSystemEvent !== "function") return;

  window.onSystemEvent("INCOME_UPDATED", function () {

    try { window.loadIncomeSummary?.(); } catch (_) {}
    try { window.loadIncomeLogs?.(); } catch (_) {}
    try { window.refreshDashboardBalances?.(); } catch (_) {}
    try { window.refreshReports?.(); } catch (_) {}

  });
}

// ================= API =================
function exposeIncomeBridgeAPI() {

  window.__INCOME_SYSTEM_ACTIVE__ = true;
  window.income_event_bridge_loaded = true;

  window.broadcastIncomeEvent = function (payload = {}) {
    if (!window.SYSTEM_EVENTS) return;

    window.SYSTEM_EVENTS.emit("INCOME_EVENT", {
      ...payload,
      timestamp: Date.now()
    });
  };

  window.initIncomeEventBridge = initIncomeEventBridge;
}

// ================= FLAGS =================
window.INCOME_EVENT_BRIDGE_ACTIVE = true;
window.__INCOME_EVENT_BRIDGE_SYSTEM__ = {
  initialized: true,
  ready: true,
  timestamp: Date.now()
};

// ================= EXPORTS =================
window.initIncomeEventBridge = initIncomeEventBridge;
window.hookIncomeFunction = hookIncomeFunction;
window.bindDefaultIncomeSync = bindDefaultIncomeSync;
window.exposeIncomeBridgeAPI = exposeIncomeBridgeAPI;

// ================= AUTO BOOT ENTERPRISE =================
(function enterpriseIncomeBoot() {

  function safeInit() {

    try {

      if (typeof window.initIncomeEventBridge !== "function") return;
      if (window.__INCOME_EVENT_BRIDGE_BOOTED__) return;

      window.__INCOME_EVENT_BRIDGE_BOOTED__ = true;

      window.initIncomeEventBridge();

      console.log("[INCOME BRIDGE] ENTERPRISE BOOT COMPLETE");

    } catch (err) {
      console.error("[INCOME BRIDGE BOOT ERROR]", err);
    }
  }

  if (window.SYSTEM_EVENTS?.on) {

    window.SYSTEM_EVENTS.on("SYSTEM_READY", safeInit);

  } else {

    const t = setInterval(() => {

      if (window.SYSTEM_EVENTS?.emit) {
        clearInterval(t);
        safeInit();
      }

    }, 50);

  }

})();
