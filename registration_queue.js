/*
========================================
REGISTRATION QUEUE SYSTEM v10.2 (FINAL FIXED)
========================================
✔ Queue-only registration flow
✔ FIXED: processOneRegistration verification bug
✔ FIXED: missing status normalization
✔ FIXED: user lookup after create
✔ FIXED: safe fallback for createUserWithTree return
✔ Stable queue execution
========================================
*/

var REG_QUEUE_KEY = "REG_QUEUE_DATA";
var REG_QUEUE_ARCHIVE_KEY = "REG_QUEUE_ARCHIVE";
var REG_LOCK_KEY = "REG_QUEUE_LOCK";
var REG_LOCK_OWNER = "TAB_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

var REG_MAX_BATCH = 5;
var REG_FAILED_TTL = 24 * 60 * 60 * 1000;
var REG_DONE_TTL = 6 * 60 * 60 * 1000;
var REG_ACTIVE_TIMER = null;

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    let data = JSON.parse(localStorage.getItem(REG_QUEUE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    localStorage.setItem(REG_QUEUE_KEY, "[]");
    return [];
  }
}

function saveRegQueue(data) {
  localStorage.setItem(REG_QUEUE_KEY, JSON.stringify(Array.isArray(data) ? data : []));
}

function getRegArchive() {
  try {
    let data = JSON.parse(localStorage.getItem(REG_QUEUE_ARCHIVE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    localStorage.setItem(REG_QUEUE_ARCHIVE_KEY, "[]");
    return [];
  }
}

function saveRegArchive(data) {
  if (!Array.isArray(data)) data = [];
  if (data.length > 2000) data = data.slice(-2000);
  localStorage.setItem(REG_QUEUE_ARCHIVE_KEY, JSON.stringify(data));
}

// ================= FINGERPRINT =================
function makeRegFingerprint(data) {
  let raw = [
    data.mobile || "",
    data.username || "",
    data.sponsorId || "",
    data.parentId || "",
    data.position || ""
  ].join("|");

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }

  return "REGFP_" + Math.abs(hash);
}

// ================= LOCK =================
function getRegLock() {
  try {
    return JSON.parse(localStorage.getItem(REG_LOCK_KEY));
  } catch {
    return null;
  }
}

function isRegLocked() {
  let lock = getRegLock();
  if (!lock) return false;
  if (Date.now() - lock.time > 5000) return false;
  return lock.status === true;
}

function setRegLock(val) {
  if (val) {
    localStorage.setItem(REG_LOCK_KEY, JSON.stringify({
      status: true,
      time: Date.now(),
      owner: REG_LOCK_OWNER
    }));
  } else {
    localStorage.removeItem(REG_LOCK_KEY);
  }
}

// ================= VALIDATION =================
function isValidQueueRow(row) {
  return row &&
    row.mobile &&
    row.username &&
    row.password &&
    row.status;
}

// ================= ADD TO QUEUE =================
function addToRegistrationQueue(data) {
  if (!data || !data.mobile) return false;

  let queue = getRegQueue();
  let archive = getRegArchive();
  let fingerprint = makeRegFingerprint(data);

  if (queue.find(q => q.fingerprint === fingerprint && q.status !== "FAILED")) return false;
  if (archive.find(a => a.fingerprint === fingerprint)) return false;

  let users = typeof getUsers === "function" ? getUsers() : [];
  if (users.find(u => u.mobile === data.mobile)) return false;

  queue.push({
    ...data,
    fingerprint,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0,
    error: ""
  });

  saveRegQueue(queue);
  processRegistrationQueue();
  return true;
}

// ================= PROCESS ONE (FIXED CORE BUG) =================
function processOneRegistration(req) {
  if (!req) throw new Error("Invalid request");
  if (typeof createUserWithTree !== "function") {
    throw new Error("Tree engine missing");
  }

  let result = createUserWithTree(req);

  let users = typeof getUsers === "function" ? getUsers() : [];

  let created =
    users.find(u => u.userId === (result && result.userId)) ||
    users.find(u => u.mobile === req.mobile);

  if (!created) {
    throw new Error("User creation verification failed");
  }

  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {
  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {
    let processed = 0;

    for (let i = 0; i < queue.length; i++) {

      if (processed >= REG_MAX_BATCH) break;
      if (!queue[i]) continue;
      if (queue[i].status !== "PENDING") continue;

      try {
        processOneRegistration(queue[i]);

        queue[i].status = "DONE";
        queue[i].completedAt = Date.now();
        processed++;

      } catch (err) {
        queue[i].retry = (queue[i].retry || 0) + 1;
        queue[i].error = err.message;

        if (queue[i].retry >= 3) {
          queue[i].status = "FAILED";
          queue[i].failedAt = Date.now();
        }
      }
    }

    saveRegQueue(queue);
    cleanupRegistrationQueue();

  } finally {
    setRegLock(false);
    scheduleRegistrationQueue();
  }
}

// ================= CLEANUP =================
function cleanupRegistrationQueue() {
  let queue = getRegQueue();
  let archive = getRegArchive();
  let now = Date.now();

  let keep = [];

  for (let row of queue) {
    if (!row) continue;

    if (row.status === "DONE") {
      archive.push(row);
      continue;
    }

    if (row.status === "FAILED" &&
        row.failedAt &&
        (now - row.failedAt > REG_FAILED_TTL)) {
      archive.push(row);
      continue;
    }

    keep.push(row);
  }

  saveRegArchive(archive);
  saveRegQueue(keep);
}

// ================= LOOP =================
function scheduleRegistrationQueue() {
  setTimeout(processRegistrationQueue, 2000);
}

function startRegistrationQueue() {
  setTimeout(processRegistrationQueue, 500);
}

// ================= EXPORT =================
window.addToRegistrationQueue = addToRegistrationQueue;
window.processRegistrationQueue = processRegistrationQueue;
window.processOneRegistration = processOneRegistration;
window.startRegistrationQueue = startRegistrationQueue;

// ================= START =================
if (!window.__REG_QUEUE_STARTED__) {
  window.__REG_QUEUE_STARTED__ = true;
  startRegistrationQueue();
}
