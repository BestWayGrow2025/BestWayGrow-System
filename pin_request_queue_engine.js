/*
========================================
PIN REQUEST QUEUE ENGINE (ENTERPRISE FINAL v8)
========================================
✔ Fully system aligned (core_system)
✔ No direct localStorage
✔ Safe lock system
✔ Priority batch processing
✔ Retry + fail-safe
✔ System ON/OFF control
✔ Dependency-safe (WAIT MODE)
✔ Production ready
========================================
*/

// ================= CONFIG =================
const RETRY_LIMIT = 3;

// ================= DEPENDENCY CHECK =================
function isDependencyReady() {
  return (
    typeof processPinRequestAuto === "function" &&
    typeof getPinRequests === "function" &&
    typeof savePinRequests === "function" &&
    typeof getSystemSettings === "function" &&
    typeof saveSystemSettings === "function"
  );
}

// ================= SYSTEM SETTINGS =================
function getQueueSettings() {
  let settings = getSystemSettings() || {};

  if (!settings.pinQueue) {
    settings.pinQueue = {
      enabled: true,
      lock: false
    };
    saveSystemSettings(settings);
  }

  return settings.pinQueue;
}

function updateQueueSettings(data) {
  let settings = getSystemSettings() || {};
  settings.pinQueue = { ...settings.pinQueue, ...data };
  saveSystemSettings(settings);
}

// ================= CONTROL =================
function isQueueAllowed() {
  let q = getQueueSettings();
  return q.enabled === true;
}

// ================= LOCK =================
function isQueueLocked() {
  let q = getQueueSettings();
  return q.lock === true;
}

function setQueueLock(val) {
  updateQueueSettings({ lock: val });
}

// ================= PRIORITY =================
const PRIORITY_WEIGHT = {
  GREEN: 3,
  YELLOW: 2,
  RED: 1
};

// ================= REQUEST HELPERS =================
function getPendingRequests() {
  return getPinRequests().filter(r => r.status === "PENDING");
}

function groupByPriority(requests) {
  return {
    GREEN: requests.filter(r => (r.priority || "YELLOW") === "GREEN"),
    YELLOW: requests.filter(r => (r.priority || "YELLOW") === "YELLOW"),
    RED: requests.filter(r => (r.priority || "YELLOW") === "RED")
  };
}

function getNextBatch() {
  let grouped = groupByPriority(getPendingRequests());

  return [
    ...grouped.GREEN.slice(0, PRIORITY_WEIGHT.GREEN),
    ...grouped.YELLOW.slice(0, PRIORITY_WEIGHT.YELLOW),
    ...grouped.RED.slice(0, PRIORITY_WEIGHT.RED)
  ];
}

// ================= PROCESS =================
let isRunning = false;

function processPinQueue() {

  // 🟡 WAIT MODE
  if (!isDependencyReady()) {
    console.warn("⏳ Waiting for dependencies...");
    return;
  }

  if (!isQueueAllowed()) return;
  if (isRunning) return;
  if (isQueueLocked()) return;

  let batch = getNextBatch();
  if (!batch.length) return;

  isRunning = true;
  setQueueLock(true);

  try {

    let allRequests = getPinRequests();

    batch.forEach(req => {

      let realReq = allRequests.find(r => r.requestId === req.requestId);
      if (!realReq) return;

      try {

        processPinRequestAuto(realReq.requestId);

      } catch (err) {

        console.warn("Queue Error:", err.message);

        realReq.retry = Number(realReq.retry || 0) + 1;

        if (realReq.retry >= RETRY_LIMIT) {
          realReq.status = "FAILED";
          realReq.failReason = err.message || "Unknown error";
          realReq.processedAt = Date.now();
        }
      }

    });

    savePinRequests(allRequests);

  } catch (err) {

    console.error("Queue Crash:", err);

  } finally {

    setQueueLock(false);
    isRunning = false;
  }
}

// ================= AUTO RUN =================
function startPinQueueEngine() {
  setInterval(processPinQueue, 3000);
}

// ================= START =================
startPinQueueEngine();


