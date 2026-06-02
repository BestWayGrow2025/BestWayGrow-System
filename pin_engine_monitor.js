"use strict";

/*
========================================
PIN ENGINE MONITOR v1.0
========================================
✔ Live engine execution tracking
✔ PIN_ENGINE_RESULT listener
✔ Failure + success analytics
✔ Debug stream for admin panel
========================================
*/

(function () {

  if (window.__PIN_ENGINE_MONITOR__) return;

  window.__PIN_ENGINE_MONITOR__ = true;

  // ================= STATE =================
  const state = {
    total: 0,
    success: 0,
    failed: 0,
    missing: 0,
    logs: []
  };

  // ================= LOG ENTRY =================
  function pushLog(entry) {

    state.logs.push(entry);

    if (state.logs.length > 200) {
      state.logs.shift(); // prevent memory leak
    }

    // optional UI hook
    if (typeof window.renderPinEngineMonitorUI === "function") {
      window.renderPinEngineMonitorUI(state);
    }
  }

  // ================= EVENT LISTENER =================
  function initListener() {

    if (!window.broadcastPinEvent) {
      console.warn("[PIN MONITOR] broadcastPinEvent missing");
      return;
    }

    window.broadcastPinEvent("PIN_ENGINE_MONITOR_READY", {
      timestamp: Date.now()
    });

    console.log("[PIN ENGINE MONITOR] LISTENING ✔");

    // Subscribe via patching global handler (safe fallback)
    const original = window.broadcastPinEvent;

    window.broadcastPinEvent = function (event, data) {

      if (event === "PIN_ENGINE_RESULT") {

        state.total++;

        if (data?.success) {
          state.success++;
        } else {
          state.failed++;
        }

        if (data?.error === "MISSING_FUNCTION") {
          state.missing++;
        }

        pushLog({
          action: data?.action,
          success: data?.success,
          error: data?.error || null,
          time: data?.timestamp || Date.now()
        });
      }

      return original(event, data);
    };
  }

  // ================= GET STATE =================
  function getState() {
    return state;
  }

  // ================= RESET =================
  function reset() {
    state.total = 0;
    state.success = 0;
    state.failed = 0;
    state.missing = 0;
    state.logs = [];
  }

  // ================= EXPORT =================
  window.PIN_ENGINE_MONITOR = {
    getState,
    reset
  };

  // ================= INIT =================
  initListener();

})();

