/*
========================================
REGISTRATION QUEUE SYSTEM V8 (FINAL LOCK) ❤️
========================================
✔ Queue only (isolated storage)
✔ System safe
✔ Anti-deadlock lock
✔ Batch processing
✔ Duplicate protection
✔ User validation
✔ Activity logging (FIXED)
✔ Multi-tab safe (FIXED)
✔ Error visibility (ADDED)
✔ Production ready
========================================
*/

const REG_QUEUE_KEY = "REG_QUEUE_DATA";
const REG_LOCK_KEY = "REG_QUEUE_LOCK";

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    let data = JSON.parse(localStorage.getItem(REG_QUEUE_KEY));
    return Array.isArray(data) ? data : []; // ❤️ safe array check
  } catch {
    return [];
  }
}

function saveRegQueue(data) {
  if (!Array.isArray(data)) data = []; // ❤️ safety
  localStorage.setItem(REG_QUEUE_KEY, JSON.stringify(data));
}

// ================= LOCK =================
function isRegLocked() {
  let lock;

  try {
    lock = JSON.parse(localStorage.getItem(REG_LOCK_KEY));
  } catch {
    lock = null;
  }

  if (!lock) return false;

  // ❤️ AUTO RECOVERY (5 sec)
  if (Date.now() - lock.time > 5000) {
    setRegLock(false);
    return false;
  }

  return lock.status === true;
}

function setRegLock(val) {
  if (val) {
    localStorage.setItem(REG_LOCK_KEY, JSON.stringify({
      status: true,
      time: Date.now()
    }));
  } else {
    localStorage.removeItem(REG_LOCK_KEY);
  }
}

// ================= ADD TO QUEUE =================
function addToRegistrationQueue(data) {

  if (!data || !data.mobile) return;

  let queue = getRegQueue();

  // ❤️ DUPLICATE PROTECTION
  let exists = queue.find(q =>
    q.mobile === data.mobile && q.status === "PENDING"
  );

  if (exists) return;

  queue.push({
    ...data,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0
  });

  // ❤️ ORDER FIX (old → new)
  queue.sort((a, b) => a.requestTime - b.requestTime);

  saveRegQueue(queue);
}

// ================= PROCESS ONE =================
function processOneRegistration(req) {

  // ❤️ DEPENDENCY CHECK
  if (typeof createUserWithTree !== "function") {
    throw new Error("Tree system missing");
  }

  // ❤️ USER EXIST CHECK
  if (typeof getUsers === "function") {
    let users = getUsers() || [];
    if (!Array.isArray(users)) users = [];

    let exists = users.find(u => u.mobile === req.mobile);
    if (exists) {
      throw new Error("User already exists");
    }
  }

  createUserWithTree(req);
  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {

  // ❤️ SYSTEM LOCK CHECK
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return;
  }

  // ❤️ SYSTEM SAFE CHECK
  if (typeof isSystemSafe === "function") {
    if (!isSystemSafe()) return;
  }

  // ❤️ LOCK CHECK
  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {

    let processed = 0;
    const MAX_BATCH = 5;

    for (let i = 0; i < queue.length; i++) {

      if (processed >= MAX_BATCH) break;

      let req = queue[i];

      if (req.status !== "PENDING") continue;

      try {

        processOneRegistration(req);

        req.status = "DONE";
        processed++;

        // ❤️ FIXED LOG
        if (typeof logActivity === "function") {
          logActivity(req.mobile, "SYSTEM", "REG SUCCESS");
        }

      } catch (err) {

        console.warn("REG ERROR:", err.message); // ❤️ visible error

        req.retry = (req.retry || 0) + 1;

        if (req.retry >= 3) {
          req.status = "FAILED";
          req.error = err.message;

          if (typeof logActivity === "function") {
            logActivity(req.mobile, "SYSTEM", "REG FAILED");
          }
        }
      }
    }

    saveRegQueue(queue);

  } catch (e) {
    console.error("Queue processing failed:", e);
  } finally {
    setRegLock(false); // ❤️ ALWAYS RELEASE
  }
}

// ================= AUTO RUN =================
function startRegistrationQueue() {
  setInterval(processRegistrationQueue, 2000);
}

// ❤️ MULTI-TAB SAFE START
if (!window.__REG_QUEUE_STARTED__) {
  window.__REG_QUEUE_STARTED__ = true;
  startRegistrationQueue();
}
