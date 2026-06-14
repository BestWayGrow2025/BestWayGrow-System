"use strict";

(function () {

  if (window.__PIN_GLOBAL_CONTRACT__) {
    console.log("[PIN CONTRACT] Already Loaded");
    return;
  }

  window.__PIN_GLOBAL_CONTRACT__ = true;

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
