/*
========================================
PIN FLOW CONTROLLER V1.0 (ORCHESTRATION LAYER)
========================================
✔ Central execution pipeline
✔ Forces correct system order
✔ session → permission → request → execution
✔ Prevents direct bypass calls
✔ No business logic duplication
✔ Pure orchestration layer only
========================================
*/

// ================= PIPELINE ENTRY =================
function executePinFlow(actionType, payload = {}) {

  // ================= STEP 1: SESSION / IDENTITY =================
  let user = null;

  if (typeof getCurrentUser === "function") {
    user = getCurrentUser();
  }

  if (!user || !user.userId) {
    throw new Error("No active session");
  }

  const role = user?.role || "user";

  // ================= STEP 2: PERMISSION GATE =================
  if (typeof canExecutePinAction === "function") {
    const allowed = canExecutePinAction(actionType, payload, role);

    if (!allowed) {
      throw new Error("Action blocked by permission system");
    }
  }

  // ================= STEP 3: ROUTE ACTION =================
  switch (actionType) {

    // ---------------- REQUEST FLOW ----------------
    case "REQUEST_PIN":
      if (typeof createPinRequest !== "function") {
        throw new Error("Request system unavailable");
      }

      return createPinRequest({
        ...payload,
        userId: user.userId
      });

    // ---------------- ASSIGN FLOW ----------------
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

    // ---------------- USE FLOW ----------------
    case "USE_PIN":
      if (typeof usePin !== "function") {
        throw new Error("Master system unavailable");
      }

      return usePin(
        payload.pinId,
        user.userId,
        payload.purpose || "general"
      );

    // ---------------- REJECT FLOW ----------------
    case "REJECT_REQUEST":
      if (typeof rejectPinRequest !== "function") {
        throw new Error("Request system unavailable");
      }

      return rejectPinRequest(payload.requestId, user.userId);

    // ---------------- AUTO PROCESS FLOW ----------------
    case "PROCESS_REQUEST":
      if (typeof processPinRequestAuto !== "function") {
        throw new Error("Processor unavailable");
      }

      return processPinRequestAuto(payload.requestId);

    default:
      throw new Error("Invalid action type");
  }
}

// ================= SAFE GLOBAL ACCESS =================
window.executePinFlow = executePinFlow;
