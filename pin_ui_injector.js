"use strict";

/*
========================================
PIN UI AUTO INJECTOR V2.0 (FINAL SAFE CORE)
========================================
✔ Role-safe injection layer
✔ Attribute-based binding only
✔ Router-first execution enforced
✔ Duplicate-safe binding
✔ No DOM brute scanning
✔ MutationObserver sync safe
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_UI_INJECTOR__) return;

  window.__PIN_UI_INJECTOR__ = true;

  document.addEventListener("DOMContentLoaded", initInjector);

})();

// ================= INIT =================
function initInjector() {

  bindPinElements();

  observeDOMChanges();
}

// ================= SAFE BIND =================
function bindPinElements() {

  document.querySelectorAll("[data-pin-action]").forEach(el => {

    if (el.__pinBound) return;

    el.__pinBound = true;

    el.addEventListener("click", function (e) {

      e.preventDefault();

      const action = el.getAttribute("data-pin-action");

      const payload = extractPayload(el);

      execute(action, payload);

    });
  });
}

// ================= EXECUTION =================
function execute(action, payload) {

  try {

    // PRIORITY 1: ROUTER (MANDATORY PATH)
    if (typeof routePinRequest === "function") {
      return routePinRequest(action, payload);
    }

    // PRIORITY 2: SAFE FALLBACK ONLY
    if (typeof handlePinAction === "function") {
      return handlePinAction(action, payload);
    }

    console.error("PIN SYSTEM NOT AVAILABLE");

    return false;

  } catch (err) {

    console.error("PIN INJECTOR ERROR:", err);

    return false;
  }
}

// ================= PAYLOAD =================
function extractPayload(el) {

  return {
    requestId: el.dataset.requestId || el.getAttribute("data-request-id") || null,
    pinId: el.dataset.pinId || el.getAttribute("data-pin-id") || null,
    toId: el.dataset.toId || el.getAttribute("data-to-id") || null,
    paymentId: el.dataset.paymentId || el.getAttribute("data-payment-id") || null
  };
}

// ================= DOM OBSERVER =================
function observeDOMChanges() {

  const observer = new MutationObserver(() => {
    bindPinElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ================= EXPORT =================
window.initPinInjector = initInjector;
