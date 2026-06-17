"use strict";

/*
========================================
PIN MODULE REGISTRY v2.0 CLEAN FIX
========================================
✔ Alias-safe module resolution
✔ Prevents MODULE NOT FOUND errors
✔ Single source of truth mapping
✔ Production stable routing layer
========================================
*/

(function () {

  if (window.__PIN_MODULE_REGISTRY_READY__) return;
  window.__PIN_MODULE_REGISTRY_READY__ = true;

  const REGISTRY = {};

  window.PIN_MODULE_REGISTRY = REGISTRY;

  // ================= ALIAS MAP =================
  const ALIASES = {
    eventstream: "eventmonitor"
  };

  // ================= REGISTER =================
  function register(name, fn) {

    if (!name || typeof fn !== "function") {
      console.warn("[PIN REGISTRY] Invalid module:", name);
      return false;
    }

    REGISTRY[name] = fn;

    // Optional global exposure
    window[name] = fn;

    console.log("[PIN REGISTRY] Registered:", name);

    return true;
  }

  // ================= GET =================
  function get(name) {

    if (!name) return null;

    const resolved =
      ALIASES[name] || name;

    return REGISTRY[resolved] || null;
  }

  // ================= LIST =================
  function list() {
    return Object.keys(REGISTRY);
  }

  // ================= EXISTS =================
  function exists(name) {
    return !!get(name);
  }

  // ================= EXPORT =================
  window.PIN = {
    register,
    get,
    list,
    exists
  };

  console.log(
    "[PIN REGISTRY] READY ✔"
  );

})();
