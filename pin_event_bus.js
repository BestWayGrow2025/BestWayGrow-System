"use strict";

/*
========================================
PIN EVENT BUS V1.2 FINAL SAFE
========================================
✔ Event emission + subscription system
✔ Contract-aware safety gate
✔ SYSTEM_EVENTS bridge support
✔ Native DOM fallback
✔ Full bidirectional event system
✔ Production-ready event backbone
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__PIN_EVENT_BUS__) return;

  window.__PIN_EVENT_BUS__ = true;

  console.log("[PIN EVENT BUS] READY");

  // ================= LISTENERS STORE =================
  const listeners = {};

  // ================= SUBSCRIBE =================
  function on(eventName, callback) {

    if (!eventName || typeof callback !== "function") {
      return false;
    }

    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }

    listeners[eventName].push(callback);
    return true;
  }

  // ================= EMIT =================
  function emit(eventName, payload = {}) {

    try {

      // Contract safety check
      if (!window.PIN_GLOBAL_CONTRACT) {
        console.error("[PIN EVENT BUS] Contract not loaded");
        return false;
      }

      const eventPayload = {
        ...payload,
        timestamp: Date.now()
      };

      // internal listeners
      if (listeners[eventName]) {
        listeners[eventName].forEach(fn => {
          try {
            fn(eventPayload);
          } catch (err) {
            console.error("[PIN EVENT LISTENER ERROR]", err);
          }
        });
      }

      // SYSTEM_EVENTS bridge
      if (
        window.SYSTEM_EVENTS &&
        typeof window.SYSTEM_EVENTS.emit === "function"
      ) {
        window.SYSTEM_EVENTS.emit(eventName, eventPayload);
        return true;
      }

      // DOM fallback
      if (typeof window.dispatchEvent === "function") {
        window.dispatchEvent(
          new CustomEvent(eventName, { detail: eventPayload })
        );
        return true;
      }

      return false;

    } catch (err) {
      console.error("[PIN EVENT BUS ERROR]", err);
      return false;
    }
  }

  // ================= SNAPSHOT =================
  function getSnapshot() {
    return JSON.parse(JSON.stringify(listeners));
  }

  // ================= EXPORT =================
  window.subscribePinEvent = on;
  window.broadcastPinEvent = emit;

  window.PIN_EVENT_BUS = {
    emit,
    on,
    snapshot: getSnapshot
  };

})();
