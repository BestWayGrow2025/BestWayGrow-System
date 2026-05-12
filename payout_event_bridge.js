"use strict";

/*
========================================
PAYOUT EVENT BRIDGE V1.0 (FINAL SAFE CORE)
========================================
✔ Connects payout system to SYSTEM_EVENTS
✔ Auto-broadcasts payout lifecycle events
✔ Links payout → wallet → income → dashboard sync
✔ Non-invasive wrapper architecture
✔ Duplicate hook protection
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__PAYOUT_EVENT_BRIDGE__) return;

  window.__PAYOUT_EVENT_BRIDGE__ = true;

  initPayoutEventBridge();

})();

// ================= INIT =================
function initPayoutEventBridge() {

  if (typeof window.SYSTEM_EVENTS?.emit !== "function") {
    console.warn("PAYOUT EVENT BRIDGE: SYSTEM_EVENTS not available");
    return;
  }

  // Main payout processor
  hookPayoutFunction("processPayout", "PAYOUT_PROCESS_STARTED");

  // Settlement/finalization
  hookPayoutFunction("finalizePayout", "PAYOUT_FINALIZED");

  // Controller-level payout execution (if present)
  hookPayoutFunction("executePayout", "PAYOUT_EXECUTED");

  // Optional monthly closing payout
  hookPayoutFunction("runMonthlyPayout", "PAYOUT_MONTHLY_RUN");
}

// ================= SAFE HOOK =================
function hookPayoutFunction(fnName, eventName) {

  const fn = window[fnName];

  if (typeof fn !== "function") return;

  // Prevent double wrapping
  if (fn.__payoutEventHooked === true) return;

  function wrapped(...args) {

    const result = fn.apply(this, args);

    try {
      SYSTEM_EVENTS.emit(eventName, {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("PAYOUT EVENT BRIDGE:", err);
    }

    return result;
  }

  wrapped.__payoutEventHooked = true;

  window[fnName] = wrapped;
}

// ================= CROSS-SYSTEM SYNC =================

// Payout started → refresh payout dashboards
SYSTEM_EVENTS.on("PAYOUT_PROCESS_STARTED", function (data) {

  try {
    if (typeof window.refreshPayoutDashboard === "function") {
      window.refreshPayoutDashboard(data);
    }
  } catch (_) {}
});

// Payout finalized → refresh wallet + income + reports
SYSTEM_EVENTS.on("PAYOUT_FINALIZED", function (data) {

  try {
    if (typeof window.refreshWalletDashboard === "function") {
      window.refreshWalletDashboard(data);
    }
  } catch (_) {}

  try {
    if (typeof window.refreshIncomeDashboard === "function") {
      window.refreshIncomeDashboard(data);
    }
  } catch (_) {}

  try {
    if (typeof window.refreshReports === "function") {
      window.refreshReports(data);
    }
  } catch (_) {}
});

// Any payout execution → broadcast generic sync event
SYSTEM_EVENTS.on("PAYOUT_EXECUTED", function (data) {

  try {
    SYSTEM_EVENTS.emit("FINANCIAL_STATE_CHANGED", {
      source: "PAYOUT",
      payload: data,
      timestamp: Date.now()
    });
  } catch (_) {}
});

// ================= MANUAL BROADCAST API =================
function broadcastPayoutUpdate(payload = {}) {

  try {
    SYSTEM_EVENTS.emit("PAYOUT_FORCE_UPDATE", {
      ...payload,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error("PAYOUT FORCE UPDATE:", err);
  }
}

// ================= EXPORT =================
window.broadcastPayoutUpdate = broadcastPayoutUpdate;
