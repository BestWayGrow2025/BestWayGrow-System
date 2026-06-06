"use strict";

/*
========================================
PIN DEPENDENCY WIRING ENGINE v1.0
PASSIVE ONLY (BOOT CONTROLLED)
========================================
✔ No auto execution
✔ Dependency scanner only
✔ Safe diagnostics layer
========================================
*/

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

    console.log("[PIN WIRING] Scanning dependencies...");

    Object.keys(DEP_MAP).forEach(target => {

      const deps = DEP_MAP[target];
      let ok = true;

      deps.forEach(dep => {
        if (typeof window[dep] !== "function") {
          ok = false;
          console.warn("[PIN WIRING] Missing:", target, "→", dep);
        }
      });

      if (ok) {
        console.log("[PIN WIRING] OK:", target);
      }

    });

    console.log("[PIN WIRING] COMPLETE ✔");
  }

  // ONLY EXPORT — NO EXECUTION
  window.pinDependencyWire = wire;

})();
