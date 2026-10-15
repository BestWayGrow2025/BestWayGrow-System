"use strict";

/*
========================================
PIN ENGINE CORE v1.0
========================================
✔ Central registry for PIN engine functions
✔ Optional abstraction over window.PIN_ENGINE
✔ Safe access layer for all modules
========================================
*/

(function () {

  if (window.__PIN_ENGINE_CORE__) return;

  window.__PIN_ENGINE_CORE__ = true;

  // ================= CORE STORAGE =================
  if (!window.PIN_ENGINE) {
    window.PIN_ENGINE = {};
  }

  // ================= REGISTER FUNCTION =================
  function register(name, fn) {

    if (!name || typeof fn !== "function") {
      console.error("[PIN ENGINE CORE] Invalid register call:", name);
      return false;
    }

    window.PIN_ENGINE[name] = fn;

    console.log("[PIN ENGINE CORE] Registered:", name);
    return true;
  }

  // ================= GET FUNCTION =================
  function get(name) {

    const fn = window.PIN_ENGINE?.[name];

    if (typeof fn !== "function") {
      console.warn("[PIN ENGINE CORE] Missing function:", name);
      return null;
    }

    return fn;
  }

  // ================= HAS FUNCTION =================
  function has(name) {
    return typeof window.PIN_ENGINE?.[name] === "function";
  }

  // ================= LIST ALL =================
  function list() {
    return Object.keys(window.PIN_ENGINE || {});
  }

  // ================= SAFE CALL =================
  function call(name, ...args) {

    const fn = get(name);

    if (!fn) {
      return {
        success: false,
        error: "MISSING_FUNCTION",
        name
      };
    }

    try {
      const result = fn(...args);
      return {
        success: true,
        result
      };
    } catch (err) {
      console.error("[PIN ENGINE CORE ERROR]", name, err);
      return {
        success: false,
        error: err.message || "UNKNOWN_ERROR"
      };
    }
  }

  // ================= UPGRADE PIN CONTROLS =================
window.PIN_ENGINE_CORE.register("startUpgrade", function () { const products = getPinProducts().filter( product => product.pinType === "upgrade" );
if (!products.length) { return { success: false, error: "UPGRADE_PRODUCT_NOT_FOUND" }; }
let changed = false;
products.forEach(product => { if (product.status !== "active") { changed = togglePinProduct(product.productId) || changed; } });
return { success: true, changed }; });
window.PIN_ENGINE_CORE.register("stopUpgrade", function () { const products = getPinProducts().filter( product => product.pinType === "upgrade" );
if (!products.length) { return { success: false, error: "UPGRADE_PRODUCT_NOT_FOUND" }; }
let changed = false;
products.forEach(product => { if (product.status === "active") { changed = togglePinProduct(product.productId) || changed; } });
return { success: true, changed }; });

  // ================= EXPORT =================
  window.PIN_ENGINE_CORE = {
    register,
    get,
    has,
    list,
    call
  };

  console.log("[PIN ENGINE CORE] READY ✔");

})();
