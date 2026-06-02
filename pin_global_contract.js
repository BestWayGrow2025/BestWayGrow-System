"use strict";

(function () {

  if (window.__PIN_GLOBAL_CONTRACT__) return;
  window.__PIN_GLOBAL_CONTRACT__ = true;

  function safe(fn) {
    return typeof fn === "function" ? fn : () => {};
  }

  // ================= UI LAYER (SINGLE SOURCE) =================
  window.pin_ui = {
    injector: safe(window.initPinInjector),
    launcher: safe(window.openPinRequestPanel),
    approve: safe(window.openApprovePanel),
    assign: safe(window.openAssignPinPanel)
  };

  // ================= RENDER LAYER =================
  window.ui_render_manager = {
    render: safe(window.renderModule),
    status: safe(window.getUIRenderStatus),
    clear: safe(window.clearViewport)
  };

  // ================= SYSTEM LAYER =================
  window.pin_system = {
    execute: safe(window.pinSystemExecute),
    enqueue: safe(window.enqueuePinTask)
  };

  console.log("[PIN CONTRACT] GLOBAL EXPORT LOCKED ✔");

})();
