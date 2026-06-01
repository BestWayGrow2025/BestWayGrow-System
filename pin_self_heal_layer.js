"use strict";

(function () {

  if (window.PIN_SELF_HEAL_LAYER) return;
  window.PIN_SELF_HEAL_LAYER = true;

  const REQUIRED = [
    "executePinFlow",
    "bindPinUI",
    "processPinRequestAuto",
    "initPinInjector",
    "loadPins",
    "createPin",
    "assignPin",
    "usePin"
  ];

  function safeStub(name) {

    console.warn(
      "[PIN SELF-HEAL] Creating fallback for:",
      name
    );

    return function () {
      console.warn(
        "[PIN STUB EXECUTED]",
        name
      );
      return null;
    };

  }

  function heal() {

    REQUIRED.forEach(fn => {

      if (typeof window[fn] !== "function") {

        window[fn] = safeStub(fn);

      }

    });

    console.log("[PIN SELF-HEAL] COMPLETED ✔");

  }

  heal();

})();
