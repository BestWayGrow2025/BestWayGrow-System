"use strict";

/*
========================================
SYSTEM EVENT HUB V2.1 (FINAL SAFE CORE)
========================================
✔ Global event bus
✔ Safe overwrite protection
✔ Cross-module sync engine
✔ PIN + PAYOUT + BANK bridge layer
✔ Prevents duplicate registration
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_EVENT_HUB__) return;
  window.__SYSTEM_EVENT_HUB__ = true;

  // Build bus FIRST (important fix)
  const SYSTEM_EVENTS = createEventBus();

  // Expose immediately (prevents missing reference errors)
  window.SYSTEM_EVENTS = SYSTEM_EVENTS;

  // Safe API exposure
  exposeGlobalHub(SYSTEM_EVENTS);

  // Initialize bindings AFTER exposure
  initSystemEventHub(SYSTEM_EVENTS);

})();

// ================= EVENT BUS FACTORY =================
function createEventBus() {

  return {

    listeners: {},

    on(event, fn) {

      if (!event || typeof fn !== "function") return;

      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }

      if (this.listeners[event].includes(fn)) return;

      this.listeners[event].push(fn);
    },

    off(event, fn) {

      const list = this.listeners[event];
      if (!Array.isArray(list)) return;

      this.listeners[event] = list.filter(h => h !== fn);
    },

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

    clear(event) {

      if (event) delete this.listeners[event];
      else this.listeners = {};
    }
  };
}

// ================= INIT =================
function initSystemEventHub(bus) {

  bindPinSystemEvents(bus);
  bindPayoutSystemEvents(bus);
  bindBankSystemEvents(bus);
}

// ================= PIN EVENTS =================
function bindPinSystemEvents(bus) {

  hook("executePinFlow", "PIN_EVENT", bus);
  hook("createPinRequest", "PIN_REQUEST_EVENT", bus);
  hook("routePinRequest", "PIN_ROUTE_EVENT", bus);
}

// ================= PAYOUT EVENTS =================
function bindPayoutSystemEvents(bus) {

  hook("processPayout", "PAYOUT_EVENT", bus);
  hook("finalizePayout", "PAYOUT_FINALIZED", bus);
}

// ================= BANK EVENTS =================
function bindBankSystemEvents(bus) {

  hook("updateBankBalance", "BANK_UPDATE", bus);
  hook("creditBank", "BANK_CREDIT", bus);
  hook("debitBank", "BANK_DEBIT", bus);
}

// ================= SAFE HOOK =================
function hook(fnName, eventName, bus) {

  if (typeof window[fnName] !== "function") return;

  const original = window[fnName];

  if (original.__systemEventHooked) return;

  function wrapped(...args) {

    const result = original.apply(this, args);

    bus.emit(eventName, {
      functionName: fnName,
      eventName,
      args,
      result,
      timestamp: Date.now()
    });

    return result;
  }

  wrapped.__systemEventHooked = true;
  wrapped.__originalFunction = original;

  window[fnName] = wrapped;
}

// ================= GLOBAL ACCESS =================
function exposeGlobalHub(bus) {

  window.onSystemEvent = bus.on.bind(bus);
  window.offSystemEvent = bus.off.bind(bus);
  window.emitSystemEvent = bus.emit.bind(bus);

  window.broadcastSystemEvent = function (event, payload = {}) {
    bus.emit(event, {
      ...payload,
      timestamp: Date.now()
    });
  };

  console.log("[EVENT HUB] GLOBAL REGISTRATION COMPLETE");
}
