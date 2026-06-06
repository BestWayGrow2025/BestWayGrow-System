"use strict";

/*
========================================
PIN ENGINE GUARD v1.1 HARDENED + OBSERVABILITY
========================================
✔ Detects silent failures
✔ Wraps all engine calls safely
✔ Standardized validation layer
✔ Global event stream (SUCCESS + FAIL)
✔ Consistent execution tracing
✔ Dispatcher-safe output contract
========================================
*/

(function () {

  if (window.__PIN_ENGINE_GUARD__) return;

  window.__PIN_ENGINE_GUARD__ = true;

  // ================= VALIDATION =================
  function validateEngineCall(name) {

    const CORE = window.PIN_ENGINE;
    if (!CORE) return false;

    if (!CORE[name]) {
      console.error("[PIN VALIDATION] Missing:", name);

      window.broadcastPinEvent?.("PIN_ENGINE_RESULT", {
        action: name,
        success: false,
        error: "MISSING_FUNCTION",
        timestamp: Date.now()
      });

      return false;
    }

    return true;
  }

  // ================= SAFE CALL WRAPPER =================
  function safeCall(name, fn, args = []) {

    try {

      // VALIDATION FIRST
      if (!validateEngineCall(name)) {
        return {
          success: false,
          error: "VALIDATION_FAILED"
        };
      }

      if (typeof fn !== "function") {
        console.error("[PIN ENGINE MISSING]", name);

        window.broadcastPinEvent?.("PIN_ENGINE_RESULT", {
          action: name,
          success: false,
          error: "MISSING_FUNCTION",
          timestamp: Date.now()
        });

        return { success: false, error: "MISSING_FUNCTION" };
      }

      const result = fn(...args);
      const success = result !== undefined;

      if (!success) {
        console.warn("[PIN ENGINE NO RESULT]", name);
      }

      const finalResult = {
        success,
        result
      };

      // ================= GLOBAL EVENT STREAM =================
      window.broadcastPinEvent?.("PIN_ENGINE_RESULT", {
        action: name,
        success,
        result: result ?? null,
        timestamp: Date.now()
      });

      return finalResult;

    } catch (err) {

      console.error("[PIN ENGINE ERROR]", name, err);

      const failure = {
        success: false,
        error: err.message || "UNKNOWN_ERROR"
      };

      window.broadcastPinEvent?.("PIN_ENGINE_RESULT", {
        action: name,
        success: false,
        error: failure.error,
        timestamp: Date.now()
      });

      return failure;
    }
  }

  // ================= EXPORT =================
  window.pinEngineSafeCall = safeCall;
  window.validateEngineCall = validateEngineCall;

  console.log("[PIN ENGINE GUARD] READY ✔");

})();
