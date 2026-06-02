"use strict";

/*
========================================
PIN SYSTEM FINALIZATION LAYER v1.0
========================================
✔ Self-healing execution engine
✔ Failure intelligence tracking
✔ Full audit trail logging
✔ System safety isolation layer
✔ Production stability lock
========================================
*/

(function () {

  if (window.__PIN_SYSTEM_FINAL_LAYER__) return;

  window.__PIN_SYSTEM_FINAL_LAYER__ = true;

  // ================= STATE =================
  const state = {
    failures: {},
    history: [],
    blockedEngines: new Set()
  };

  // ================= AUDIT LOGGER =================
  function log(entry) {
    state.history.push({
      ...entry,
      timestamp: Date.now()
    });

    if (state.history.length > 500) {
      state.history.shift();
    }

    window.broadcastPinEvent?.("PIN_AUDIT_LOG", entry);
  }

  // ================= FAILURE TRACKER =================
  function trackFailure(action) {

    state.failures[action] = (state.failures[action] || 0) + 1;

    if (state.failures[action] >= 3) {
      state.blockedEngines.add(action);
      console.error("[PIN BLOCKED ENGINE]", action);
    }
  }

  // ================= SELF HEAL RETRY =================
  function retryAction(action, payload, context, attempt = 1) {

    if (state.blockedEngines.has(action)) {
      console.warn("[PIN SKIPPED - BLOCKED]", action);
      return false;
    }

    try {

      if (typeof window.dispatchPinAction !== "function") {
        throw new Error("Dispatcher missing");
      }

      const result = window.dispatchPinAction(action, payload, context);

      log({
        action,
        status: "RETRY_SUCCESS",
        attempt
      });

      return result;

    } catch (err) {

      console.error("[PIN RETRY FAILED]", action, err);

      trackFailure(action);

      if (attempt < 3) {

        const delay = 500 * attempt;

        setTimeout(() => {
          retryAction(action, payload, context, attempt + 1);
        }, delay);
      }

      log({
        action,
        status: "RETRY_FAILED",
        attempt,
        error: err.message
      });

      return false;
    }
  }

  // ================= WRAP DISPATCH (AUTO HOOK) =================
  function wrapDispatcher() {

    if (!window.dispatchPinAction) return;

    const original = window.dispatchPinAction;

    window.dispatchPinAction = function (action, payload, context) {

      if (state.blockedEngines.has(action)) {
        console.warn("[PIN ENGINE BLOCKED]", action);
        return false;
      }

      try {

        const result = original(action, payload, context);

        log({
          action,
          status: "SUCCESS"
        });

        return result;

      } catch (err) {

        trackFailure(action);

        log({
          action,
          status: "FAILED",
          error: err.message
        });

        return retryAction(action, payload, context);
      }
    };
  }

  // ================= ENGINE HEALTH CHECK =================
  function healthCheck() {

    const report = {
      blockedEngines: Array.from(state.blockedEngines),
      failureMap: state.failures,
      totalLogs: state.history.length
    };

    window.broadcastPinEvent?.("PIN_SYSTEM_HEALTH", report);

    console.log("[PIN HEALTH REPORT]", report);

    return report;
  }

  // ================= GLOBAL EXPORT =================
  window.pinRetryAction = retryAction;
  window.pinHealthCheck = healthCheck;

  // ================= INIT =================
  function init() {
    wrapDispatcher();
    console.log("[PIN FINAL LAYER] ACTIVE ✔");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();


