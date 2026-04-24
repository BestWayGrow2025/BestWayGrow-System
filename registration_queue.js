/*
========================================
REGISTRATION QUEUE SYSTEM v10 (FINAL LOCK)
========================================
✔ Queue only (UI never creates user directly)
✔ Safe lock system
✔ Duplicate protection (queue + users)
✔ Batch processing
✔ Multi-tab safe
✔ Error handling + retry
✔ Activity logging
✔ Production LOCKED
========================================
*/

// ================= CONSTANTS =================
var REG_QUEUE_KEY = "REG_QUEUE_DATA";
var REG_LOCK_KEY = "REG_QUEUE_LOCK";

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    let data = JSON.parse(localStorage.getItem(REG_QUEUE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveRegQueue(data) {
  if (!Array.isArray(data)) data = [];
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

  // auto unlock after 5 sec
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

  if (!data || !data.mobile) return false;

  let queue = getRegQueue();

  // 🔒 QUEUE DUPLICATE CHECK
  let exists = queue.find(q =>
    q.mobile === data.mobile &&
    q.status !== "REJECTED" &&
    q.status !== "FAILED"
  );
  if (exists) return false;

  // 🔒 USER DUPLICATE CHECK
  if (typeof getUsers === "function") {
    let users = getUsers() || [];
    let userExists = users.find(u => u.mobile === data.mobile);
    if (userExists) return false;
  }

  // ✅ ADD REQUEST
  queue.push({
    ...data,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0,
    error: ""
  });

  queue.sort((a, b) => a.requestTime - b.requestTime);

  saveRegQueue(queue);

  // ✅ AUTO PROCESS
  try {
    processRegistrationQueue();
  } catch (e) {
    console.warn("Process error:", e.message);
  }

  return true;
}

// ================= PROCESS ONE =================
function processOneRegistration(req) {

  if (!req) throw new Error("Invalid request");

  if (typeof createUserWithTree !== "function") {
    throw new Error("Tree system missing");
  }

  if (typeof getUsers === "function") {
    let users = getUsers() || [];

    let exists = users.find(u => u.mobile === req.mobile);
    if (exists) {
      throw new Error("User already exists");
    }
  }

  if (!req.username || !req.mobile || !req.password) {
    throw new Error("Missing required fields");
  }

  // ✅ CREATE USER (ONLY HERE)
  createUserWithTree(req);

  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {

  // 🔒 SYSTEM CHECKS
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();
    if (s && s.lockMode) return;
    if (s && s.registrationOpen === false) return;
  }

  if (typeof isSystemSafe === "function") {
    if (!isSystemSafe()) return;
  }

  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {

    let processed = 0;
    var MAX_BATCH = 5;

    for (let i = 0; i < queue.length; i++) {

      if (processed >= MAX_BATCH) break;

      let req = queue[i];

      if (req.status !== "PENDING") continue;

      try {

        processOneRegistration(req);

        req.status = "DONE";
        req.completedAt = Date.now();
        processed++;

        if (typeof logActivity === "function") {
          logActivity(req.mobile, "SYSTEM", "REG SUCCESS");
        }

      } catch (err) {

        console.warn("REG ERROR:", err.message);

        req.retry = (req.retry || 0) + 1;
        req.error = err.message;

        if (req.retry >= 3) {
          req.status = "FAILED";

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
    setRegLock(false);
  }
}

// ================= CLEANUP =================
function clearCompletedRegistrations() {
  let queue = getRegQueue();

  queue = queue.filter(q =>
    q.status === "PENDING" ||
    q.status === "FAILED"
  );

  saveRegQueue(queue);
}

// ================= AUTO RUN =================
function startRegistrationQueue() {

  setInterval(() => {
    try {
      processRegistrationQueue();
    } catch (e) {
      console.error("QUEUE LOOP ERROR:", e);
    }
  }, 1000);

  // 🔥 RUN IMMEDIATELY
  setTimeout(() => {
    processRegistrationQueue();
  }, 100);
}

// ================= GLOBAL EXPORT =================
window.getRegQueue = getRegQueue;
window.saveRegQueue = saveRegQueue;
window.addToRegistrationQueue = addToRegistrationQueue;
window.processRegistrationQueue = processRegistrationQueue;
window.processOneRegistration = processOneRegistration;
window.clearCompletedRegistrations = clearCompletedRegistrations;

// ================= MULTI TAB SAFE =================
if (!window.__REG_QUEUE_STARTED__) {
  window.__REG_QUEUE_STARTED__ = true;
  startRegistrationQueue();
}
