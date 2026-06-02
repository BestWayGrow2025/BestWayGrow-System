"use strict";

/*
========================================
PIN ACTION DISPATCHER V1.3 FINAL FIXED + HARDENED
========================================
✔ NAVIGATE action fixed
✔ Router bridge aligned
✔ Engine-safe execution
✔ Silent failure protection added
✔ Structured execution safety layer
✔ Production stable routing support
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

  return (typeof fn === "function") ? fn : null;
}

// ================= NORMALIZER =================
function normalizePinDispatcherAction(actionType) {

  return String(actionType || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

// ================= SAFE EXECUTION WRAPPER =================
function safeExecute(name, fn, args = []) {

  try {

    if (typeof fn !== "function") {
      console.error("[PIN ENGINE MISSING FUNCTION]", name);
      return { success: false, error: "MISSING_FUNCTION" };
    }

    const result = fn(...args);

    // detect silent failure
    if (result === undefined) {
      console.warn("[PIN ENGINE NO RESULT]", name);
    }

    return {
      success: true,
      result
    };

  } catch (err) {

    console.error("[PIN ENGINE ERROR]", name, err);

    return {
      success: false,
      error: err.message || "UNKNOWN_ERROR"
    };
  }
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
  // NAVIGATION FIX (CRITICAL)
  // ==================================================
  if (actionType === "NAVIGATE") {

    const page = payload.page;

    if (!page) {
      console.warn("[PIN DISPATCHER] NAVIGATE missing page");
      return false;
    }

    if (typeof window.openSystemPage === "function") {
      window.openSystemPage(page);
      return true;
    }

    console.warn("[PIN DISPATCHER] No router available for NAVIGATE");
    return false;
  }

  // ==================================================
  // REQUEST SYSTEM
  // ==================================================
  if (
    actionType === "REQUEST_PIN" ||
    actionType === "SYSTEM_PIN_REQUEST" ||
    actionType === "ADMIN_STOCK_REQUEST"
  ) {

    const fn = getPinEngine("createPinRequest");

    const res = safeExecute(
      "createPinRequest",
      fn,
      [{
        ...payload,
        userId: context.userId || null
      }]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // APPROVE REQUEST
  // ==================================================
  if (
    actionType === "APPROVE_REQUEST" ||
    actionType === "PROCESS_REQUEST"
  ) {

    const fn = getPinEngine("processPinRequestAuto");

    const res = safeExecute(
      "processPinRequestAuto",
      fn,
      [payload.requestId]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // REJECT REQUEST
  // ==================================================
  if (actionType === "REJECT_REQUEST") {

    const fn = getPinEngine("rejectPinRequest");

    const res = safeExecute(
      "rejectPinRequest",
      fn,
      [
        payload.requestId,
        context.userId || "SYSTEM"
      ]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // ASSIGN PIN
  // ==================================================
  if (actionType === "ASSIGN_PIN") {

    const fn = getPinEngine("assignPin");

    const res = safeExecute(
      "assignPin",
      fn,
      [
        payload.pinId,
        payload.toId
      ]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // USE PIN
  // ==================================================
  if (actionType === "USE_PIN") {

    const fn = getPinEngine("usePin");

    const res = safeExecute(
      "usePin",
      fn,
      [
        payload.pinId,
        context.userId || "SYSTEM"
      ]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // TRANSFER PIN
  // ==================================================
  if (actionType === "TRANSFER_PIN") {

    const fn = getPinEngine("transferPin");

    const res = safeExecute(
      "transferPin",
      fn,
      [
        payload.pinId,
        payload.fromId,
        payload.toId
      ]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // DELETE PIN
  // ==================================================
  if (actionType === "DELETE_PIN") {

    const fn = getPinEngine("deletePin");

    const res = safeExecute(
      "deletePin",
      fn,
      [payload.pinId]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // OVERRIDE PIN
  // ==================================================
  if (actionType === "OVERRIDE_PIN") {

    const fn = getPinEngine("overridePin");

    const res = safeExecute(
      "overridePin",
      fn,
      [
        payload.pinId,
        context.userId || "SYSTEM"
      ]
    );

    if (!res.success) return false;
    return res.result;
  }

  // ==================================================
  // UNKNOWN ACTION SAFE FAIL
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
    "OVERRIDE_PIN",
    "NAVIGATE"
  ];

  return valid.includes(
    normalizePinDispatcherAction(actionType)
  );
}

// ================= EXPORT =================
window.dispatchPinAction = dispatchPinAction;
window.isValidPinDispatchAction = isValidPinDispatchAction;
