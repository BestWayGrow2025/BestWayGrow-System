"use strict";

/*
========================================
WALLET EVENT BRIDGE V2.0 (PRODUCTION FINAL)
========================================
✔ Connects wallet system functions to SYSTEM_EVENTS
✔ Broadcasts credit/debit/update/transfer events
✔ Emits wallet balance change notifications
✔ Supports dashboard + PIN bank synchronization
✔ Safe wrapper only (no business logic changes)
✔ Duplicate-hook protection
✔ Diagnostics + Control Center compatible
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (
    window.__WALLET_EVENT_BRIDGE__ &&
    window.__WALLET_EVENT_BRIDGE__.initialized
  ) {
    return;
  }

  window.__WALLET_EVENT_BRIDGE__ = {
    initialized: true,
    ready: false,
    timestamp: Date.now()
  };

})();

// ================= INIT =================
function initWalletEventBridge() {

  if (
    !window.SYSTEM_EVENTS ||
    typeof window.SYSTEM_EVENTS.emit !== "function"
  ) {
    return;
  }

  hookWalletFunction("creditWallet", "WALLET_CREDIT");
  hookWalletFunction("debitWallet", "WALLET_DEBIT");
  hookWalletFunction("updateWalletBalance", "WALLET_UPDATE");
  hookWalletFunction("transferWallet", "WALLET_TRANSFER");

  exposeWalletBridgeAPI();
  bindDefaultWalletSync();

  console.log("[WALLET EVENT BRIDGE] Initialized");
}

// ================= SAFE HOOK =================
function hookWalletFunction(fnName, eventName) {

  if (typeof window[fnName] !== "function") {
    return;
  }

  if (window[fnName].__eventBridgeWrapped) {
    return;
  }

  const original = window[fnName];

  function wrappedWalletFunction(...args) {

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
      window.SYSTEM_EVENTS.emit("WALLET_EVENT", {
        functionName: fnName,
        eventName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    try {
      window.SYSTEM_EVENTS.emit("WALLET_BALANCE_CHANGED", {
        functionName: fnName,
        eventName,
        args,
        result,
        timestamp: Date.now()
      });
    } catch (_) {}

    return result;
  }

  wrappedWalletFunction.__eventBridgeWrapped = true;
  wrappedWalletFunction.__originalFunction = original;

  window[fnName] = wrappedWalletFunction;
}

// ================= DEFAULT SYSTEM SYNC =================
function bindDefaultWalletSync() {

  if (typeof window.onSystemEvent !== "function") {
    return;
  }

  window.onSystemEvent("WALLET_BALANCE_CHANGED", function () {
    try {
      if (typeof window.refreshDashboardBalances === "function") {
        window.refreshDashboardBalances();
      }
    } catch (_) {}
  });

  window.onSystemEvent("WALLET_DEBIT", function (data) {
    try {
      if (typeof window.syncWalletToPinBank === "function") {
        window.syncWalletToPinBank(data);
      }
    } catch (_) {}
  });

  window.onSystemEvent("WALLET_CREDIT", function (data) {
    try {
      if (typeof window.syncWalletAfterPayout === "function") {
        window.syncWalletAfterPayout(data);
      }
    } catch (_) {}
  });
}

// ================= GLOBAL BROADCAST API =================
function broadcastWalletEvent(payload = {}) {

  if (
    !window.SYSTEM_EVENTS ||
    typeof window.SYSTEM_EVENTS.emit !== "function"
  ) {
    return;
  }

  window.SYSTEM_EVENTS.emit("WALLET_EVENT", {
    ...payload,
    timestamp: Date.now()
  });
}

// ================= EXPORT =================
function exposeWalletBridgeAPI() {

  window.__WALLET_SYSTEM_ACTIVE__ = true;
  window.wallet_event_bridge_loaded = true;

}

window.broadcastWalletEvent =
  broadcastWalletEvent;

window.initWalletEventBridge =
  initWalletEventBridge;

// ================= FINAL CONFIRMATION =================

window.__WALLET_SYSTEM_ACTIVE__ = true;
window.wallet_system_loaded = true;
window.WALLET_SYSTEM_ACTIVE = true;

console.log("[WALLET] HEALTH FLAG REGISTERED");

// ================= AUTO BOOT =================

(function walletBoot() {

  function start() {

    if (window.__WALLET_BOOTED__) return;

    window.__WALLET_BOOTED__ = true;

    initWalletEventBridge();

    if (window.__WALLET_EVENT_BRIDGE__) {
      window.__WALLET_EVENT_BRIDGE__.ready = true;
    }

    console.log("[WALLET EVENT BRIDGE] BOOT COMPLETE");
  }

  const wait = setInterval(() => {

    if (window.SYSTEM_EVENTS?.on) {

      clearInterval(wait);

      window.SYSTEM_EVENTS.on("SYSTEM_READY", start);
    }

  }, 50);

})();
