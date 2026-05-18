"use strict";

/*
========================================
ENTERPRISE CORE ENGINE v1.1
CENTRAL SYSTEM ORCHESTRATION LAYER
(FIXED ROUTING + EXECUTION LAYER)
========================================
✔ Module registry system
✔ Event bus controller
✔ Cross-dashboard communication layer
✔ Health tracking
✔ Safe execution router
✔ Unified route execution fix
✔ Enterprise backbone stable
========================================
*/

console.log("[ENTERPRISE CORE ENGINE] LOADED");

/* ================= CORE STATE ================= */

window.__ENTERPRISE_CORE_ENGINE__ = (function () {

  const state = {
    modules: {},
    events: [],
    health: "OK",
    mode: "PRODUCTION",
    listeners: {}
  };

  /* ================= REGISTER MODULE ================= */
  function register(name, fn) {
    if (!name || typeof fn !== "function") {
      console.warn("[CORE ENGINE] Invalid module registration:", name);
      return;
    }

    state.modules[name] = fn;
    console.log("[CORE ENGINE] Registered module:", name);
  }

  /* ================= EXECUTE MODULE ================= */
  function run(name, ...args) {
    try {

      if (state.modules[name]) {
        return state.modules[name](...args);
      }

      if (typeof window[name] === "function") {
        return window[name](...args);
      }

      console.warn("[CORE ENGINE] Module not found:", name);

    } catch (err) {
      console.error("[CORE ENGINE ERROR]", name, err);
      state.health = "DEGRADED";
    }
  }

  /* ================= ROUTE FIX (NEW) ================= */

  function route(page, ...args) {
    return run(page, ...args);
  }

  function execute(page, ...args) {

    const fn =
      state.modules[page] ||
      window[page];

    if (typeof fn === "function") {
      try {
        return fn(...args);
      } catch (err) {
        console.error("[CORE EXECUTE ERROR]", page, err);
        state.health = "DEGRADED";
      }
    } else {
      console.warn("[CORE ENGINE] Module not found:", page);
    }
  }

  /* ================= EVENT SYSTEM ================= */
  function emit(eventName, payload) {

    const event = {
      name: eventName,
      payload: payload || {},
      time: Date.now()
    };

    state.events.push(event);

    console.log("[CORE EVENT]", event);

    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent(eventName, { detail: payload })
      );
    }

    const list = state.listeners[eventName] || [];
    list.forEach(fn => {
      try {
        fn(payload);
      } catch (e) {
        console.error("[CORE ENGINE LISTENER ERROR]", e);
      }
    });
  }

  /* ================= LISTEN ================= */
  function on(eventName, fn) {
    if (!state.listeners[eventName]) {
      state.listeners[eventName] = [];
    }

    state.listeners[eventName].push(fn);
  }

  /* ================= STATUS ================= */
  function status() {
    return {
      modules: Object.keys(state.modules).length,
      events: state.events.length,
      health: state.health,
      mode: state.mode
    };
  }

  /* ================= HEALTH CHECK ================= */
  function healthCheck() {

    let ok = true;

    Object.keys(state.modules).forEach(m => {
      if (!state.modules[m]) ok = false;
    });

    state.health = ok ? "OK" : "WARNING";

    return state.health;
  }

  /* ================= SAFE CALL ================= */
  function safeCall(fn, fallback) {
    try {
      if (typeof fn === "function") {
        return fn();
      }
      return fallback;
    } catch (e) {
      console.error("[CORE ENGINE SAFE CALL ERROR]", e);
      return fallback;
    }
  }

  /* ================= TRIGGER ================= */
  function trigger(eventName, payload) {
    emit(eventName, payload);
  }

  /* ================= PUBLIC API ================= */

  return {
    register,
    run,
    route,
    execute,
    emit,
    trigger,
    on,
    status,
    healthCheck,
    safeCall
  };

})();

/* ================= GLOBAL EXPORT ================= */

window.ENTERPRISE_CORE_ENGINE = window.__ENTERPRISE_CORE_ENGINE__;

// 🔥 BACKWARD + FORWARD COMPATIBILITY
window.ENTERPRISE_CORE_ENGINE.route = window.ENTERPRISE_CORE_ENGINE.route;
window.ENTERPRISE_CORE_ENGINE.execute = window.ENTERPRISE_CORE_ENGINE.execute;

/* ================= READY LOG ================= */

console.log("[ENTERPRISE CORE ENGINE] READY");
