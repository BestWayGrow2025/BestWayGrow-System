"use strict";

/*
========================================
PIN EVENT BUS V1.0
========================================
✔ PIN event broadcasting layer
✔ Diagnostics compatibility
✔ Event Hub integration
✔ Production LOCKED
========================================
*/

(function () {

  // Prevent duplicate loading
  if (window.PIN_EVENT_BUS) return;

  // Required flag for diagnostics
  window.PIN_EVENT_BUS = true;

  // Global PIN event broadcaster
  window.broadcastPinEvent = function (eventName, payload = {}) {

    try {

      if (
        window.SYSTEM_EVENTS &&
        typeof window.SYSTEM_EVENTS.emit === "function"
      ) {
        window.SYSTEM_EVENTS.emit(eventName, {
          ...payload,
          timestamp: Date.now()
        });
      }

    } catch (err) {
      console.error("[PIN EVENT BUS]", err);
    }
  };

  console.log("[PIN EVENT BUS] READY");

})();

