<script>

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
    id: "Q" + Date.now(), // unique id 🔥
    ...userData,
    queueTime: new Date().toISOString(),
    status: "PENDING",
    retry: 0
  });

  saveQueue(queue);
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
// 🧹 CLEANUP QUEUE
// =====================
function cleanQueue() {
  let queue = getQueue();

  // remove DONE older than 1 day
  let now = Date.now();

  queue = queue.filter(q => {
    if (q.status !== "DONE") return true;

    let time = new Date(q.queueTime).getTime();
    return (now - time) < (24 * 60 * 60 * 1000);
  });

  saveQueue(queue);
}


// =====================
// ⚙️ PROCESS QUEUE (SAFE + RETRY)
// =====================
function processQueue() {

  if (isLocked()) {
    return;
  }

  let queue = getQueue();

  if (!queue.length) return;

  // 🔒 LOCK START
  setLock(true);

  try {

    // 📌 SORT BY TIME
    queue.sort((a, b) =>
      new Date(a.queueTime) - new Date(b.queueTime)
    );

    let nextUser = queue.find(u => u.status === "PENDING");

    if (!nextUser) {
      setLock(false);
      return;
    }

    // 🔥 CREATE USER
    let user = registerUser(
      nextUser.username,
      nextUser.password,
      nextUser.introducerId,
      nextUser.sponsorId,
      nextUser.position
    );

    if (user) {
      nextUser.status = "DONE";
    } else {
      nextUser.retry++;

      // ❌ FAIL SAFE
      if (nextUser.retry >= 3) {
        nextUser.status = "FAILED";
      }
    }

    saveQueue(queue);

  } catch (err) {
    console.error("Queue Error:", err);
  }

  // 🔓 UNLOCK ALWAYS
  setLock(false);

}


// =====================
// 🔄 AUTO PROCESSOR (IMPORTANT 🔥)
// =====================
function startQueueProcessor() {
  setInterval(() => {
    processQueue();
    cleanQueue();
  }, 2000); // every 2 sec
}


// =====================
// 🚀 AUTO START
// =====================
startQueueProcessor();

</script>
