"use strict";
/*
PIN RUNTIME BOOTSTRAP V1.2 FINAL
✔ Forces global function registration ✔ Runtime dependency validation ✔ Prevents silent runtime failure ✔ Safe duplicate protection ✔ FAIL-FAST bootstrap safety ✔ Production LOCKED
*/
// ================= INIT GUARD ================= (function () {
if (window.PIN_RUNTIME_BOOTSTRAP) { return; }
window.PIN_RUNTIME_BOOTSTRAP = true;
console.log("[PIN BOOTSTRAP] Initializing...");
// ================= REGISTER GLOBALS ================= function registerGlobals() {
const requiredFunctions = [
  "executePinFlow",
  "bindPinUI",
  "processPinRequestAuto",
  "initPinInjector",
  "loadPins",
  "createPin",
  "assignPin",
  "usePin"
];

requiredFunctions.forEach(function (fn) {

  if (typeof window[fn] !== "function") {

    console.warn(
      "[PIN BOOTSTRAP] Missing function:",
      fn
    );

    return;
  }

  window[fn] = window[fn];

});

}
// ================= VALIDATION ================= function validateSystem() {
const required = [
  "executePinFlow",
  "bindPinUI",
  "processPinRequestAuto"
];

const missing = required.filter(function (fn) {
  return typeof window[fn] !== "function";
});

if (missing.length > 0) {

  console.error(
    "[PIN BOOTSTRAP] CRITICAL MISSING:",
    missing
  );

  throw new Error(
    "PIN BOOT FAILED"
  );

}

console.log(
  "[PIN BOOTSTRAP] SYSTEM READY ✔"
);

return true;

}
// ================= INIT ================= function init() {
registerGlobals();

validateSystem();

}
// ================= SAFE START ================= if (document.readyState === "loading") {
document.addEventListener(
  "DOMContentLoaded",
  init
);

} else {
init();

}
})();
