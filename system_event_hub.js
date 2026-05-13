"use strict";

/*
========================================
SYSTEM EVENT HUB V2.0 (FINAL HARDENED CORE)
========================================
✔ Cross-module event unification layer
✔ PIN + PAYOUT + BANK + UI synchronization
✔ Safe publish / subscribe architecture
✔ Duplicate listener prevention
✔ Error-isolated event execution
✔ Global broadcast API
✔ Production LOCKED
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

  // Subscribe
  on(event, fn) {

    if (!event || typeof fn !== "function") return;

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    // Prevent duplicate listeners
    if (this.listeners[event].includes(fn)) return;

    this.listeners[event].push(fn);
  },

  // Unsubscribe
  off(event, fn) {

    const list = this.listeners[event];
    if (!Array.isArray(list)) return;

    this.listeners[event] = list.filter(handler => handler !== fn);
  },

  // Emit event
  emit(event, data) {

    const list = this.listeners[event] || [];

    list.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error("SYSTEM EVENT ERROR:", event, err);
      }
    });
  },

  // Clear listeners
  clear(event) {

    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
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

  hook("processPayout", "PAYOUT_EVENT");
  hook("finalizePayout", "PAYOUT_FINALIZED");
}

// ================= BANK EVENTS =================
function bindBankSystemEvents() {

  hook("updateBankBalance", "BANK_UPDATE");
  hook("creditBank", "BANK_CREDIT");
  hook("debitBank", "BANK_DEBIT");
}

// ================= SAFE HOOK WRAPPER =================
function hook(fnName, eventName) {

  if (typeof window[fnName] !== "function") return;

  const original = window[fnName];

  if (original.__systemEventHooked) return;

  function wrappedFunction(...args) {

    const result = original.apply(this, args);

    SYSTEM_EVENTS.emit(eventName, {
      functionName: fnName,
      eventName,
      args,
      result,
      timestamp: Date.now()
    });

    return result;
  }

  wrappedFunction.__systemEventHooked = true;
  wrappedFunction.__originalFunction = original;

  window[fnName] = wrappedFunction;
}

// ================= CROSS-SYSTEM SYNC RULES =================

// PIN → BANK
SYSTEM_EVENTS.on("PIN_REQUEST_EVENT", function (data) {

  if (typeof window.validateBankForPin === "function") {
    try {
      window.validateBankForPin(data);
    } catch (err) {
      console.error("PIN → BANK SYNC ERROR:", err);
    }
  }
});

// PAYOUT → PIN
SYSTEM_EVENTS.on("PAYOUT_EVENT", function (data) {

  if (typeof window.syncPinAfterPayout === "function") {
    try {
      window.syncPinAfterPayout(data);
    } catch (err) {
      console.error("PAYOUT → PIN SYNC ERROR:", err);
    }
  }
});

// BANK → UI
SYSTEM_EVENTS.on("BANK_UPDATE", function (data) {

  if (typeof window.refreshDashboardBalances === "function") {
    try {
      window.refreshDashboardBalances(data);
    } catch (err) {
      console.error("BANK → UI SYNC ERROR:", err);
    }
  }
});

// ================= GLOBAL BROADCAST =================
function broadcastSystemEvent(event, payload = {}) {

  SYSTEM_EVENTS.emit(event, {
    ...payload,
    timestamp: Date.now()
  });
}

// ================= GLOBAL ACCESS =================
function exposeGlobalHub() {

  window.SYSTEM_EVENTS = window.SYSTEM_EVENTS || SYSTEM_EVENTS;

  window.onSystemEvent = SYSTEM_EVENTS.on.bind(SYSTEM_EVENTS);
  window.offSystemEvent = SYSTEM_EVENTS.off.bind(SYSTEM_EVENTS);
  window.emitSystemEvent = SYSTEM_EVENTS.emit.bind(SYSTEM_EVENTS);
  window.broadcastSystemEvent = broadcastSystemEvent;

  console.log("[EVENT HUB] Initialized safe fallback bus");
}
