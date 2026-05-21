"use strict";

/*
========================================
PIN SYSTEM CONTROLLER V1.0 (TRAFFIC CORE ONLY)
========================================
✔ Single entry gateway
✔ Queue-based execution
✔ No business logic changes
✔ No router modification
✔ No UI modification
✔ Safe production wrapper
========================================
*/

// ================= QUEUE =================
const PIN_QUEUE = [];
let PIN_PROCESSING = false;

// ================= ENTRY POINT =================
function pinSystemExecute(actionType, payload = {}) {

  return enqueueRequest(actionType, payload);
}

// ================= QUEUE HANDLER =================
function enqueueRequest(actionType, payload) {

  PIN_QUEUE.push({ actionType, payload });

  processQueue();

}

// ================= PROCESS QUEUE =================
async function processQueue() {

  if (PIN_PROCESSING) return;

  PIN_PROCESSING = true;

  while (PIN_QUEUE.length > 0) {

    const task = PIN_QUEUE.shift();

    try {

      await executeSafe(task.actionType, task.payload);

    } catch (err) {

      console.error("[PIN CONTROLLER ERROR]", err);

    }

  }

  PIN_PROCESSING = false;
}

// ================= SAFE EXECUTION =================
async function executeSafe(actionType, payload) {

  // STEP 1: ROUTE ONLY (NO LOGIC CHANGE)
  if (typeof routePinRequest === "function") {

    const result = routePinRequest(actionType, payload);

    return result;
  }

  // STEP 2: fallback safe execution
  if (typeof executePinFlow === "function") {

    return executePinFlow(actionType, payload);
  }

  throw new Error("No execution engine found");
}

// ================= EXPORT =================
window.pinSystemExecute = pinSystemExecute;
