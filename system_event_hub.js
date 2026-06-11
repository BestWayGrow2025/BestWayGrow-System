"use strict";

/*
========================================
SYSTEM EVENT HUB v2.2 (FINAL CLEAN)
========================================
✔ Global event bus
✔ Safe overwrite protection
✔ Cross-module synchronization
✔ PIN + PAYOUT + BANK bridge layer
✔ Boot-safe initialization
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__SYSTEM_EVENT_HUB__) {
    console.log("[EVENT HUB] Already Loaded");
    return;
  }

  window.__SYSTEM_EVENT_HUB__ = true;

  // ================= EVENT BUS =================
  const BUS = createEventBus();

  // expose SYSTEM_EVENTS globally
  window.SYSTEM_EVENTS = window.SYSTEM_EVENTS || BUS;

  // ================= INIT =================
  function initSystemEventHubLayer() {
    initSystemEventHub(BUS);
    console.log("[EVENT HUB] READY");
  }

  // expose init
  window.initSystemEventHubLayer = initSystemEventHubLayer;

  // auto expose helpers
  exposeGlobalHub(BUS);

})();

/* ========================================
   EVENT BUS FACTORY
======================================== */

function createEventBus() {

  return {
    listeners: {},

    on(event, fn) {
      if (!event || typeof fn !== "function") return;

      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }

      if (!this.listeners[event].includes(fn)) {
        this.listeners[event].push(fn);
      }
    },

    off(event, fn) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    },

    emit(event, data) {
      const list = this.listeners[event] || [];

      list.forEach(fn => {
        try {
          fn(data);
        } catch (err) {
          console.error("[EVENT HUB ERROR]", event, err);
        }
      });
    },

    clear(event) {
      if (event) delete this.listeners[event];
      else this.listeners = {};
    }
  };
}

/* ========================================
   INIT HUB
======================================== */

function initSystemEventHub(bus) {

  bindPinSystemEvents(bus);
  bindPayoutSystemEvents(bus);
  bindBankSystemEvents(bus);

  console.log("[EVENT HUB] CORE HOOKS REGISTERED");
}

/* ========================================
   PIN EVENTS
======================================== */

function bindPinSystemEvents(bus) {
  hook("executePinFlow", "PIN_EVENT", bus);
  hook("createPinRequest", "PIN_REQUEST_EVENT", bus);
  hook("routePinRequest", "PIN_ROUTE_EVENT", bus);
}

/* ========================================
   PAYOUT EVENTS
======================================== */

function bindPayoutSystemEvents(bus) {
  hook("processPayout", "PAYOUT_EVENT", bus);
  hook("finalizePayout", "PAYOUT_FINALIZED", bus);
}

/* ========================================
   BANK EVENTS
======================================== */

function bindBankSystemEvents(bus) {
  hook("updateBankBalance", "BANK_UPDATE", bus);
  hook("creditBank", "BANK_CREDIT", bus);
  hook("debitBank", "BANK_DEBIT", bus);
}

/* ========================================
   SAFE HOOK
======================================== */

function hook(fnName, eventName, bus) {

  if (typeof window[fnName] !== "function") return;

  const original = window[fnName];

  if (original.__systemEventHooked) return;

 function wrapped(...args) {

  let result;

  try {

    result = original.apply(this, args);

  } finally {

    bus.emit(eventName, {
      functionName: fnName,
      eventName,
      args,
      result,
      timestamp: Date.now()
    });
  }

  return result;
}

  wrapped.__systemEventHooked = true;
  wrapped.__originalFunction = original;

  window[fnName] = wrapped;

  console.log("[EVENT HUB] Hooked:", fnName, "→", eventName);
}

/* ========================================
   GLOBAL HELPERS
======================================== */

function exposeGlobalHub(bus) {

  window.onSystemEvent = bus.on.bind(bus);
  window.offSystemEvent = bus.off.bind(bus);
  window.emitSystemEvent = bus.emit.bind(bus);

  window.broadcastSystemEvent = function (event, payload = {}) {
    bus.emit(event, { ...payload, timestamp: Date.now() });
  };

  console.log("[EVENT HUB] GLOBAL REGISTRATION COMPLETE");
}

/* ========================================
   ENTERPRISE CONNECTION (OPTIONAL)
======================================== */

function connectEnterpriseToEventHub(bus) {

  return function wireCore() {

    if (window.__EVENT_HUB_CORE_CONNECTED__) return;
    window.__EVENT_HUB_CORE_CONNECTED__ = true;

    const core =
      window.ENTERPRISE_CORE_ENGINE ||
      window.__ENTERPRISE_CORE_ENGINE__ ||
      null;

    if (!core) {
      console.warn("[EVENT HUB] Enterprise Core not found");
      return;
    }

    console.log("[EVENT HUB] ENTERPRISE CORE CONNECTED");

    bus.on("PIN_EVENT", d => core.analyze?.(d));
    bus.on("PAYOUT_EVENT", d => core.analyze?.(d));
    bus.on("BANK_UPDATE", d => core.analyze?.(d));
    bus.on("SYSTEM_EVENT", d => core.analyze?.(d));
  };
}

/* ========================================
   EXPORT
======================================== */

window.connectEnterpriseToEventHub =
  connectEnterpriseToEventHub;
