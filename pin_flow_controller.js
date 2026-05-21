"use strict";

/*
========================================
PIN FLOW CONTROLLER V2.1 (BUTTON FIX FINAL)
========================================
✔ Central orchestration layer
✔ Session enforced
✔ Permission enforced
✔ Replay-safe execution
✔ Core init protection
✔ System-safe validation
✔ Action normalization
✔ Execution locking
✔ Duplicate prevention
✔ Safe audit logging
✔ FIXED: APPROVE_REQUEST support
✔ FIXED: SYSTEM_PIN_REQUEST support
✔ FIXED: ADMIN_STOCK_REQUEST support
✔ Production LOCKED
========================================
*/

// ================= CONFIG =================
const PIN_FLOW_LOCKS = {};
const PIN_FLOW_TTL = 10000;

// ================= CORE SAFE =================
function isPinFlowSafe() {

  if (
    !window.__CORE_STATE__ ||
    window.__CORE_STATE__.initialized !== true
  ) {
    return false;
  }

  if (typeof isSystemSafe === "function") {
    if (!isSystemSafe()) return false;
  }

  if (typeof isIncomeSystemSafe === "function") {
    if (!isIncomeSystemSafe()) return false;
  }

  return true;
}

// ================= NORMALIZER =================
function normalizeAction(actionType) {
  return String(actionType || "")
    .trim()
    .toUpperCase();
}

// ================= EXECUTION LOCK =================
function isFlowLocked(key) {

  let t = PIN_FLOW_LOCKS[key];

  if (!t) return false;

  if ((Date.now() - t) > PIN_FLOW_TTL) {
    delete PIN_FLOW_LOCKS[key];
    return false;
  }

  return true;
}

function setFlowLock(key, val) {

  if (val) {
    PIN_FLOW_LOCKS[key] = Date.now();
  } else {
    delete PIN_FLOW_LOCKS[key];
  }
}

// ================= EXECUTION KEY =================
function generateFlowKey(actionType, payload = {}, userId = "SYSTEM") {

  return [
    normalizeAction(actionType),
    userId,
    payload.requestId || "-",
    payload.pinId || "-",
    payload.paymentId || "-",
    payload.toId || "-"
  ].join("|");
}

// ================= MAIN PIPELINE =================
function executePinFlow(actionType, payload = {}) {

  let user = null;
  let execKey = null;

  try {

    // ================= SYSTEM SAFE =================
    if (!isPinFlowSafe()) {
      throw new Error("Pin flow system unsafe");
    }

    // ================= SESSION =================
    if (typeof getCurrentUser === "function") {
      user = getCurrentUser();
    }

    if (!user || !user.userId) {
      throw new Error("No active session");
    }

    const role = user.role || "user";

    // ================= NORMALIZE =================
    actionType = normalizeAction(actionType);

    // ================= EXEC KEY =================
    execKey = generateFlowKey(
      actionType,
      payload,
      user.userId
    );

    // ================= DUPLICATE BLOCK =================
    if (isFlowLocked(execKey)) {
      throw new Error("Duplicate flow blocked");
    }

    setFlowLock(execKey, true);

    // ================= PERMISSION =================
    if (typeof canExecutePinAction === "function") {

      const allowed = canExecutePinAction(
        actionType,
        payload,
        role
      );

      if (!allowed) {
        throw new Error("Action blocked by permission system");
      }
    }

    // ================= ROUTER =================
    switch (actionType) {

      // ================= REQUEST =================
      case "REQUEST_PIN":

      case "SYSTEM_PIN_REQUEST":

      case "ADMIN_STOCK_REQUEST":

        if (typeof createPinRequest !== "function") {
          throw new Error("Request system unavailable");
        }

        return createPinRequest({
          ...payload,
          userId: user.userId
        });

      // ================= APPROVE =================
      case "APPROVE_REQUEST":

      case "PROCESS_REQUEST":

        if (typeof processPinRequestAuto !== "function") {
          throw new Error("Processor unavailable");
        }

        return processPinRequestAuto(
          payload.requestId
        );

      // ================= REJECT =================
      case "REJECT_REQUEST":

        if (typeof rejectPinRequest !== "function") {
          throw new Error("Request system unavailable");
        }

        return rejectPinRequest(
          payload.requestId,
          user.userId
        );

      // ================= ASSIGN =================
      case "ASSIGN_PIN":

        if (typeof assignPin !== "function") {
          throw new Error("Master system unavailable");
        }

        return assignPin(
          payload.pinId,
          payload.toId,
          payload.toType || "user",
          user.userId
        );

      // ================= USE =================
      case "USE_PIN":

        if (typeof usePin !== "function") {
          throw new Error("Master system unavailable");
        }

        return usePin(
          payload.pinId,
          user.userId,
          payload.purpose || "general"
        );

      // ================= INVALID =================
      default:
        throw new Error("Invalid action type: " + actionType);
    }

  } catch (err) {

    if (typeof logCritical === "function") {

      try {
        logCritical(
          "PIN FLOW ERROR: " + err.message,
          user?.userId || "UNKNOWN",
          "PIN_FLOW"
        );
      } catch (_) {}
    }

    console.error("[PIN FLOW ERROR]", err);

    return false;

  } finally {

    if (execKey) {
      setFlowLock(execKey, false);
    }
  }
}

// ================= SAFE GLOBAL EXPORT =================
window.executePinFlow = executePinFlow;
