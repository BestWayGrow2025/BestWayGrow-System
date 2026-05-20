 "use strict";

/*
========================================
PIN UI ROUTER (UNIFIED ENTRY LAYER V1.1 - FIXED)
========================================
✔ Single UI entry point for all PIN actions
✔ Safe rebind system (FIXED)
✔ No duplicate binding corruption
✔ DOM refresh safe
✔ Role-safe UI gateway
✔ Click spam protection
✔ Stable event handler lifecycle
========================================
*/

// ================= GLOBAL LOCK =================
let PIN_UI_LOCK = false;

// ================= SAFE INIT =================
(function () {

  if (window.__PIN_UI_ROUTER__) return;

  window.__PIN_UI_ROUTER__ = true;

  document.addEventListener("DOMContentLoaded", function () {
    bindPinUI();
  });

})();

// ================= MAIN BIND (FIXED) =================
function bindPinUI() {

  const buttons = document.querySelectorAll("[data-pin-action]");

  buttons.forEach(btn => {

    // ❌ REMOVE OLD HANDLER IF EXISTS (FIXED)
    if (btn.__PIN_HANDLER__) {
      btn.removeEventListener("click", btn.__PIN_HANDLER__);
    }

    // ✔ NEW SAFE HANDLER
    btn.__PIN_HANDLER__ = function () {

      if (PIN_UI_LOCK) return;

      PIN_UI_LOCK = true;

      setTimeout(() => {
        PIN_UI_LOCK = false;
      }, 300);

      const action = normalizeActionSafe(
        btn.getAttribute("data-pin-action")
      );

      const payload = safeReadPayload(btn);

      handlePinAction(action, payload);
    };

    btn.addEventListener("click", btn.__PIN_HANDLER__);

  });
}

// ================= NORMALIZER =================
function normalizeActionSafe(action) {

  if (!action) return "";

  const map = {
    request_pin: "REQUEST_PIN",
    approve_request: "APPROVE_REQUEST",
    reject_request: "REJECT_REQUEST",
    assign_pin: "ASSIGN_PIN",
    system_pin_request: "SYSTEM_PIN_REQUEST",
    admin_stock_request: "ADMIN_STOCK_REQUEST"
  };

  return map[action] || String(action).toUpperCase();
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

      const res = routePinRequest(action, payload);

      triggerLiveRefresh();

      return res;

    } else if (typeof executePinFlow === "function") {

      const res = executePinFlow(action, payload);

      triggerLiveRefresh();

      return res;

    } else {

      renderFallback();
      return false;
    }

  } catch (err) {

    console.error("PIN UI ERROR:", err);

    alert(err.message || "PIN system error");

    return false;
  }
}

// ================= LIVE REFRESH HOOK =================
function triggerLiveRefresh() {

  try {

    if (typeof loadPinRequests === "function") {
      loadPinRequests();
    }

    if (typeof refreshLivePins === "function") {
      refreshLivePins();
    }

  } catch (_) {}
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

// ================= PUBLIC API =================
window.handlePinAction = handlePinAction;
window.bindPinUI = bindPinUI;
window.triggerLiveRefresh = triggerLiveRefresh;
