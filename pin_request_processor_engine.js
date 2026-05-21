"use strict";

/*
========================================
PIN REQUEST PROCESSOR ENGINE V2.1 (CLEAN FLOW)
========================================
✔ Single responsibility: PROCESS requests only
✔ One-way execution flow (NO UI / NO EVENTS)
✔ Queue-safe processing
✔ Master system first, fallback safe
✔ Deterministic execution
✔ Production stable core
========================================
*/

// ================= PROCESS LOCK =================
const PIN_PROCESSOR_LOCKS = {};

// ================= MAIN ENTRY =================
function processPinRequestAuto(requestId) {

  const lockKey = String(requestId || "");

  try {

    // ================= VALIDATION =================
    if (!requestId) {
      throw new Error("Missing requestId");
    }

    // ================= LOCK =================
    if (PIN_PROCESSOR_LOCKS[lockKey]) {
      return false;
    }

    PIN_PROCESSOR_LOCKS[lockKey] = true;

    // ================= LOAD DATA =================
    const requests = getPinRequests();

    if (!Array.isArray(requests)) {
      throw new Error("Request store unavailable");
    }

    const request = requests.find(r => r && r.requestId === requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "PENDING") {
      return false;
    }

    const quantity = Math.max(1, Number(request.quantity || 1));

    let assignedPins = [];

    // ==================================================
    // PRIORITY 1: MASTER SYSTEM (assignPin)
    // ==================================================
    if (typeof assignPin === "function" && typeof loadPins === "function") {

      const pins = loadPins();

      if (!Array.isArray(pins)) {
        throw new Error("PIN store unavailable");
      }

      for (let i = 0; i < quantity; i++) {

        const pin = findAvailablePin(pins, request.type);

        if (!pin || !pin.pinId) {
          throw new Error("No available PIN stock");
        }

        const result = assignPin(
          pin.pinId,
          request.userId,
          "user",
          "AUTO_PROCESSOR"
        );

        if (!result) {
          throw new Error("Master assignment failed");
        }

        assignedPins.push(pin.pinId);
      }

    }

    // ==================================================
    // PRIORITY 2: FALLBACK DIRECT ASSIGNMENT
    // ==================================================
    else {

      if (typeof loadPins !== "function" || typeof savePins !== "function") {
        throw new Error("PIN system not available");
      }

      const pins = loadPins();

      if (!Array.isArray(pins)) {
        throw new Error("PIN store invalid");
      }

      for (let i = 0; i < quantity; i++) {

        const pin = findAvailablePin(pins, request.type);

        if (!pin || !pin.pinId) {
          throw new Error("No available PIN stock");
        }

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

    savePinRequests(requests);

    return true;

  } catch (err) {

    console.error("[PIN PROCESSOR ERROR]", err.message);

    // ================= FAILURE UPDATE =================
    try {

      const requests = getPinRequests();

      if (Array.isArray(requests)) {

        const req = requests.find(r => r && r.requestId === requestId);

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

  return pins.find(p => {
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
