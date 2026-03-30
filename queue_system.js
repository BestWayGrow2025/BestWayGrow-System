<script>

// =====================
// 🔹 GET QUEUE
// =====================
function getQueue() {
  return JSON.parse(localStorage.getItem("regQueue") || "[]");
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
    ...userData,
    queueTime: new Date().toISOString(),
    status: "PENDING"
  });

  saveQueue(queue);
}


// =====================
// 🔐 LOCK SYSTEM
// =====================
function isLocked() {
  return localStorage.getItem("treeLock") === "true";
}

function setLock(value) {
  localStorage.setItem("treeLock", value ? "true" : "false");
}


// =====================
// ⚙️ PROCESS QUEUE (ONE BY ONE)
// =====================
function processQueue() {

  if (isLocked()) {
    console.warn("System busy...");
    return;
  }

  let queue = getQueue();

  if (queue.length === 0) return;

  // 🔒 LOCK START
  setLock(true);

  // 📌 SORT BY TIME
  queue.sort((a, b) =>
    new Date(a.queueTime) - new Date(b.queueTime)
  );

  let nextUser = queue.find(u => u.status === "PENDING");

  if (!nextUser) {
    setLock(false);
    return;
  }

  // 🔥 CREATE USER (FINAL STEP)
  let user = registerUser(
    nextUser.username,
    nextUser.password,
    nextUser.introducerId,
    nextUser.sponsorId,
    nextUser.position
  );

  if (user) {
    nextUser.status = "DONE";
  }

  saveQueue(queue);

  // 🔓 UNLOCK
  setLock(false);

  console.log("✅ One user processed");

}

</script>
