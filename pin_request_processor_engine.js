"use strict";

/*
========================================
PIN REQUEST PROCESSOR ENGINE V1.0
========================================
✔ Executes queued PIN requests
✔ Connects request → master system
✔ Safe retry handling
✔ Duplicate protection respected
✔ Queue-compatible execution layer
✔ Production-safe processor
========================================
*/

/* ================= ENTRY ================= */

/**
 * MAIN EXECUTOR (CALLED BY QUEUE ENGINE)
 */
function processPinRequestAuto(requestId) {

  try {

    if (!requestId) {
      throw new Error("Missing requestId");
    }

    // ================= LOAD REQUESTS =================
    const requests = getPinRequests();
    if (!Array.isArray(requests)) return false;

    const request = requests.find(r => r.requestId === requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "PENDING") {
      return false; // already processed
    }

    // ================= BASIC VALIDATION =================
    if (!request.userId || !request.type) {
      throw new Error("Invalid request data");
    }

    // ================= LOAD PIN SYSTEM =================
    if (typeof loadPins !== "function") {
      throw new Error("PIN system not loaded");
    }

    let pins = loadPins();

    // ================= PROCESS LOGIC =================
    let assignedPins = [];

    for (let i = 0; i < (request.quantity || 1); i++) {

      let pin = findAvailablePin(pins, request.type);

      if (!pin) {
        throw new Error("No available PIN stock");
      }

      // assign pin
      pin.status = "assigned";
      pin.assignedTo = request.userId;
      pin.assignedAt = Date.now();

      assignedPins.push(pin.pinId);
    }

    // ================= UPDATE REQUEST =================
    request.status = "APPROVED";
    request.assignedPins = assignedPins;
    request.processedAt = Date.now();
    request.processedBy = "AUTO_PROCESSOR";

    // ================= SAVE =================
    savePins(pins);
    savePinRequests(requests);

    // ================= LOG =================
    if (typeof logPin === "function") {
      logPin({
        action: "AUTO_PROCESS",
        pinId: requestId,
        by: "SYSTEM",
        status: "SUCCESS"
      });
    }

    // ================= SUCCESS =================
    return true;

  } catch (err) {

    console.error("[PIN PROCESSOR ERROR]", err);

    // mark failure safely
    try {

      let requests = getPinRequests();

      let req = requests.find(r => r.requestId === requestId);

      if (req) {
        req.status = "FAILED";
        req.failReason = err.message || "Unknown error";
        req.processedAt = Date.now();

        savePinRequests(requests);
      }

    } catch (_) {}

    return false;
  }
}

/* ================= PIN FINDER ================= */

/**
 * Finds available PIN from stock
 */
function findAvailablePin(pins, type) {

  if (!Array.isArray(pins)) return null;

  const pinType = (type || "").toLowerCase();

  return pins.find(p => {

    return (
      p &&
      p.status === "stock" &&
      (pinType === "upgrade"
        ? p.type === "upgrade"
        : p.type === "repurchase")
    );
  }) || null;
}

/* ================= EXPORT ================= */

window.processPinRequestAuto = processPinRequestAuto;

