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

  if (window.PIN_MODULE_REGISTRY) return;
  window.PIN_MODULE_REGISTRY = true;

  const REGISTRY = {};

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

  console.log("[PIN REGISTRY] READY ✔");

})();
