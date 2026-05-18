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
✔ Enterprise core integration (Wired)
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_EVENT_HUB__) return;
  window.__SYSTEM_EVENT_HUB__ = true;

  const SYSTEM_EVENTS = createEventBus();

  window.SYSTEM_EVENTS = SYSTEM_EVENTS;

  exposeGlobalHub(SYSTEM_EVENTS);

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

// ================= ENTERPRISE CORE WIRING =================
(function connectEnterpriseToEventHub() {

  function tryConnect() {

    if (!window.BOOT || !window.BOOT.enterprise) {
      setTimeout(tryConnect, 500);
      return;
    }

    const core = window.BOOT.enterprise.core;

    if (!core || !window.SYSTEM_EVENTS) {
      setTimeout(tryConnect, 500);
      return;
    }

    console.log("[EVENT HUB] WIRING ENTERPRISE CORE");

    window.SYSTEM_EVENTS.on("PIN_EVENT", (data) => {
      core?.analyze?.(data);
      window.__AUTOPILOT__?.decide?.(data);
    });

    window.SYSTEM_EVENTS.on("PAYOUT_EVENT", (data) => {
      core?.analyze?.(data);
      window.__AUTOPILOT__?.optimize?.(data);
    });

    window.SYSTEM_EVENTS.on("BANK_UPDATE", (data) => {
      core?.analyze?.(data);
      window.__SELF_LEARNING__?.learn?.(data);
    });

    window.SYSTEM_EVENTS.on("SYSTEM_EVENT", (data) => {
      core?.analyze?.(data);
      window.__AUTO_WIRING__?.adjust?.(data);
    });

    console.log("[EVENT HUB] ENTERPRISE CORE CONNECTED");
  }

  tryConnect();

})();
