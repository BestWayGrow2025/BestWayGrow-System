/*
========================================
PIN REQUEST QUEUE ENGINE (FINAL)
========================================
✔ Priority based (GREEN > YELLOW > RED)
✔ Batch processing (3:2:1)
✔ Lock safe
✔ Retry system
✔ Fail-safe
✔ Scalable
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

// ================= PRIORITY WEIGHT =================
const PRIORITY_WEIGHT = {
  GREEN: 3,
  YELLOW: 2,
  RED: 1
};

// ================= GET NEXT BATCH =================
function getPriorityBatch(requests) {

  let groups = {
    GREEN: [],
    YELLOW: [],
    RED: []
  };

  requests.forEach(r => {
    if (r.status === "PENDING") {
      let p = r.priority || "YELLOW";
      groups[p].push(r);
    }
  });

  return [
    ...groups.GREEN.slice(0, PRIORITY_WEIGHT.GREEN),
    ...groups.YELLOW.slice(0, PRIORITY_WEIGHT.YELLOW),
    ...groups.RED.slice(0, PRIORITY_WEIGHT.RED)
  ];
}

// ================= PROCESS QUEUE =================
let pinQueueRunning = false;

function processPinRequestQueue() {

  if (pinQueueRunning) return;
  if (isPinQueueLocked()) return;

  let requests = getPinRequests();
  if (!requests.length) return;

  pinQueueRunning = true;
  setPinQueueLock(true);

  try {

    let batch = getPriorityBatch(requests);

    if (!batch.length) return;

    batch.forEach(req => {

      try {

        processPinRequestAuto(req.requestId);

      } catch (err) {

        console.warn("PIN Queue Error:", err.message);

        // retry logic
        req.retry = (req.retry || 0) + 1;

        if (req.retry >= 3) {
          req.status = "FAILED";
          req.failReason = err.message;
        }
      }

    });

    savePinRequests(requests);

  } catch (err) {

    console.error("Queue Crash:", err);

  } finally {

    setPinQueueLock(false);
    pinQueueRunning = false;
  }
}

// ================= AUTO RUN =================
function startPinQueueEngine() {

  setInterval(() => {
    processPinRequestQueue();
  }, 3000); // every 3 sec

}

// ================= START =================
startPinQueueEngine();
