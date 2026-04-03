/*
========================================
PIN REQUEST QUEUE ENGINE (FINAL SAFE)
========================================
✔ Priority based (GREEN > YELLOW > RED)
✔ Batch system (3:2:1)
✔ Lock system
✔ Retry control
✔ Fail-safe (never stops)
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

// ================= GROUP BY PRIORITY =================
function groupByPriority(requests) {
  return {
    GREEN: requests.filter(r => r.priority === "GREEN"),
    YELLOW: requests.filter(r => r.priority === "YELLOW"),
    RED: requests.filter(r => r.priority === "RED")
  };
}

// ================= CREATE BATCH =================
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

  if (isRunning) return;
  if (isPinQueueLocked()) return;

  let batch = getNextBatch();
  if (!batch.length) return;

  isRunning = true;
  setPinQueueLock(true);

  try {

    batch.forEach(req => {

      try {

        processPinRequestAuto(req.requestId);

      } catch (err) {

        console.warn("Queue Error:", err.message);

        req.retry = (req.retry || 0) + 1;

        if (req.retry >= 3) {
          req.status = "FAILED";
          req.failReason = err.message;
        }
      }

    });

    // 🔥 SAVE AFTER BATCH
    let all = getPinRequests();
    savePinRequests(all);

  } catch (err) {

    console.error("Queue Crash:", err);

  } finally {

    setPinQueueLock(false);
    isRunning = false;
  }
}

// ================= AUTO RUN =================
function startPinQueueEngine() {
  setInterval(processPinQueue, 3000); // every 3 sec
}

// ================= START =================
startPinQueueEngine();
