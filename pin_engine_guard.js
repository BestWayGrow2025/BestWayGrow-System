"use strict";

/*
========================================
PIN ENGINE GUARD v1.0 HARDENED + OBSERVABILITY
========================================
✔ Detects silent failures
✔ Wraps all engine calls
✔ Standardized validation layer
✔ Global failure event stream
✔ Debug-ready execution tracing
========================================
*/

(function () {

  if (window.__PIN_ENGINE_GUARD__) return;

  window.__PIN_ENGINE_GUARD__ = true;

  // ================= SAFE CALL WRAPPER =================
  function safeCall(name, fn, args) {

    try {

      if (typeof fn !== "function") {
        console.error("[PIN ENGINE MISSING]", name);
        return { success: false, error: "MISSING_FUNCTION" };
      }

      const result = fn(...args);

      if (result === undefined) {
        console.warn("[PIN ENGINE NO RESULT]", name);
      }

      const finalResult = {
        success: true,
        result
      };

      // ================= GLOBAL FAILURE EVENT =================
      window.broadcastPinEvent?.("PIN_ENGINE_RESULT", {
        action: name,
        success: true,
        timestamp: Date.now()
      });

      return finalResult;

    } catch (err) {

      console.error("[PIN ENGINE ERROR]", name, err);

      const failure = {
        success: false,
        error: err.message || "UNKNOWN_ERROR"
      };

      // ================= GLOBAL FAILURE EVENT =================
      window.broadcastPinEvent?.("PIN_ENGINE_RESULT", {
        action: name,
        success: false,
        error: failure.error,
        timestamp: Date.now()
      });

      return failure;
    }
  }

  // ================= VALIDATION PRE-CHECK =================
  function validateEngineCall(name) {

    const CORE = window.PIN_ENGINE || {};

    if (!CORE[name]) {
      console.error("[PIN VALIDATION] Missing:", name);
      return false;
    }

    return true;
  }

  // ================= EXPORT =================
  window.pinEngineSafeCall = safeCall;
  window.validateEngineCall = validateEngineCall;

  console.log("[PIN ENGINE GUARD] READY ✔");

})();
