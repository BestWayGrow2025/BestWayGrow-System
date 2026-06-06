"use strict";

/*
========================================
PIN RUNTIME BOOTSTRAP V1.3 FINAL SAFE
========================================
✔ Contract-aware boot validation
✔ Hard dependency enforcement
✔ Fail-fast system integrity
✔ Engine-safe global binding
✔ UI + Core dependency verification
✔ Production-safe bootstrap gate
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (
  window.__PIN_RUNTIME_BOOTSTRAP__ &&
  window.__PIN_RUNTIME_BOOTSTRAP__.initialized
) {
  return;
}

window.__PIN_RUNTIME_BOOTSTRAP__ = {
  initialized: true,
  ready: false,
  timestamp: Date.now()
};

  console.log("[PIN BOOTSTRAP] Initializing...");

  // ================= CONTRACT SAFETY =================
  function ensureContract() {

    if (!window.PIN_GLOBAL_CONTRACT) {
      console.error("[PIN BOOTSTRAP] CONTRACT MISSING");
      throw new Error("PIN GLOBAL CONTRACT NOT LOADED");
    }

    return true;
  }

  // ================= ENGINE RESOLUTION =================
  function resolve(fnName) {

    // Prefer engine registry
    if (window.PIN_ENGINE && typeof window.PIN_ENGINE[fnName] === "function") {
      return window.PIN_ENGINE[fnName];
    }

    // Fallback global
    if (typeof window[fnName] === "function") {
      return window[fnName];
    }

    return null;
  }

  // ================= REQUIRED FUNCTIONS =================
  const requiredFunctions = [
    "executePinFlow",
    "bindPinUI",
    "processPinRequestAuto",
    "initPinInjector",
    "loadPins",
    "createPin",
    "assignPin",
    "usePin"
  ];

  // ================= REGISTER / VALIDATE =================
  function registerAndValidate() {

    const missing = [];

    requiredFunctions.forEach((fn) => {

      const resolved = resolve(fn);

      if (!resolved) {
        missing.push(fn);
        return;
      }

      // normalize into engine layer (preferred)
      window.PIN_ENGINE = window.PIN_ENGINE || {};
      window.PIN_ENGINE[fn] = resolved;

    });

    if (missing.length > 0) {

      console.error("[PIN BOOTSTRAP] CRITICAL MISSING FUNCTIONS:", missing);

      throw new Error("PIN BOOT FAILED - MISSING DEPENDENCIES");
    }

    console.log("[PIN BOOTSTRAP] All dependencies resolved ✔");
  }

  // ================= VALIDATION =================
  function validateSystem() {

    const required = [
      "executePinFlow",
      "bindPinUI",
      "processPinRequestAuto"
    ];

    const missing = required.filter(fn =>
      typeof window.PIN_ENGINE?.[fn] !== "function"
    );

    if (missing.length > 0) {

      console.error("[PIN BOOTSTRAP] SYSTEM INVALID:", missing);

      throw new Error("PIN BOOT FAILED");
    }

    console.log("[PIN BOOTSTRAP] SYSTEM READY ✔");

    return true;
  }

  // ================= INIT =================
 function init() {

  ensureContract();
  registerAndValidate();
  validateSystem();

  window.__PIN_RUNTIME_BOOTSTRAP__.ready = true;
}

 // ================= EXPORT =================

window.initPinRuntimeBootstrap = init;

})();
