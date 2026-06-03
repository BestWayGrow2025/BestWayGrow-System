"use strict";

/*
========================================
PIN ENGINE MONITOR v1.1 (HARDENED)
========================================
✔ Live engine execution tracking
✔ Safe event stream listener
✔ Failure + success analytics
✔ Memory-safe log buffer
✔ Standardized dashboard rule enforcement
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

  // ================= STANDARD DASHBOARD RULE =================
  // 🚨 ENFORCED GLOBAL RULE FOR ALL MODULES
  window.__PIN_DASHBOARD_RULE__ = {
    renderTarget: "mainContent",
    allowedRender: "innerHTML_ONLY",
    forbidden: [
      "document.body.innerHTML +=",
      "document.body.appendChild",
      "document.createElement + append (outside mainContent)"
    ]
  };

  // ================= LOG ENTRY =================
  function pushLog(entry) {

    state.logs.push(entry);

    if (state.logs.length > 200) {
      state.logs.shift();
    }

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

    console.log("[PIN ENGINE MONITOR] LISTENING ✔");

    const original = window.broadcastPinEvent;

    window.broadcastPinEvent = function (event, data) {

      const result = original(event, data);

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

      return result;
    };
  }

  // ================= STATE ACCESS =================
  function getState() {
    return { ...state };
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
