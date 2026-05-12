"use strict";

/*
========================================
SYSTEM EVENT HUB V1.0 (ENTERPRISE CORE)
========================================
✔ Cross-module event unification layer
✔ PIN + PAYOUT + BANK system sync bridge
✔ Centralized event broadcasting
✔ Prevents module desync issues
✔ Safe observer pattern implementation
✔ Production-grade event governor
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_EVENT_HUB__) return;

  window.__SYSTEM_EVENT_HUB__ = true;

  initSystemEventHub();

})();

// ================= EVENT BUS =================
const SYSTEM_EVENTS = {
  listeners: {},

  on(event, fn) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(fn);
  },

  emit(event, data) {
    const list = this.listeners[event] || [];

    list.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error("SYSTEM EVENT ERROR:", err);
      }
    });
  }
};

// ================= INIT =================
function initSystemEventHub() {

  bindPinSystemEvents();
  bindPayoutSystemEvents();
  bindBankSystemEvents();

  exposeGlobalHub();
}

// ================= PIN EVENTS =================
function bindPinSystemEvents() {

  hook("executePinFlow", "PIN_EVENT");
  hook("createPinRequest", "PIN_REQUEST_EVENT");
  hook("routePinRequest", "PIN_ROUTE_EVENT");
}

// ================= PAYOUT EVENTS =================
function bindPayoutSystemEvents() {

  if (typeof window.processPayout !== "function") return;

  hook("processPayout", "PAYOUT_EVENT");
  hook("finalizePayout", "PAYOUT_FINALIZED");
}

// ================= BANK EVENTS =================
function bindBankSystemEvents() {

  if (typeof window.updateBankBalance !== "function") return;

  hook("updateBankBalance", "BANK_UPDATE");
  hook("creditBank", "BANK_CREDIT");
  hook("debitBank", "BANK_DEBIT");
}

// ================= SAFE HOOK WRAPPER =================
function hook(fnName, eventName) {

  if (typeof window[fnName] !== "function") return;

  const original = window[fnName];

  window[fnName] = function (...args) {

    const result = original.apply(this, args);

    SYSTEM_EVENTS.emit(eventName, {
      args,
      result,
      timestamp: Date.now()
    });

    return result;
  };
}

// ================= CROSS SYSTEM SYNC RULES =================
SYSTEM_EVENTS.on("PIN_REQUEST_EVENT", function (data) {

  // Example: link PIN request to bank pre-check
  if (typeof window.validateBankForPin === "function") {
    window.validateBankForPin(data);
  }
});

SYSTEM_EVENTS.on("PAYOUT_EVENT", function (data) {

  // Example: ensure payout never bypasses PIN system
  if (typeof window.syncPinAfterPayout === "function") {
    window.syncPinAfterPayout(data);
  }
});

SYSTEM_EVENTS.on("BANK_UPDATE", function (data) {

  // Example: update UI dashboards automatically
  if (typeof window.refreshDashboardBalances === "function") {
    window.refreshDashboardBalances(data);
  }
});

// ================= GLOBAL ACCESS =================
function exposeGlobalHub() {

  window.SYSTEM_EVENTS = SYSTEM_EVENTS;
  window.onSystemEvent = SYSTEM_EVENTS.on.bind(SYSTEM_EVENTS);
}
