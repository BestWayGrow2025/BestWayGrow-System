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

  // ================= ALIAS MAP (CRITICAL FIX) =================
  const ALIASES = {
    eventstream: "eventmonitor" // FIX FOR YOUR ERROR
  };

  // ================= REGISTER =================
  function register(name, fn) {

    if (!name || typeof fn !== "function") {
      console.warn("[PIN REGISTRY] Invalid module:", name);
      return false;
    }

    REGISTRY[name] = fn;
    window[name] = fn;

    console.log("[PIN REGISTRY] Registered:", name);
    return true;
  }

  // ================= GET (WITH ALIAS RESOLUTION) =================
  function get(name) {

    if (!name) return null;

    // resolve alias first
    const resolved = ALIASES[name] || name;

    return REGISTRY[resolved] || null;
  }

  // ================= LIST =================
  function list() {
    return Object.keys(REGISTRY);
  }

  // ================= VALIDATION HELPER =================
  function exists(name) {
    return !!get(name);
  }

  // ================= GLOBAL EXPORT =================
 window.PIN = {
  register,
  get,
  list,
  exists
};

window.PIN_MODULE_REGISTRY = REGISTRY;
  console.log("[PIN REGISTRY] READY ✔");

})();
