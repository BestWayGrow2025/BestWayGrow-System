"use strict";

/*
========================================
PIN QUEUE ENGINE (MINIMAL REQUIRED BRIDGE)
========================================
✔ Connects request system → processor
✔ Fixes processPinQueue undefined
✔ Safe scheduler layer
========================================
*/

function processPinQueue() {
  try {
    if (typeof getPinRequests !== "function") return;

    const requests = getPinRequests();

    if (!Array.isArray(requests)) return;

    const pending = requests.filter(r => r.status === "PENDING");

    for (let i = 0; i < pending.length; i++) {
      const req = pending[i];

      if (!req || !req.requestId) continue;

      if (typeof processPinRequestAuto === "function") {
        processPinRequestAuto(req.requestId);
      }
    }

  } catch (err) {
    console.error("[PIN QUEUE ERROR]", err);
  }
}

window.processPinQueue = processPinQueue;
