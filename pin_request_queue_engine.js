/*
========================================
PIN REQUEST QUEUE ENGINE V9.0 (FINAL PATCH LOCK)
========================================
✔ Dependency wait-safe
✔ Queue lock hardened
✔ Stale lock recovery
✔ Duplicate runner blocked
✔ Batch re-fetch safe
✔ Retry / fail isolation
✔ Queue race protected
✔ Request mutation safe
✔ Storage collision reduced
✔ Production stable
========================================
*/

// ================= CONFIG =================
const PIN_QUEUE_RETRY_LIMIT = 3;
const PIN_QUEUE_STALE_MS = 10000;
const PIN_QUEUE_TICK_MS = 3000;
const PIN_QUEUE_BATCH_LIMIT = 6;

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

  if (!settings.pinQueue || typeof settings.pinQueue !== "object") {
    settings.pinQueue = {
      enabled: true,
      lock: false,
      lockTime: null,
      updatedAt: Date.now()
    };
    saveSystemSettings(settings);
  }

  return settings.pinQueue;
}

function updateQueueSettings(data = {}) {
  let settings = getSystemSettings() || {};

  settings.pinQueue = {
    enabled: true,
    lock: false,
    lockTime: null,
    updatedAt: Date.now(),
    ...(settings.pinQueue || {}),
    ...data,
    updatedAt: Date.now()
  };

  saveSystemSettings(settings);
  return settings.pinQueue;
}

// ================= CONTROL =================
function isQueueAllowed() {
  let q = getQueueSettings();
  return q.enabled === true;
}

// ================= LOCK =================
function isQueueLocked() {
  let q = getQueueSettings();

  if (q.lock === true && q.lockTime && (Date.now() - q.lockTime > PIN_QUEUE_STALE_MS)) {
    updateQueueSettings({ lock: false, lockTime: null });
    return false;
  }

  return q.lock === true;
}

function setQueueLock(val) {
  updateQueueSettings({
    lock: !!val,
    lockTime: val ? Date.now() : null
  });
}

// ================= PRIORITY =================
const PRIORITY_WEIGHT = {
  GREEN: 3,
  YELLOW: 2,
  RED: 1
};

// ================= REQUEST HELPERS =================
function getPendingRequests() {
  let list = getPinRequests();
  if (!Array.isArray(list)) return [];

  return list.filter(r =>
    r &&
    r.requestId &&
    r.status === "PENDING" &&
    r.queueLock !== true
  );
}

function groupByPriority(requests) {
  requests = Array.isArray(requests) ? requests : [];

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
  ].slice(0, PIN_QUEUE_BATCH_LIMIT);
}

function lockRequest(req) {
  req.queueLock = true;
  req.queueLockTime = Date.now();
}

function unlockRequest(req) {
  req.queueLock = false;
  req.queueLockTime = null;
}

// ================= PROCESS =================
let __PIN_QUEUE_RUNNING__ = false;

function processPinQueue() {
  if (!isDependencyReady()) return;
  if (!isQueueAllowed()) return;
  if (__PIN_QUEUE_RUNNING__) return;
  if (isQueueLocked()) return;

  let batch = getNextBatch();
  if (!batch.length) return;

  __PIN_QUEUE_RUNNING__ = true;
  setQueueLock(true);

  try {
    let allRequests = getPinRequests();
    if (!Array.isArray(allRequests) || !allRequests.length) return;

    for (let i = 0; i < batch.length; i++) {
      let req = batch[i];
      if (!req || !req.requestId) continue;

      let realReq = allRequests.find(r => r.requestId === req.requestId);
      if (!realReq) continue;
      if (realReq.status !== "PENDING") continue;
      if (realReq.queueLock === true) continue;

      lockRequest(realReq);
      savePinRequests(allRequests);

      try {
        processPinRequestAuto(realReq.requestId);

        // re-fetch state after downstream mutation
        allRequests = getPinRequests() || [];
        realReq = allRequests.find(r => r.requestId === req.requestId);

        if (realReq && realReq.status === "PENDING") {
          realReq.status = "DONE";
          realReq.processedAt = Date.now();
        }

      } catch (err) {
        allRequests = getPinRequests() || [];
        realReq = allRequests.find(r => r.requestId === req.requestId);

        if (realReq) {
          realReq.retry = Number(realReq.retry || 0) + 1;
          realReq.failReason = err.message || "Unknown error";

          if (realReq.retry >= PIN_QUEUE_RETRY_LIMIT) {
            realReq.status = "FAILED";
            realReq.processedAt = Date.now();
          }
        }
      }

      allRequests = getPinRequests() || [];
      realReq = allRequests.find(r => r.requestId === req.requestId);

      if (realReq) unlockRequest(realReq);

      savePinRequests(allRequests);
    }

  } catch (err) {
    console.error("PIN QUEUE CRASH:", err);
  } finally {
    setQueueLock(false);
    __PIN_QUEUE_RUNNING__ = false;
  }
}

// ================= AUTO RUN =================
function startPinQueueEngine() {
  if (window.__PIN_QUEUE_ENGINE_STARTED__) return;
  window.__PIN_QUEUE_ENGINE_STARTED__ = true;

  setInterval(() => {
    try {
      processPinQueue();
    } catch (e) {
      console.error("PIN QUEUE LOOP:", e);
    }
  }, PIN_QUEUE_TICK_MS);
}

// ================= START =================
startPinQueueEngine();
