"use strict";

/*
========================================
PIN FLOW CONTROLLER V3.0
========================================
✔ Central orchestration layer
✔ One-way traffic controller
✔ Delegates responsibility only
✔ NO business logic ownership
✔ NO storage ownership
✔ NO UI logic
✔ NO router ownership
✔ Queue-safe execution
✔ Single responsibility enforced
✔ Production LOCKED
========================================
*/

// ================= NORMALIZER =================
function normalizePinFlowAction(actionType) {

  return String(actionType || "")
    .trim()
    .toUpperCase();
}

// ================= FLOW KEY =================
function generatePinFlowKey(
  actionType,
  payload = {},
  userId = "SYSTEM"
) {

  return [
    normalizePinFlowAction(actionType),
    userId,
    payload.requestId || "-",
    payload.pinId || "-",
    payload.paymentId || "-",
    payload.toId || "-"
  ].join("|");
}

// ================= MAIN FLOW =================
function executePinFlow(
  actionType,
  payload = {}
) {

  return executePinSafe(
    "PIN_FLOW_CONTROLLER",
    function () {

      // ================= SYSTEM SAFETY =================
      if (
        typeof isPinFlowSystemSafe !== "function"
      ) {
        throw new Error(
          "PIN system guard unavailable"
        );
      }

      if (!isPinFlowSystemSafe()) {
        throw new Error(
          "PIN flow system unsafe"
        );
      }

      // ================= SESSION SAFETY =================
      if (
        typeof isPinSessionValid !== "function"
      ) {
        throw new Error(
          "PIN session guard unavailable"
        );
      }

      if (!isPinSessionValid()) {
        throw new Error(
          "Invalid session"
        );
      }

      // ================= USER CONTEXT =================
      const userId =
        getPinSessionUserId();

      const role =
        getPinSessionRole();

      // ================= ACTION =================
      actionType =
        normalizePinFlowAction(actionType);

      // ================= FLOW KEY =================
      const flowKey =
        generatePinFlowKey(
          actionType,
          payload,
          userId
        );

      // ================= DUPLICATE BLOCK =================
      return executeWithPinLock(
        flowKey,
        function () {

          // ================= PERMISSION =================
          if (
            typeof canExecutePinAction ===
            "function"
          ) {

            const allowed =
              canExecutePinAction(
                actionType,
                payload,
                role
              );

            if (!allowed) {
              throw new Error(
                "Action blocked by permission system"
              );
            }
          }

          // ================= DISPATCH =================
          if (
            typeof dispatchPinAction !==
            "function"
          ) {
            throw new Error(
              "PIN dispatcher unavailable"
            );
          }

          return dispatchPinAction(
            actionType,
            payload,
            {
              userId,
              role
            }
          );
        }
      );
    }
  );
}

// ================= EXPORT =================
window.executePinFlow = executePinFlow;
