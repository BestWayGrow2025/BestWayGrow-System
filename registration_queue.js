/*
========================================
REGISTRATION QUEUE ENGINE (FINAL v2)
========================================
✔ Queue only (NO tree logic)
✔ Uses tree_engine.js
✔ Safe + clean separation
========================================
*/

const REG_QUEUE_KEY = "REG_QUEUE_DATA";
const REG_LOCK_KEY = "REG_QUEUE_LOCK";

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    return JSON.parse(localStorage.getItem(REG_QUEUE_KEY)) || [];
  } catch {
    localStorage.setItem(REG_QUEUE_KEY, "[]");
    return [];
  }
}

function saveRegQueue(data) {
  localStorage.setItem(REG_QUEUE_KEY, JSON.stringify(data || []));
}

// ================= LOCK =================
function isRegLocked() {
  return localStorage.getItem(REG_LOCK_KEY) === "true";
}

function setRegLock(val) {
  localStorage.setItem(REG_LOCK_KEY, val ? "true" : "false");
}

// ================= ADD TO QUEUE =================
function addToRegistrationQueue(data) {

  if (!data || !data.mobile) return;

  let queue = getRegQueue();

  // 🔒 DUPLICATE BLOCK (QUEUE LEVEL)
  let exists = queue.find(q => q.mobile === data.mobile && q.status === "PENDING");
  if (exists) {
    console.warn("Already in queue");
    return;
  }

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

  // ✅ ONLY CALL TREE ENGINE
  createUserWithTree(req);

  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {

  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {

    for (let i = 0; i < queue.length; i++) {

      let req = queue[i];

      if (req.status !== "PENDING") continue;

      try {

        processOneRegistration(req);

        req.status = "DONE";

      } catch (err) {

        console.warn("Registration Error:", err.message);

        req.retry = (req.retry || 0) + 1;

        if (req.retry >= 3) {
          req.status = "FAILED";
          req.error = err.message;
        }
      }
    }

    saveRegQueue(queue);

  } finally {
    setRegLock(false);
  }
}

// ================= AUTO RUN =================
function startRegistrationQueue() {
  setInterval(processRegistrationQueue, 2000);
}

// ================= START =================
startRegistrationQueue();
