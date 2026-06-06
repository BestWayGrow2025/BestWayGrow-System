"use strict";

(function () {

  if (window.PIN_DEP_WIRING_ENGINE) return;
  window.PIN_DEP_WIRING_ENGINE = true;

  const DEP_MAP = {

    pin_ui_binding: [
      "pin_ui_injector",
      "pin_ui_launcher"
    ],

    pin_runtime_bootstrap: [
      "bindPinUI",
      "executePinFlow",
      "processPinRequestAuto"
    ],

    pin_system_controller: [
      "executePinFlow",
      "routePinRequest"
    ]

  };

  function wire() {

    const CORE = window.PIN_ENGINE;
    if (!CORE) return false;   // ✅ REQUIRED FIX (your request)

    console.log("[PIN WIRING] Scanning dependencies...");

    Object.keys(DEP_MAP).forEach(target => {

      const deps = DEP_MAP[target];
      let ok = true;

      deps.forEach(dep => {

        if (typeof window[dep] !== "function") {
          ok = false;

          console.warn(
            "[PIN WIRING] Missing dependency:",
            target,
            "→",
            dep
          );
        }

      });

      if (ok) {
        console.log("[PIN WIRING] OK:", target);
      }

    });

    console.log("[PIN WIRING] COMPLETE ✔");

    return true;
  }

  // ❌ NO AUTO EXECUTION
  // wire();

  // ONLY MANUAL EXPORT
  window.runPinDependencyWire = wire;

})();
