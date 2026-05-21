"use strict";

/*
========================================
PIN EVENT BUS V1.1 (FINAL STABLE CORE)
========================================
✔ Single event broadcast layer
✔ SYSTEM_EVENTS bridge support
✔ Safe fallback structure
✔ Duplicate-safe initialization
✔ Production locked
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__PIN_EVENT_BUS__) return;

  window.__PIN_EVENT_BUS__ = true;

  // ================= EVENT EMITTER =================
  function emit(eventName, payload = {}) {

    try {

      const eventPayload = {
        ...payload,
        timestamp: Date.now()
      };

      // ================= PRIMARY EVENT SYSTEM =================
      if (
        window.SYSTEM_EVENTS &&
        typeof window.SYSTEM_EVENTS.emit === "function"
      ) {
        window.SYSTEM_EVENTS.emit(eventName, eventPayload);
        return true;
      }

      // ================= FALLBACK EVENT SYSTEM =================
      if (typeof window.dispatchEvent === "function") {

        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: eventPayload
          })
        );

        return true;
      }

      return false;

    } catch (err) {

      console.error("[PIN EVENT BUS ERROR]", err);

      return false;
    }
  }

  // ================= EXPORT =================
  window.broadcastPinEvent = emit;

  console.log("[PIN EVENT BUS] READY");

})();
