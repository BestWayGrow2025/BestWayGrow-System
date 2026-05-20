"use strict";

/*
========================================
PIN REQUEST PROCESSOR ENGINE V2.0 (FINAL HARDENED)
========================================
✔ Executes queued PIN requests
✔ Connects request → master system
✔ Duplicate-safe processing
✔ Queue-compatible execution layer
✔ Uses master system assignPin() when available
✔ Safe fallback to direct stock assignment
✔ Production-safe processor
========================================
*/

// ================= PROCESS LOCK =================
const PIN_PROCESSOR_LOCKS = {};

// ================= ENTRY =================
function processPinRequestAuto(requestId) {

  let lockKey = String(requestId || "");

  try {

    // ================= VALIDATION =================
    if (!requestId) {
      throw new Error("Missing requestId");
    }

    // ================= DUPLICATE PROTECTION =================
    if (PIN_PROCESSOR_LOCKS[lockKey]) {
      return false;
    }

    PIN_PROCESSOR_LOCKS[lockKey] = true;

    // ================= LOAD REQUESTS =================
    const requests = getPinRequests();
    if (!Array.isArray(requests)) {
      throw new Error("PIN requests storage unavailable");
    }

    const request = requests.find(r => r && r.requestId === requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    // Already processed
    if (request.status !== "PENDING") {
      return false;
    }

    // ================= BASIC VALIDATION =================
    if (!request.userId || !request.type) {
      throw new Error("Invalid request data");
    }

    const quantity = Math.max(1, Number(request.quantity || 1));

    // ================= PROCESS =================
    let assignedPins = [];

    // ==================================================
    // PRIORITY 1: USE MASTER SYSTEM assignPin()
    // ==================================================
    if (typeof assignPin === "function" && typeof loadPins === "function") {

      const pins = loadPins();
      if (!Array.isArray(pins)) {
        throw new Error("PIN storage unavailable");
      }

      for (let i = 0; i < quantity; i++) {

        let pin = findAvailablePin(pins, request.type);

        if (!pin || !pin.pinId) {
          throw new Error("No available PIN stock");
        }

        const result = assignPin(
          pin.pinId,
          request.userId,
          "user",
          "AUTO_PROCESSOR"
        );

        if (result === false) {
          throw new Error("Master system assignment failed");
        }

        assignedPins.push(pin.pinId);
      }

    }
    // ==================================================
    // PRIORITY 2: FALLBACK DIRECT ASSIGNMENT
    // ==================================================
    else {

      if (
        typeof loadPins !== "function" ||
        typeof savePins !== "function"
      ) {
        throw new Error("PIN system not loaded");
      }

      let pins = loadPins();

      if (!Array.isArray(pins)) {
        throw new Error("PIN storage unavailable");
      }

      for (let i = 0; i < quantity; i++) {

        let pin = findAvailablePin(pins, request.type);

        if (!pin || !pin.pinId) {
          throw new Error("No available PIN stock");
        }

        // Fallback assignment
        pin.status = "assigned";
        pin.assignedTo = request.userId;
        pin.assignedAt = Date.now();

        assignedPins.push(pin.pinId);
      }

      savePins(pins);
    }

    // ================= UPDATE REQUEST =================
    request.status = "APPROVED";
    request.assignedPins = assignedPins;
    request.processedAt = Date.now();
    request.processedBy = "AUTO_PROCESSOR";
    request.failReason = null;

    // ================= SAVE REQUESTS =================
    savePinRequests(requests);

    // ================= LOG =================
    if (typeof logPin === "function") {
      try {
        logPin({
          action: "AUTO_PROCESS",
          pinId: requestId,
          by: "SYSTEM",
          status: "SUCCESS"
        });
      } catch (_) {}
    }

    return true;

  } catch (err) {

    console.error("[PIN PROCESSOR ERROR]", err);

    // ================= FAILURE MARKING =================
    try {

      let requests = getPinRequests();

      if (Array.isArray(requests)) {

        let req = requests.find(
          r => r && r.requestId === requestId
        );

        if (req && req.status === "PENDING") {
          req.status = "FAILED";
          req.failReason = err.message || "Unknown error";
          req.processedAt = Date.now();
          req.processedBy = "AUTO_PROCESSOR";

          savePinRequests(requests);
        }
      }

    } catch (_) {}

    return false;

  } finally {

    delete PIN_PROCESSOR_LOCKS[lockKey];
  }
}

// ================= PIN FINDER =================
function findAvailablePin(pins, type) {

  if (!Array.isArray(pins)) return null;

  const pinType = String(type || "").toLowerCase();

  return pins.find(function (p) {
    return (
      p &&
      p.pinId &&
      p.status === "stock" &&
      (
        pinType === "upgrade"
          ? p.type === "upgrade"
          : p.type === "repurchase"
      )
    );
  }) || null;
}

// ================= EXPORT =================
window.processPinRequestAuto = processPinRequestAuto;
