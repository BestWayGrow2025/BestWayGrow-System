"use strict";

(function () {

  if (window.PIN_MODULE_REGISTRY) return;
  window.PIN_MODULE_REGISTRY = true;

  const REGISTRY = {};

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

  function get(name) {
    return REGISTRY[name] || null;
  }

  function list() {
    return Object.keys(REGISTRY);
  }

  window.PIN = {
    register,
    get,
    list
  };

  console.log("[PIN REGISTRY] READY ✔");

})();
