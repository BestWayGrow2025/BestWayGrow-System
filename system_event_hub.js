"use strict";

/*
========================================
SYSTEM EVENT HUB v2.2 (BOOT MANAGER COMPATIBLE)
========================================
✔ Global event bus
✔ Safe overwrite protection
✔ Cross-module synchronization
✔ PIN + PAYOUT + BANK bridge layer
✔ Prevents duplicate registration
✔ Boot Manager compatible
✔ SYSTEM_READY event integration
✔ No legacy BOOT dependency
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__SYSTEM_EVENT_HUB__) {
    console.log("[EVENT HUB] Already Loaded");
    return;
  }

  window.__SYSTEM_EVENT_HUB__ = true;

  // ================= CREATE EVENT BUS =================
  const SYSTEM_EVENTS = createEventBus();

  // Preserve existing bus if already created by boot_manager.js
  if (!window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS = SYSTEM_EVENTS;
  }

  const BUS = window.SYSTEM_EVENTS;

  // ================= GLOBAL HELPERS =================
  exposeGlobalHub(BUS);

  // ================= INIT =================
  initSystemEventHub(BUS);

  // ================= ENTERPRISE CORE CONNECTION =================
  connectEnterpriseToEventHub(BUS);

  console.log("[EVENT HUB] READY");

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

      // Prevent duplicate registration
      if (this.listeners[event].includes(fn)) return;

      this.listeners[event].push(fn);
    },

    off(event, fn) {

      const list = this.listeners[event];

      if (!Array.isArray(list)) return;

      this.listeners[event] = list.filter(handler => handler !== fn);
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

      if (event) {
        delete this.listeners[event];
      } else {
        this.listeners = {};
      }
    }
  };
}

/* ========================================
   INIT SYSTEM EVENT HUB
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
   SAFE FUNCTION HOOK
======================================== */

function hook(fnName, eventName, bus) {

  if (typeof window[fnName] !== "function") return;

  const original = window[fnName];

  // Prevent duplicate wrapping
  if (original.__systemEventHooked) return;

  function wrapped(...args) {

    const result = original.apply(this, args);

    bus.emit(eventName, {
      functionName: fnName,
      eventName: eventName,
      args: args,
      result: result,
      timestamp: Date.now()
    });

    return result;
  }

  wrapped.__systemEventHooked = true;
  wrapped.__originalFunction = original;

  window[fnName] = wrapped;

  console.log("[EVENT HUB] Hooked:", fnName, "→", eventName);
}

/* ========================================
   GLOBAL ACCESS HELPERS
======================================== */

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

/* ========================================
   ENTERPRISE CORE CONNECTION
======================================== */

function connectEnterpriseToEventHub(bus) {

  function wireCore() {

    // Prevent duplicate wiring
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

    console.log("[EVENT HUB] WIRING ENTERPRISE CORE");

    // PIN EVENTS
    bus.on("PIN_EVENT", function (data) {
      core.analyze?.(data);
      window.__AUTOPILOT__?.decide?.(data);
    });

    // PAYOUT EVENTS
    bus.on("PAYOUT_EVENT", function (data) {
      core.analyze?.(data);
      window.__AUTOPILOT__?.optimize?.(data);
    });

    // BANK EVENTS
    bus.on("BANK_UPDATE", function (data) {
      core.analyze?.(data);
      window.__SELF_LEARNING__?.learn?.(data);
    });

    // SYSTEM EVENTS
    bus.on("SYSTEM_EVENT", function (data) {
      core.analyze?.(data);
      window.__AUTO_WIRING__?.adjust?.(data);
    });

    console.log("[EVENT HUB] ENTERPRISE CORE CONNECTED");
  }

  // If system already ready, connect immediately
  if (window.__SYSTEM_BOOT__ && window.__SYSTEM_BOOT__.ready) {
    wireCore();
    return;
  }

  // Wait for SYSTEM_READY from boot_manager.js
  if (window.SYSTEM_EVENTS &&
      typeof window.SYSTEM_EVENTS.on === "function") {

    window.SYSTEM_EVENTS.on("SYSTEM_READY", function () {
      wireCore();
    });

  } else {
    // Fallback if boot manager not yet available
    setTimeout(wireCore, 1000);
  }
}
