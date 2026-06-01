"use strict";

/*
========================================
PIN ACTION DISPATCHER V1.1 (FULL FIXED)
========================================
✔ Central action dispatcher
✔ Safe normalization (system-compatible)
✔ One-way execution mapping
✔ Engine delegation only
✔ NO session logic
✔ NO permission logic
✔ NO UI logic
✔ FULL SAFE RESTORED FILE
✔ Production READY
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_ACTION_DISPATCHER__) return;

  window.__PIN_ACTION_DISPATCHER__ = true;

  console.log("[PIN ACTION DISPATCHER] READY");

})();

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

  actionType = normalizePinDispatcherAction(actionType);

  // ==================================================
  // REQUEST SYSTEM
  // ==================================================
  if (
    actionType === "REQUEST_PIN" ||
    actionType === "SYSTEM_PIN_REQUEST" ||
    actionType === "ADMIN_STOCK_REQUEST"
  ) {

    if (typeof createPinRequest !== "function") {
      throw new Error("PIN request engine unavailable");
    }

    return createPinRequest({
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

    if (typeof processPinRequestAuto !== "function") {
      throw new Error("PIN processor unavailable");
    }

    return processPinRequestAuto(payload.requestId);
  }

  // ==================================================
  // REJECT REQUEST
  // ==================================================
  if (actionType === "REJECT_REQUEST") {

    if (typeof rejectPinRequest !== "function") {
      throw new Error("PIN rejection engine unavailable");
    }

    return rejectPinRequest(
      payload.requestId,
      context.userId || "SYSTEM"
    );
  }

  // ==================================================
  // ASSIGN PIN
  // ==================================================
  if (actionType === "ASSIGN_PIN") {

    if (typeof assignPin !== "function") {
      throw new Error("PIN assignment engine unavailable");
    }

    return assignPin(
      payload.pinId,
      payload.toId
    );
  }

  // ==================================================
  // USE PIN
  // ==================================================
  if (actionType === "USE_PIN") {

    if (typeof usePin !== "function") {
      throw new Error("PIN usage engine unavailable");
    }

    return usePin(
      payload.pinId,
      context.userId || "SYSTEM"
    );
  }

  // ==================================================
  // TRANSFER PIN
  // ==================================================
  if (actionType === "TRANSFER_PIN") {

    if (typeof transferPin !== "function") {
      throw new Error("PIN transfer engine unavailable");
    }

    return transferPin(
      payload.pinId,
      payload.fromId,
      payload.toId
    );
  }

  // ==================================================
  // DELETE PIN
  // ==================================================
  if (actionType === "DELETE_PIN") {

    if (typeof deletePin !== "function") {
      throw new Error("PIN delete engine unavailable");
    }

    return deletePin(payload.pinId);
  }

  // ==================================================
  // OVERRIDE PIN
  // ==================================================
  if (actionType === "OVERRIDE_PIN") {

    if (typeof overridePin !== "function") {
      throw new Error("PIN override engine unavailable");
    }

    return overridePin(payload.pinId, context.userId);
  }

  // ==================================================
  // INVALID ACTION
  // ==================================================
  throw new Error("Unknown PIN action: " + actionType);
}

// ================= SAFE VALIDATOR =================
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
