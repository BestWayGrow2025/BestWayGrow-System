"use strict";

/*
========================================
PIN UI ROUTER (UNIFIED ENTRY LAYER)
========================================
✔ Single UI entry point for all PIN actions
✔ Routes all requests to routePinRequest()
✔ Prevents direct loadPins misuse
✔ Works across all dashboards
✔ Role-safe UI gateway
========================================
*/

// ================= SAFE INIT =================
(function () {

  if (window.__PIN_UI_ROUTER__) return;

  window.__PIN_UI_ROUTER__ = true;

  document.addEventListener("DOMContentLoaded", function () {
    bindPinUI();
  });

})();

// ================= MAIN BIND =================
function bindPinUI() {

  // Attach ALL PIN buttons globally by attribute
  document.querySelectorAll("[data-pin-action]").forEach(btn => {

    btn.addEventListener("click", function () {

      const action = btn.getAttribute("data-pin-action");

      const payload = safeReadPayload(btn);

      handlePinAction(action, payload);
    });

  });
}

// ================= SAFE PAYLOAD =================
function safeReadPayload(el) {

  try {

    return {
      requestId: el.getAttribute("data-request-id") || null,
      pinId: el.getAttribute("data-pin-id") || null,
      toId: el.getAttribute("data-to-id") || null,
      paymentId: el.getAttribute("data-payment-id") || null
    };

  } catch (e) {
    return {};
  }
}

// ================= MAIN HANDLER =================
function handlePinAction(action, payload) {

  try {

    if (typeof routePinRequest === "function") {

      return routePinRequest(action, payload);

    } else if (typeof executePinFlow === "function") {

      // fallback safety layer
      return executePinFlow(action, payload);

    } else {

      renderFallback();

      return false;
    }

  } catch (err) {

    console.error("PIN UI ERROR:", err);

    alert("PIN system error");

    return false;
  }
}

// ================= FALLBACK UI =================
function renderFallback() {

  const main = document.getElementById("mainContent");

  if (!main) return;

  main.innerHTML = `
    <h3>📌 PIN SYSTEM</h3>
    <p>PIN system not available</p>
  `;
}

// ================= PUBLIC SAFE API =================
window.handlePinAction = handlePinAction;
window.bindPinUI = bindPinUI;

