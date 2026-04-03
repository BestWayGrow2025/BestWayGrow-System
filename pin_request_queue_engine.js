/*
========================================
PIN REQUEST QUEUE ENGINE (FINAL MERGED CONTROLLED)
========================================
✔ Priority based (GREEN > YELLOW > RED)
✔ Batch system (3:2:1)
✔ Lock system
✔ Retry control
✔ Fail-safe (never stops)
✔ Data-safe (no mutation loss)
✔ System control (queueStop integrated)
========================================
*/

const PIN_QUEUE_LOCK = "PIN_QUEUE_LOCK";

// ================= LOCK =================
function isPinQueueLocked() {
  return localStorage.getItem(PIN_QUEUE_LOCK) === "true";
}

function setPinQueueLock(val) {
  localStorage.setItem(PIN_QUEUE_LOCK, val ? "true" : "false");
}

// ================= SYSTEM CONTROL =================
function isQueueAllowed() {
  let s = JSON.parse(localStorage.getItem("systemSettings")) || {};
  return !s.queueStop; // true = allowed, false = stopped
}

// ================= PRIORITY =================
const PRIORITY_WEIGHT = {
  GREEN: 3,
  YELLOW: 2,
  RED: 1
};

// ================= GET REQUESTS =================
function getPendingRequests() {
  let all = getPinRequests();
  return all.filter(r => r.status === "PENDING");
}

// ================= GROUP =================
function groupByPriority(requests) {
  return {
    GREEN: requests.filter(r => (r.priority || "YELLOW") === "GREEN"),
    YELLOW: requests.filter(r => (r.priority || "YELLOW") === "YELLOW"),
    RED: requests.filter(r => (r.priority || "YELLOW") === "RED")
  };
}

// ================= BATCH =================
function getNextBatch() {

  let pending = getPendingRequests();
  let grouped = groupByPriority(pending);

  return [
    ...grouped.GREEN.slice(0, PRIORITY_WEIGHT.GREEN),
    ...grouped.YELLOW.slice(0, PRIORITY_WEIGHT.YELLOW),
    ...grouped.RED.slice(0, PRIORITY_WEIGHT.RED)
  ];
}

// ================= PROCESS =================
let isRunning = false;

function processPinQueue() {

  // 🔥 SYSTEM CONTROL CHECK
  if (!isQueueAllowed()) return;

  if (isRunning) return;
  if (isPinQueueLocked()) return;

  let batch = getNextBatch();
  if (!batch.length) return;

  isRunning = true;
  setPinQueueLock(true);

  try {

    let allRequests = getPinRequests();

    batch.forEach(req => {

      let realReq = allRequests.find(r => r.requestId === req.requestId);
      if (!realReq) return;

      try {

        // 🔥 PROCESS USING CORE ENGINE
        processPinRequestAuto(realReq.requestId);

      } catch (err) {

        console.warn("Queue Error:", err.message);

        realReq.retry = (realReq.retry || 0) + 1;

        if (realReq.retry >= 3) {
          realReq.status = "FAILED";
          realReq.failReason = err.message;
          realReq.processedAt = Date.now();
        }
      }

    });

    // 🔥 SAVE AFTER UPDATE
    savePinRequests(allRequests);

  } catch (err) {

    console.error("Queue Crash:", err);

  } finally {

    setPinQueueLock(false);
    isRunning = false;
  }
}

// ================= AUTO RUN =================
function startPinQueueEngine() {

  // 🔒 SAFETY CHECK
  if (typeof processPinRequestAuto !== "function") {
    console.error("processPinRequestAuto not found");
    return;
  }

  setInterval(processPinQueue, 3000);
}

// ================= START =================
startPinQueueEngine();


