"use strict";

/*
========================================
WALLET EVENT BRIDGE V1.0 (FINAL)
========================================
✔ Connects wallet_system.js to SYSTEM_EVENTS
✔ Broadcasts credit/debit lifecycle events
✔ Synchronizes PIN bank and withdrawals
✔ Triggers dashboard balance refresh
✔ No business logic changes
✔ Safe wrapper only
✔ Duplicate-hook protection
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__WALLET_EVENT_BRIDGE__) return;

  window.__WALLET_EVENT_BRIDGE__ = true;

  initWalletEventBridge();

})();

// ================= INIT =================
function initWalletEventBridge() {

  if (typeof window.SYSTEM_EVENTS === "undefined") {
    return;
  }

  // Common wallet functions (hook only if they exist)
  hookWalletFunction("creditWallet", "WALLET_CREDIT");
  hookWalletFunction("debitWallet", "WALLET_DEBIT");
  hookWalletFunction("updateWalletBalance", "WALLET_UPDATE");
  hookWalletFunction("transferWallet", "WALLET_TRANSFER");
}

// ================= SAFE HOOK =================
function hookWalletFunction(fnName, eventName) {

  if (typeof window[fnName] !== "function") {
    return;
  }

  // Prevent duplicate wrapping
  if (window[fnName].__eventBridgeWrapped) {
    return;
  }

  const original = window[fnName];

  function wrappedWalletFunction(...args) {

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

    // AFTER EVENT
    try {
      SYSTEM_EVENTS.emit(eventName, {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    // GENERIC BALANCE CHANGED EVENT
    try {
      SYSTEM_EVENTS.emit("WALLET_BALANCE_CHANGED", {
        functionName: fnName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    return result;
  }

  wrappedWalletFunction.__eventBridgeWrapped = true;

  window[fnName] = wrappedWalletFunction;
}

// ================= DEFAULT SYSTEM SYNC =================
if (typeof window.onSystemEvent === "function") {

  // Refresh dashboard balances automatically
  onSystemEvent("WALLET_BALANCE_CHANGED", function () {

    try {
      if (typeof window.refreshDashboardBalances === "function") {
        window.refreshDashboardBalances();
      }
    } catch (_) {}
  });

  // Optional PIN bank synchronization
  onSystemEvent("WALLET_DEBIT", function (data) {

    try {
      if (typeof window.syncWalletToPinBank === "function") {
        window.syncWalletToPinBank(data);
      }
    } catch (_) {}
  });

  // Optional withdrawal synchronization
  onSystemEvent("WALLET_CREDIT", function (data) {

    try {
      if (typeof window.syncWalletAfterPayout === "function") {
        window.syncWalletAfterPayout(data);
      }
    } catch (_) {}
  });
}

// ================= EXPORT =================
window.initWalletEventBridge = initWalletEventBridge;
