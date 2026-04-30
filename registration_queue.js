/*
========================================
REGISTRATION QUEUE SYSTEM v10.1 (FINAL FIXED)
========================================
✔ Queue-only registration flow
✔ UI never creates user directly
✔ Post-create verification
✔ Queue fingerprint protection
✔ Owner-safe multi-tab lock
✔ Adaptive polling
✔ Queue archive retention
✔ Failed retention cleanup
✔ Safe retry handling
✔ Activity logging
✔ Production stable
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
  if (!Array.isArray(data)) data = [];
  localStorage.setItem(REG_QUEUE_KEY, JSON.stringify(data));
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
    return JSON.parse(localStorage.getItem(REG_LOCK_KEY)) || null;
  } catch (e) {
    return null;
  }
}

function isRegLocked() {
  let lock = getRegLock();
  if (!lock) return false;

  if (Date.now() - lock.time > 5000) {
    if (lock.owner === REG_LOCK_OWNER) {
      setRegLock(false);
    }
    return false;
  }

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
    let lock = getRegLock();
    if (!lock || lock.owner === REG_LOCK_OWNER) {
      localStorage.removeItem(REG_LOCK_KEY);
    }
  }
}

// ================= VALIDATION =================
function isValidQueueRow(row) {
  return !!(
    row &&
    typeof row === "object" &&
    row.mobile &&
    row.username &&
    row.password
  );
}

// ================= ADD TO QUEUE =================
function addToRegistrationQueue(data) {
  if (!data || !data.mobile) return false;

  let queue = getRegQueue();
  let archive = getRegArchive();
  let fingerprint = makeRegFingerprint(data);

  let exists = queue.find(q =>
    q.fingerprint === fingerprint && q.status !== "FAILED"
  );

  if (exists) return false;

  let archived = archive.find(a => a.fingerprint === fingerprint);
  if (archived) return false;

  if (typeof getUsers === "function") {
    let users = getUsers() || [];
    if (users.find(u => u.mobile === data.mobile)) return false;
  }

  queue.push({
    ...data,
    fingerprint: fingerprint,
    requestTime: Date.now(),
    status: data.status || "PENDING",
    retry: 0,
    error: ""
  });

  queue.sort((a, b) => a.requestTime - b.requestTime);
  saveRegQueue(queue);

  try {
    processRegistrationQueue();
  } catch (e) {
    console.warn("Process error:", e.message);
  }

  return true;
}

// ================= PROCESS ONE =================
function processOneRegistration(req) {
  if (!req || !req.mobile) throw new Error("Invalid request");

  if (typeof createUserWithTree !== "function") {
    throw new Error("createUserWithTree missing");
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  if (users.find(u => u.mobile === req.mobile)) {
    throw new Error("User already exists");
  }

  createUserWithTree(req);

  let created = users.find(u => u.mobile === req.mobile);

  if (!created || !created.userId) {
    throw new Error("User creation failed");
  }

  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return;
    if (s && s.registrationOpen === false) return;
  }

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return;
  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {
    let processed = 0;

    for (let i = 0; i < queue.length; i++) {
      if (processed >= REG_MAX_BATCH) break;
      if (!isValidQueueRow(queue[i])) continue;
      if (queue[i].status !== "PENDING") continue;

      try {
        processOneRegistration(queue[i]);

        queue[i].status = "DONE";
        queue[i].completedAt = Date.now();
        processed++;

        if (typeof logActivity === "function") {
          logActivity(queue[i].mobile, "SYSTEM", "REG SUCCESS");
        }

      } catch (err) {
        queue[i].retry = (queue[i].retry || 0) + 1;
        queue[i].error = err.message;

        if (queue[i].retry >= 3) {
          queue[i].status = "FAILED";
          queue[i].failedAt = Date.now();

          if (typeof logActivity === "function") {
            logActivity(queue[i].mobile, "SYSTEM", "REG FAILED");
          }
        }
      }
    }

    saveRegQueue(queue);
    cleanupRegistrationQueue();

  } catch (e) {
    console.error("Queue error:", e);
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

  for (let i = 0; i < queue.length; i++) {
    let row = queue[i];
    if (!isValidQueueRow(row)) continue;

    if (row.status === "DONE") {
      archive.push(row);
      continue;
    }

    if (row.status === "FAILED" && row.failedAt && (now - row.failedAt > REG_FAILED_TTL)) {
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
  if (REG_ACTIVE_TIMER) clearTimeout(REG_ACTIVE_TIMER);

  let queue = getRegQueue();
  let hasPending = queue.some(q => q.status === "PENDING");

  REG_ACTIVE_TIMER = setTimeout(() => {
    processRegistrationQueue();
  }, hasPending ? 1000 : 8000);
}

function startRegistrationQueue() {
  setTimeout(() => processRegistrationQueue(), 150);
}

// ================= GLOBAL EXPORT =================
window.getRegQueue = getRegQueue;
window.saveRegQueue = saveRegQueue;
window.getRegArchive = getRegArchive;
window.saveRegArchive = saveRegArchive;
window.addToRegistrationQueue = addToRegistrationQueue;
window.processRegistrationQueue = processRegistrationQueue;
window.processOneRegistration = processOneRegistration;
window.cleanupRegistrationQueue = cleanupRegistrationQueue;
window.startRegistrationQueue = startRegistrationQueue;

// ================= START =================
if (!window.__REG_QUEUE_STARTED__) {
  window.__REG_QUEUE_STARTED__ = true;
  startRegistrationQueue();
}
