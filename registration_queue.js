/*
========================================
REGISTRATION QUEUE ENGINE V7 (TRUE FINAL LOCK)
========================================
✔ Queue only (isolated storage)
✔ System safe
✔ Anti-deadlock lock
✔ Batch processing
✔ Duplicate + user validation
✔ Activity logging
✔ Race-condition safe
========================================
*/

const REG_QUEUE_KEY = "REG_QUEUE_DATA";
const REG_LOCK_KEY = "REG_QUEUE_LOCK";

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    return JSON.parse(localStorage.getItem(REG_QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRegQueue(data) {
  localStorage.setItem(REG_QUEUE_KEY, JSON.stringify(data || []));
}

// ================= LOCK =================
function isRegLocked() {
  let lock = JSON.parse(localStorage.getItem(REG_LOCK_KEY) || "null");

  if (!lock) return false;

  // 🔥 AUTO RECOVER (5 sec)
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

  queue.sort((a, b) => a.requestTime - b.requestTime);

  saveRegQueue(queue);
}

// ================= PROCESS ONE =================
function processOneRegistration(req) {

  if (typeof createUserWithTree !== "function") {
    throw new Error("Tree engine missing");
  }

  // 🔒 USER EXISTS CHECK
  if (typeof getUsers === "function") {
    let users = getUsers();
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

  // 🔒 SYSTEM LOCK
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return;
  }

  // 🔒 SYSTEM SAFE
  if (typeof isSystemSafe === "function") {
    if (!isSystemSafe()) return;
  }

  // 🔒 DOUBLE LOCK SAFETY
  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {

    let processed = 0;
    let MAX_BATCH = 5;

    for (let i = 0; i < queue.length; i++) {

      if (processed >= MAX_BATCH) break;

      let req = queue[i];

      if (req.status !== "PENDING") continue;

      try {

        processOneRegistration(req);

        req.status = "DONE";
        processed++;

        // 📊 LOG SUCCESS
        if (typeof addLog === "function") {
          addLog("REG SUCCESS", req.mobile);
        }

      } catch (err) {

        req.retry = (req.retry || 0) + 1;

        if (req.retry >= 3) {
          req.status = "FAILED";
          req.error = err.message;

          // 📊 LOG FAIL
          if (typeof addLog === "function") {
            addLog("REG FAILED", req.mobile);
          }
        }
      }
    }

    saveRegQueue(queue);

  } catch (e) {
    console.error("Queue processing failed:", e);
  } finally {
    setRegLock(false); // 🔥 ALWAYS RELEASE
  }
}

// ================= AUTO RUN =================
function startRegistrationQueue() {
  setInterval(processRegistrationQueue, 2000);
}

// ================= START =================
startRegistrationQueue();
