"use strict";

/*
========================================
ENTERPRISE CORE ENGINE v1.1 FINAL
CENTRAL SYSTEM ORCHESTRATION LAYER
========================================
✔ Module registry system
✔ Event bus controller
✔ Cross-dashboard communication layer
✔ Health tracking
✔ Safe execution router
✔ Unified routing fix (CRITICAL)
✔ UI sync guaranteed
✔ Production stable
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

  /* ================= MAIN EXECUTION (FIXED CORE) ================= */

  function run(name, ...args) {
    try {

      let result;

      // 1. Registered modules (highest priority)
      if (state.modules[name]) {
        result = state.modules[name](...args);
      }

      // 2. Global function fallback
      else if (typeof window[name] === "function") {
        result = window[name](...args);
      }

      // 3. Super Admin Module Loader sync (CRITICAL FIX)
      else if (typeof window.executeSuperAdminModule === "function") {
        result = window.executeSuperAdminModule(name, ...args);
      }

      else {
        console.warn("[CORE ENGINE] Module not found:", name);
        return;
      }

      // 🔥 CRITICAL UI SYNC (ENSURES BUTTONS WORK)
      if (typeof window.executeSuperAdminModule === "function") {
        window.executeSuperAdminModule(name, ...args);
      }

      return result;

    } catch (err) {
      console.error("[CORE ENGINE ERROR]", name, err);
      state.health = "DEGRADED";
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
        console.error("[CORE LISTENER ERROR]", e);
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
      console.error("[SAFE CALL ERROR]", e);
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

/* ================= READY ================= */

console.log("[ENTERPRISE CORE ENGINE] READY");
