"use strict";

/*
========================================
PIN UI AUTO INJECTOR V2.0 (FINAL FIXED CORE)
========================================
✔ Role-safe injection layer
✔ NO event binding (FIXED ARCHITECTURE)
✔ Router-only click handling enforced
✔ MutationObserver safe sync
✔ Duplicate-safe marking only
✔ Production stable
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

// ================= SAFE MARKER BIND (NO EVENTS) =================
function bindPinElements() {

  document.querySelectorAll("[data-pin-action]").forEach(el => {

    if (el.__pinBound) return;

    el.__pinBound = true;

    // ONLY MARK ELEMENTS — NO CLICK EVENTS HERE
    el.setAttribute("data-pin-bound", "true");

  });
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

// ================= EXECUTION (OPTIONAL DEBUG ONLY) =================
function execute(action, payload) {

  try {

    // PRIORITY 1: ROUTER (ONLY REAL PATH)
    if (typeof routePinRequest === "function") {
      return routePinRequest(action, payload);
    }

    // PRIORITY 2: FALLBACK HANDLER
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

// ================= DOM OBSERVER =================
function observeDOMChanges() {

  const observer = new MutationObserver(() => {

    // Only mark new elements, DO NOT rebind events
    bindPinElements();

  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ================= EXPORT =================
window.initPinInjector = initInjector;
