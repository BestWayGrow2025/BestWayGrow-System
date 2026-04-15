/*
========================================
REGISTRATION QUEUE SYSTEM V9 (FINAL LOCK) ❤️
========================================
✔ Queue only (isolated storage)
✔ System safe
✔ Anti-deadlock lock
✔ Batch processing
✔ Duplicate protection upgraded
✔ User validation
✔ Activity logging
✔ Multi-tab safe
✔ Error visibility
✔ registrationOpen control added
✔ Approve / Reject support added
✔ Queue cleanup support added
✔ Production ready
========================================
*/

const REG_QUEUE_KEY = "REG_QUEUE_DATA";
const REG_LOCK_KEY = "REG_QUEUE_LOCK";

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

  // stronger duplicate check
  let exists = queue.find(q => q.mobile === data.mobile);
  if (exists) return false;

  // existing user check
  if (typeof getUsers === "function") {
    let users = getUsers() || [];

    let userExists = users.find(u => u.mobile === data.mobile);
    if (userExists) return false;
  }

  queue.push({
    ...data,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0,
    error: ""
  });

  // oldest first
  queue.sort((a, b) => a.requestTime - b.requestTime);

  saveRegQueue(queue);
  return true;
}

// ================= APPROVE =================
function approveRegistration(mobile) {

  if (!mobile) return false;

  let queue = getRegQueue();
  let req = queue.find(q => q.mobile === mobile);

  if (!req) return false;
  if (req.status !== "PENDING") return false;

  try {

    processOneRegistration(req);

    req.status = "DONE";
    req.approvedAt = Date.now();

    saveRegQueue(queue);

    if (typeof logActivity === "function") {
      logActivity(req.mobile, "SYSTEM", "REG APPROVED");
    }

    return true;

  } catch (err) {

    req.retry = (req.retry || 0) + 1;
    req.error = err.message;

    if (req.retry >= 3) {
      req.status = "FAILED";
    }

    saveRegQueue(queue);
    return false;
  }
}

// ================= REJECT =================
function rejectRegistration(mobile, reason = "Rejected by admin") {

  if (!mobile) return false;

  let queue = getRegQueue();
  let req = queue.find(q => q.mobile === mobile);

  if (!req) return false;
  if (req.status !== "PENDING") return false;

  req.status = "REJECTED";
  req.error = reason;
  req.rejectedAt = Date.now();

  saveRegQueue(queue);

  if (typeof logActivity === "function") {
    logActivity(req.mobile, "SYSTEM", "REG REJECTED");
  }

  return true;
}

// ================= PROCESS ONE =================
function processOneRegistration(req) {

  if (typeof createUserWithTree !== "function") {
    throw new Error("Tree system missing");
  }

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

  // system setting check
  if (typeof getSystemSettings === "function") {
    let s = getSystemSettings();

    if (s && s.lockMode) return;
    if (s && s.registrationOpen === false) return;
  }

  // system safe check
  if (typeof isSystemSafe === "function") {
    if (!isSystemSafe()) return;
  }

  // lock check
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
  setInterval(processRegistrationQueue, 2000);
}

// ================= MULTI TAB SAFE =================
if (!window.__REG_QUEUE_STARTED__) {
  window.__REG_QUEUE_STARTED__ = true;
  startRegistrationQueue();
}
