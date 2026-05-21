"use strict";

/*
========================================
PIN ACTION DISPATCHER V1.0
========================================
✔ Central action dispatcher
✔ One-way execution mapping
✔ Engine delegation only
✔ NO session logic
✔ NO permission logic
✔ NO UI logic
✔ NO storage ownership
✔ Single responsibility only
✔ Production LOCKED
========================================
*/

// ================= NORMALIZER =================
function normalizePinDispatcherAction(actionType) {

  return String(actionType || "")
    .trim()
    .toUpperCase();
}

// ================= MAIN DISPATCH =================
function dispatchPinAction(
  actionType,
  payload = {},
  context = {}
) {

  actionType =
    normalizePinDispatcherAction(actionType);

  // ==================================================
  // REQUEST SYSTEM
  // ==================================================
  if (
    actionType === "REQUEST_PIN" ||
    actionType === "SYSTEM_PIN_REQUEST" ||
    actionType === "ADMIN_STOCK_REQUEST"
  ) {

    if (typeof createPinRequest !== "function") {
      throw new Error(
        "PIN request engine unavailable"
      );
    }

    return createPinRequest({
      ...payload,
      userId: context.userId
    });
  }

  // ==================================================
  // REQUEST PROCESSOR
  // ==================================================
  if (
    actionType === "APPROVE_REQUEST" ||
    actionType === "PROCESS_REQUEST"
  ) {

    if (
      typeof processPinRequestAuto !== "function"
    ) {
      throw new Error(
        "PIN processor unavailable"
      );
    }

    return processPinRequestAuto(
      payload.requestId
    );
  }

  // ==================================================
  // REQUEST REJECTION
  // ==================================================
  if (actionType === "REJECT_REQUEST") {

    if (
      typeof rejectPinRequest !== "function"
    ) {
      throw new Error(
        "PIN rejection engine unavailable"
      );
    }

    return rejectPinRequest(
      payload.requestId,
      context.userId
    );
  }

  // ==================================================
  // PIN ASSIGNMENT
  // ==================================================
  if (actionType === "ASSIGN_PIN") {

    if (typeof assignPin !== "function") {
      throw new Error(
        "PIN assignment engine unavailable"
      );
    }

    return assignPin(
      payload.pinId,
      payload.toId
    );
  }

  // ==================================================
  // PIN USAGE
  // ==================================================
  if (actionType === "USE_PIN") {

    if (typeof usePin !== "function") {
      throw new Error(
        "PIN usage engine unavailable"
      );
    }

    return usePin(
      payload.pinId,
      context.userId
    );
  }

  // ==================================================
  // INVALID ACTION
  // ==================================================
  throw new Error(
    "Unknown PIN action: " + actionType
  );
}

// ================= EXPORT =================
window.dispatchPinAction = dispatchPinAction;
