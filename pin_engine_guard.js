"use strict";

/*
========================================
PIN ENGINE GUARD v1.0 HARDENING
========================================
✔ Detects silent failures
✔ Wraps all engine calls
✔ Standardizes error reporting
✔ Ensures traceability
========================================
*/

(function () {

  if (window.__PIN_ENGINE_GUARD__) return;

  window.__PIN_ENGINE_GUARD__ = true;

  function safeCall(name, fn, args) {

    try {

      if (typeof fn !== "function") {
        console.error("[PIN ENGINE] Missing function:", name);
        return { success: false, error: "MISSING_FUNCTION" };
      }

      const result = fn(...args);

      // detect silent failure
      if (result === undefined) {
        console.warn("[PIN ENGINE] No result returned:", name);
      }

      return {
        success: true,
        result
      };

    } catch (err) {

      console.error("[PIN ENGINE ERROR]", name, err);

      return {
        success: false,
        error: err.message || "UNKNOWN_ERROR"
      };
    }
  }

  window.pinEngineSafeCall = safeCall;

})();
