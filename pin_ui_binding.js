"use strict";

/*
========================================
PIN UI BINDING COMPATIBILITY LAYER
========================================
✔ Fixes legacy dependency mismatch
✔ Maps old system → new UI modules
✔ Production safe alias bridge
✔ Passive only
========================================
*/

(function () {

  if (
    window.__PIN_UI_BINDING__ &&
    window.__PIN_UI_BINDING__.initialized
  ) {
    return;
  }

  window.__PIN_UI_BINDING__ = {
    initialized: true,
    ready: false,
    timestamp: Date.now()
  };

})();

// ================= INIT =================

function initPinUIBinding() {

  window.pin_ui_binding = {

    injector: () => window.initPinInjector?.(),

    launcher: () => window.openPinRequestPanel?.(),

    renderer: () => window.renderModule?.(),

    inject: () => window.initPinInjector?.(),

    launch: () => window.openPinRequestPanel?.(),

    ui_render_manager: () => window.renderModule?.()

  };

  window.pin_ui_injector =
    window.initPinInjector;

  window.pin_ui_launcher =
    window.openPinRequestPanel;

  window.ui_render_manager =
    window.renderModule;

  window.__PIN_UI_BINDING__.ready = true;
}

// ================= EXPORT =================

window.initPinUIBinding =
  initPinUIBinding;
