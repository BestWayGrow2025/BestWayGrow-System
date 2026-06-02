"use strict";

/*
========================================
PIN UI ACTION BRIDGE v1.0 FIX
========================================
✔ Connects UI buttons → dispatcher
✔ Removes inline onclick dependency
✔ Ensures all PIN actions work
========================================
*/

(function () {

  if (window.__PIN_UI_ACTION_BRIDGE__) return;

  window.__PIN_UI_ACTION_BRIDGE__ = true;

  function bindPinUIActions() {

    document.addEventListener("click", function (e) {

      const el = e.target.closest("[data-pin-action]");
      if (!el) return;

      const action = el.getAttribute("data-pin-action");

      if (!action) return;

      const payload = {
        pinId: el.dataset.pinId || null,
        requestId: el.dataset.requestId || null,
        toId: el.dataset.toId || null,
        fromId: el.dataset.fromId || null
      };

      if (typeof window.dispatchPinAction === "function") {
        window.dispatchPinAction(action, payload, {
          userId: window.getCurrentUser?.()?.id || "SYSTEM"
        });
      } else {
        console.error("[PIN UI] Dispatcher missing");
      }
    });
  }

  function init() {
    bindPinUIActions();
    console.log("[PIN UI BRIDGE] READY");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
