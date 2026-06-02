"use strict";

/*
========================================
PIN UI BINDING COMPATIBILITY LAYER
========================================
✔ Fixes legacy dependency mismatch
✔ Maps old system → new UI modules
✔ Production safe alias bridge
========================================
*/

(function () {

  if (window.pin_ui_binding) return;

  window.pin_ui_binding = {

    injector: () => window.initPinInjector?.(),

    launcher: () => window.openPinRequestPanel?.(),

    renderer: () => window.renderModule?.(),

    inject: () => window.initPinInjector?.(),

    launch: () => window.openPinRequestPanel?.(),

    ui_render_manager: () => window.renderModule?.()

  };

  // SAFE legacy compatibility mapping
  window.pin_ui_injector = window.initPinInjector;
  window.pin_ui_launcher = window.openPinRequestPanel;
  window.ui_render_manager = window.renderModule;

  console.log("[PIN UI BINDING] Compatibility layer ACTIVE ✔");

})();
