"use strict";

/*
========================================
PIN RUNTIME BOOTSTRAP (FINAL FIX CORE)
========================================
✔ Forces global function registration
✔ Prevents undefined runtime errors
✔ Fixes load-order dependency issues
✔ Safe duplicate protection
✔ Production-safe initializer
========================================
*/

(function () {

  if (window.__PIN_RUNTIME_BOOTSTRAP__) return;
  window.__PIN_RUNTIME_BOOTSTRAP__ = true;

  console.log("[PIN BOOTSTRAP] Initializing...");

  function safeExpose(name) {
    if (typeof window[name] === "undefined") return;

    // already global → skip
    return;
  }

  function registerGlobals() {

    // Flow controller
    if (typeof executePinFlow === "function") {
      window.executePinFlow = executePinFlow;
    }

    // UI router
    if (typeof bindPinUI === "function") {
      window.bindPinUI = bindPinUI;
    }

    // Processor engine
    if (typeof processPinRequestAuto === "function") {
      window.processPinRequestAuto = processPinRequestAuto;
    }

    // Injector
    if (typeof initPinInjector === "function") {
      window.initPinInjector = initPinInjector;
    }

    // Master system safety
    if (typeof loadPins === "function") {
      window.loadPins = loadPins;
    }

    if (typeof createPin === "function") {
      window.createPin = createPin;
    }

    if (typeof assignPin === "function") {
      window.assignPin = assignPin;
    }

    if (typeof usePin === "function") {
      window.usePin = usePin;
    }

  }

  function validateSystem() {

    const required = [
      "executePinFlow",
      "bindPinUI",
      "processPinRequestAuto"
    ];

    const missing = required.filter(fn => typeof window[fn] !== "function");

    if (missing.length > 0) {
      console.error("[PIN BOOTSTRAP] MISSING:", missing);
      return false;
    }

    console.log("[PIN BOOTSTRAP] SYSTEM READY");
    return true;
  }

  function init() {

    registerGlobals();

    validateSystem();

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
