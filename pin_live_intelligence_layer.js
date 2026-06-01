"use strict";

(function () {

  if (window.PIN_LIVE_INTELLIGENCE) return;
  window.PIN_LIVE_INTELLIGENCE = true;

  const state = {
    modules: {},
    health: {},
    graph: {}
  };

  // ================= REGISTER =================
  function registerModule(name, fn) {

    state.modules[name] = fn;

    checkHealth(name);

  }

  // ================= HEALTH CHECK =================
  function checkHealth(name) {

    const fn = state.modules[name];

    state.health[name] = {
      exists: typeof fn === "function",
      status: typeof fn === "function" ? "OK" : "MISSING",
      timestamp: Date.now()
    };

    if (!fn) {

      console.warn("[LIVE INTEL] Missing:", name);

      emit("module_missing", name);

    }

  }

  // ================= GRAPH ANALYSIS =================
  function analyzeGraph() {

    const keys = Object.keys(state.modules);

    state.graph = {
      totalModules: keys.length,
      missing: Object.keys(state.health).filter(
        k => state.health[k].status === "MISSING"
      )
    };

    return state.graph;

  }

  // ================= AUTO HEAL =================
  function autoHeal() {

    Object.keys(state.health).forEach(name => {

      if (state.health[name].status === "MISSING") {

        console.warn("[AUTO HEAL] Attempting fix:", name);

        // attempt recovery hook
        if (window[name]) {

          state.modules[name] = window[name];

          console.log("[AUTO HEAL] FIXED:", name);

          emit("module_healed", name);

        }

      }

    });

  }

  // ================= EVENT BUS =================
  function emit(event, data) {

    if (typeof window.pinEventBusEmit === "function") {

      window.pinEventBusEmit({
        type: event,
        data,
        time: Date.now()
      });

    }

  }

  // ================= PUBLIC API =================
  window.PIN_LIVE_INTELLIGENCE = {

    registerModule,
    checkHealth,
    analyzeGraph,
    autoHeal

  };

})();


