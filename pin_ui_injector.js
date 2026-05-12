"use strict";

/*
========================================
PIN UI AUTO INJECTOR (ZERO HTML EDIT)
========================================
✔ Auto-detects PIN buttons
✔ Auto-converts legacy handlers
✔ Injects unified PIN routing layer
✔ Forces UI → router → engine flow
✔ No manual HTML changes required
✔ Production safe injector layer
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_UI_INJECTOR__) return;

  window.__PIN_UI_INJECTOR__ = true;

  document.addEventListener("DOMContentLoaded", initInjector);

})();

// ================= MAIN INIT =================
function initInjector() {

  scanAndInject();

  // watch DOM changes (dynamic dashboards)
  const observer = new MutationObserver(() => {
    scanAndInject();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ================= SCAN DOM =================
function scanAndInject() {

  injectLegacyButtons();

  injectMissingPinActions();
}

// ================= LEGACY FIX =================
function injectLegacyButtons() {

  document.querySelectorAll("button, a, div").forEach(el => {

    const text = (el.innerText || "").toLowerCase();

    // detect old PIN buttons
    if (text.includes("pin") && text.includes("request")) {
      forcePinAction(el, "REQUEST_PIN");
    }

    if (text.includes("approve") && text.includes("pin")) {
      forcePinAction(el, "APPROVE_REQUEST");
    }

    if (text.includes("reject") && text.includes("pin")) {
      forcePinAction(el, "REJECT_REQUEST");
    }

    if (text.includes("stock") && text.includes("pin")) {
      forcePinAction(el, "ADMIN_STOCK_REQUEST");
    }
  });
}

// ================= FORCE ACTION =================
function forcePinAction(el, action) {

  if (!el) return;

  // prevent double binding
  if (el.dataset.pinInjected === "true") return;

  el.dataset.pinInjected = "true";

  el.setAttribute("data-pin-action", action);

  // remove old onclick (CRITICAL FIX)
  el.onclick = null;

  // rebind safe router call
  el.addEventListener("click", function (e) {

    e.preventDefault();

    if (typeof handlePinAction === "function") {

      handlePinAction(action, extractPayload(el));

    } else if (typeof routePinRequest === "function") {

      routePinRequest(action, extractPayload(el));

    }
  });
}

// ================= PAYLOAD EXTRACTION =================
function extractPayload(el) {

  return {
    requestId: el.getAttribute("data-request-id") || null,
    pinId: el.getAttribute("data-pin-id") || null,
    toId: el.getAttribute("data-to-id") || null,
    paymentId: el.getAttribute("data-payment-id") || null
  };
}

// ================= MISSING ACTION FIX =================
function injectMissingPinActions() {

  document.querySelectorAll("[data-pin-action]").forEach(el => {

    if (!el.dataset.pinBound) {

      el.dataset.pinBound = "true";

      el.addEventListener("click", function () {

        const action = el.dataset.pin-action;

        if (typeof handlePinAction === "function") {
          handlePinAction(action, extractPayload(el));
        }
      });
    }
  });
}

// ================= EXPORT =================
window.scanAndInject = scanAndInject;
window.forcePinAction = forcePinAction;
