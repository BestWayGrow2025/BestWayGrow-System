"use strict";

/*
========================================
PIN AUTO HEAL ENGINE v1.0
========================================
✔ Auto repairs missing engine functions
✔ Prevents runtime crashes
✔ Fallback safety layer
========================================
*/

(function () {

  if (window.__PIN_AUTO_HEAL_ENGINE__) return;
  window.__PIN_AUTO_HEAL_ENGINE__ = true;

  function ensureEngine() {
    window.PIN_ENGINE = window.PIN_ENGINE || {};
  }

  function registerFallback(name) {

    if (typeof window.PIN_ENGINE[name] === "function") return;

    window.PIN_ENGINE[name] = function () {
      console.warn("[AUTO HEAL] Fallback executed:", name);

      window.broadcastPinEvent?.("PIN_AUTO_HEAL", {
        action: name,
        status: "FALLBACK_USED",
        timestamp: Date.now()
      });

      return { success: false, healed: true };
    };

    console.log("[AUTO HEAL] Registered fallback:", name);
  }

  function scanAndHeal() {

    ensureEngine();

    const critical = [
      "createPinRequest",
      "processPinRequestAuto",
      "rejectPinRequest",
      "assignPin",
      "usePin",
      "transferPin",
      "deletePin",
      "overridePin"
    ];

    critical.forEach(registerFallback);
  }

  function init() {
    scanAndHeal();
    console.log("[PIN AUTO HEAL ENGINE] READY");
  }

  init();

})();
