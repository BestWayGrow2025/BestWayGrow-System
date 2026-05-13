"use strict";

/*
========================================
PIN EVENT BUS V1.0
========================================
✔ PIN event broadcasting layer
✔ Diagnostics compatibility
✔ Event Hub integration
========================================
*/

(function () {

  if (window.PIN_EVENT_BUS) return;

  window.PIN_EVENT_BUS = true;

  window.broadcastPinEvent = function (eventName, payload = {}) {
    try {
      window.SYSTEM_EVENTS?.emit(eventName, {
        ...payload,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("[PIN EVENT BUS]", err);
    }
  };

  console.log("[PIN EVENT BUS] READY");

})();

