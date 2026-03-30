<script>

// ===============================
// 📦 QUEUE SYSTEM (FINAL PRO SAFE)
// ===============================

// =====================
// 🔹 GET / SAVE QUEUE
// =====================
function getQueue() {
  try {
    return JSON.parse(localStorage.getItem("regQueue") || "[]");
  } catch {
    localStorage.setItem("regQueue", "[]");
    return [];
  }
}

function saveQueue(q) {
  localStorage.setItem("regQueue", JSON.stringify(q));
}

// =====================
// ➕ ADD TO QUEUE
// =====================
function addToQueue(userData) {

  let queue = getQueue();

  queue.push({
    id: "Q" + Date.now(),
    ...userData,
    queueTime: new Date().toISOString(),
    status: "PENDING",
    retry: 0
  });

  saveQueue(queue);

  // 📜 LOG
  if (typeof logActivity === "function") {
    logActivity("SYSTEM", "QUEUE", "User added to queue");
  }
}


// =====================
// 🔐 LOCK SYSTEM (SAFE)
// =====================
function isLocked() {
  return localStorage.getItem("treeLock") === "true";
}

function setLock(value) {
  localStorage.setItem("treeLock", value ? "true" : "false");
}


// =====================
// 🔒 GLOBAL SYSTEM CHECK (NEW 🔥)
// =====================
function isQueueSystemSafe() {

  let system = JSON.parse(localStorage.getItem("systemSettings") || "{}");

  // if admin paused system
  if (system.queueStop === true) {
    console.warn("⛔ Queue system stopped by admin");
    return false;
  }

  return true;
}


// =====================
// 🧹 CLEANUP QUEUE
// =====================
function cleanQueue() {

  let queue = getQueue();
  let now = Date.now();

  queue = queue.filter(q => {

    if (q.status !== "DONE") return true;

    let time = new Date(q.queueTime).getTime();
    return (now - time) < (24 * 60 * 60 * 1000);

  });

  saveQueue(queue);
}


// =====================
// ⚙️ PROCESS QUEUE (SAFE + CONTROL)
// =====================
function processQueue() {

  // 🔒 GLOBAL CONTROL
  if (!isQueueSystemSafe()) return;

  if (isLocked()) return;

  let queue = getQueue();
  if (!queue.length) return;

  // 🔒 LOCK START
  setLock(true);

  try {

    queue.sort((a, b) =>
      new Date(a.queueTime) - new Date(b.queueTime)
    );

    let nextUser = queue.find(u => u.status === "PENDING");

    if (!nextUser) {
      setLock(false);
      return;
    }

    // 🔥 REGISTER USER
    let user = registerUser(
      nextUser.username,
      nextUser.password,
      nextUser.introducerId,
      nextUser.sponsorId,
      nextUser.position
    );

    if (user) {

      nextUser.status = "DONE";

      // 📜 LOG
      if (typeof logActivity === "function") {
        logActivity(user.userId, "SYSTEM", "Registered via queue");
      }

    } else {

      nextUser.retry++;

      if (nextUser.retry >= 3) {
        nextUser.status = "FAILED";

        // 📜 LOG
        if (typeof logActivity === "function") {
          logActivity("SYSTEM", "QUEUE", "Queue FAILED after retries");
        }
      }
    }

    saveQueue(queue);

  } catch (err) {

    console.error("Queue Error:", err);

    if (typeof logActivity === "function") {
      logActivity("SYSTEM", "ERROR", "Queue crash detected");
    }
  }

  // 🔓 UNLOCK ALWAYS
  setLock(false);
}


// =====================
// 🔄 AUTO PROCESSOR (SMART CONTROL 🔥)
// =====================
function startQueueProcessor() {

  setInterval(() => {

    processQueue();
    cleanQueue();

  }, 2000); // 2 sec (can adjust)

}


// =====================
// 🚀 AUTO START
// =====================
startQueueProcessor();

</script>

