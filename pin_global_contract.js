"use strict";

(function () {

  if (window.PIN_GLOBAL_CONTRACT) {
    console.log("[PIN CONTRACT] Already Loaded");
    return;
  }

  function safe(fn) {
    return typeof fn === "function" ? fn : function () {};
  }

  window.PIN_GLOBAL_CONTRACT = {

    ui: {
      injector: safe(window.initPinInjector),
      launcher: safe(window.openPinRequestPanel),
      approve: safe(window.openApprovePanel),
      assign: safe(window.openAssignPinPanel)
    },

    render: {
      render: safe(window.renderModule),
      status: safe(window.getUIRenderStatus),
      clear: safe(window.clearViewport)
    },

    system: {
      execute: safe(window.pinSystemExecute),
      enqueue: safe(window.enqueuePinTask)
    }

  };

  console.log("[PIN CONTRACT] GLOBAL EXPORT LOCKED ✔");

})();
