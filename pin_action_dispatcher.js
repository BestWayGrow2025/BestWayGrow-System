"use strict";

/*
========================================
PIN ACTION DISPATCHER V1.2 FINAL SAFE
========================================
✔ Central action dispatcher
✔ Contract-aware safety gate
✔ Engine-gated execution model
✔ No raw global dependency leaks
✔ Boot-safe execution layer
✔ Production hardened
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_ACTION_DISPATCHER__) return;

  window.__PIN_ACTION_DISPATCHER__ = true;

  console.log("[PIN ACTION DISPATCHER] READY");

})();

// ================= ENGINE GATE =================
function getPinEngine(name) {

  if (!window.PIN_ENGINE) {
    window.PIN_ENGINE = {};
  }

  const fn = window.PIN_ENGINE[name];

  if (typeof fn === "function") {
    return fn;
  }

  return null;
}

// ================= NORMALIZER =================
function normalizePinDispatcherAction(actionType) {

  return String(actionType || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

// ================= MAIN DISPATCH =================
function dispatchPinAction(
  actionType,
  payload = {},
  context = {}
) {

  // ================= CONTRACT SAFETY =================
  if (!window.PIN_GLOBAL_CONTRACT) {
    throw new Error("PIN GLOBAL CONTRACT NOT LOADED");
  }

  actionType = normalizePinDispatcherAction(actionType);

  // ==================================================
  // REQUEST SYSTEM
  // ==================================================
  if (
    actionType === "REQUEST_PIN" ||
    actionType === "SYSTEM_PIN_REQUEST" ||
    actionType === "ADMIN_STOCK_REQUEST"
  ) {

    const fn = getPinEngine("createPinRequest");
    if (!fn) throw new Error("PIN engine unavailable: createPinRequest");

    return fn({
      ...payload,
      userId: context.userId || null
    });
  }

  // ==================================================
  // APPROVE REQUEST
  // ==================================================
  if (
    actionType === "APPROVE_REQUEST" ||
    actionType === "PROCESS_REQUEST"
  ) {

    const fn = getPinEngine("processPinRequestAuto");
    if (!fn) throw new Error("PIN engine unavailable: processPinRequestAuto");

    return fn(payload.requestId);
  }

  // ==================================================
  // REJECT REQUEST
  // ==================================================
  if (actionType === "REJECT_REQUEST") {

    const fn = getPinEngine("rejectPinRequest");
    if (!fn) throw new Error("PIN engine unavailable: rejectPinRequest");

    return fn(
      payload.requestId,
      context.userId || "SYSTEM"
    );
  }

  // ==================================================
  // ASSIGN PIN
  // ==================================================
  if (actionType === "ASSIGN_PIN") {

    const fn = getPinEngine("assignPin");
    if (!fn) throw new Error("PIN engine unavailable: assignPin");

    return fn(
      payload.pinId,
      payload.toId
    );
  }

  // ==================================================
  // USE PIN
  // ==================================================
  if (actionType === "USE_PIN") {

    const fn = getPinEngine("usePin");
    if (!fn) throw new Error("PIN engine unavailable: usePin");

    return fn(
      payload.pinId,
      context.userId || "SYSTEM"
    );
  }

  // ==================================================
  // TRANSFER PIN
  // ==================================================
  if (actionType === "TRANSFER_PIN") {

    const fn = getPinEngine("transferPin");
    if (!fn) throw new Error("PIN engine unavailable: transferPin");

    return fn(
      payload.pinId,
      payload.fromId,
      payload.toId
    );
  }

  // ==================================================
  // DELETE PIN
  // ==================================================
  if (actionType === "DELETE_PIN") {

    const fn = getPinEngine("deletePin");
    if (!fn) throw new Error("PIN engine unavailable: deletePin");

    return fn(payload.pinId);
  }

  // ==================================================
  // OVERRIDE PIN
  // ==================================================
  if (actionType === "OVERRIDE_PIN") {

    const fn = getPinEngine("overridePin");
    if (!fn) throw new Error("PIN engine unavailable: overridePin");

    return fn(payload.pinId, context.userId || "SYSTEM");
  }

  // ==================================================
  // INVALID ACTION (SAFE FAIL)
  // ==================================================
  console.warn("[PIN DISPATCHER] Unknown action:", actionType);
  return false;
}

// ================= VALIDATOR =================
function isValidPinDispatchAction(actionType) {

  const valid = [
    "REQUEST_PIN",
    "SYSTEM_PIN_REQUEST",
    "ADMIN_STOCK_REQUEST",
    "APPROVE_REQUEST",
    "PROCESS_REQUEST",
    "REJECT_REQUEST",
    "ASSIGN_PIN",
    "USE_PIN",
    "TRANSFER_PIN",
    "DELETE_PIN",
    "OVERRIDE_PIN"
  ];

  return valid.includes(
    normalizePinDispatcherAction(actionType)
  );
}

// ================= EXPORT =================
window.dispatchPinAction = dispatchPinAction;
window.isValidPinDispatchAction = isValidPinDispatchAction;
