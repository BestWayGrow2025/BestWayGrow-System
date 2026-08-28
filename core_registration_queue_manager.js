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

var REG_MAX_BATCH = 5;
var REG_FAILED_TTL = 24 * 60 * 60 * 1000;
var REG_DONE_TTL = 6 * 60 * 60 * 1000;
var REG_ACTIVE_TIMER = null;

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    let data = JSON.parse(
      localStorage.getItem(REG_QUEUE_KEY)
    );
    return Array.isArray(data) ? data : [];
  } catch (e) {
    localStorage.setItem(REG_QUEUE_KEY, "[]");
    return [];
  }
}

function saveRegQueue(data) {
  localStorage.setItem(
    REG_QUEUE_KEY,
    JSON.stringify(
      Array.isArray(data) ? data : []
    )
  );
}

function getRegArchive() {
  try {
    let data = JSON.parse(
      localStorage.getItem(
        REG_QUEUE_ARCHIVE_KEY
      )
    );
    return Array.isArray(data) ? data : [];
  } catch (e) {
    localStorage.setItem(
      REG_QUEUE_ARCHIVE_KEY,
      "[]"
    );
    return [];
  }
}

function saveRegArchive(data) {
  if (!Array.isArray(data)) {
    data = [];
  }

  if (data.length > 2000) {
    data = data.slice(-2000);
  }

  localStorage.setItem(
    REG_QUEUE_ARCHIVE_KEY,
    JSON.stringify(data)
  );
}

// ================= FINGERPRINT =================
function makeRegFingerprint(data) {
  const raw = [
    String(data.mobile || "").trim(),
    String(data.email || "").trim().toLowerCase()
  ].join("|");

  let hash = 0;

  for (let i = 0; i < raw.length; i++) {
    hash =
      ((hash << 5) - hash) +
      raw.charCodeAt(i);

    hash |= 0;
  }

  return "REGFP_" + Math.abs(hash);
}

// ================= GLOBAL EXECUTION LOCK =================
// RBK-004 does not own a separate registration lock.
// All queue execution must use RBK-018.
// ================= VALIDATION =================
function isValidQueueRow(row) {
  return (
    row &&
    String(row.mobile || "").trim() &&
    String(row.username || "").trim() &&
    String(row.password || "").trim() &&
    String(row.introducerId || "").trim() &&
    row.status === "PENDING" &&
    (row.position === "L" || row.position === "R")
  );
}
// ================= ADD TO QUEUE =================
function addToRegistrationQueue(data) {
  if (!data || !data.mobile) {
    return false;
  }

  let queue = getRegQueue();
  let archive = getRegArchive();
  let fingerprint =
    makeRegFingerprint(data);

  // Prevent duplicates in queue
  if (
    queue.find(function (q) {
      return (
        q.fingerprint === fingerprint &&
        q.status !== "FAILED"
      );
    })
  ) {
    return false;
  }

  // Prevent duplicates in archive
  if (
    archive.find(function (a) {
      return a.fingerprint === fingerprint;
    })
  ) {
    return false;
  }

  // Prevent duplicates in users
  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  if (
    users.find(function (u) {
      return u.mobile === data.mobile;
    })
  ) {
    return false;
  }

  queue.push({
    ...data,
    fingerprint: fingerprint,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0,
    error: ""
  });

  saveRegQueue(queue);
  processRegistrationQueue();

  return true;
}

// ================= PROCESS ONE =================
function processOneRegistration(req) {
  if (!req) {
    throw new Error("Invalid request");
  }

  if (
    typeof createUserWithTree !==
    "function"
  ) {
    throw new Error(
      "Tree engine missing"
    );
  }

  let result =
    createUserWithTree(req);

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  let created =
    users.find(function (u) {
      return (
        u.userId ===
        (result && result.userId)
      );
    }) ||
    users.find(function (u) {
      return u.mobile === req.mobile;
    });

  if (!created) {
    throw new Error(
      "User creation verification failed"
    );
  }

  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {

  if (
    typeof executeWithSystemLock !==
    "function"
  ) {
    console.error(
      "[REGISTRATION QUEUE] Global execution lock unavailable"
    );

    return;
  }

  let queue = getRegQueue();

  if (!queue.length) {
    return;
  }

  const result =
    executeWithSystemLock(
      function () {

        let processed = 0;

        for (
          let i = 0;
          i < queue.length;
          i++
        ) {

          if (
            processed >= REG_MAX_BATCH
          ) {
            break;
          }

          if (!queue[i]) {
            continue;
          }

          if (
            queue[i].status !==
            "PENDING"
          ) {
            continue;
          }

          if (!isValidQueueRow(queue[i])) {

            queue[i].status =
              "FAILED";

            queue[i].error =
              "Invalid registration queue data";

            queue[i].failedAt =
              Date.now();

            continue;
          }

          try {

            processOneRegistration(
              queue[i]
            );

            queue[i].status =
              "DONE";

            queue[i].completedAt =
              Date.now();

            processed++;

          } catch (err) {

            queue[i].retry =
              (queue[i].retry || 0) + 1;

            queue[i].error =
              err && err.message
                ? err.message
                : "Registration processing failed";

            if (
              queue[i].retry >= 3
            ) {

              queue[i].status =
                "FAILED";

              queue[i].failedAt =
                Date.now();
            }
          }
        }

        saveRegQueue(queue);
        cleanupRegistrationQueue();

        return true;

      },
      "registration_queue"
    );

  if (result === false) {
    return;
  }

  scheduleRegistrationQueue();
}
// ================= CLEANUP =================
function cleanupRegistrationQueue() {
  let queue = getRegQueue();
  let archive = getRegArchive();
  let now = Date.now();

  let keep = [];

  for (let row of queue) {
    if (!row) {
      continue;
    }

    if (row.status === "DONE") {
      archive.push(row);
      continue;
    }

    if (
      row.status === "FAILED" &&
      row.failedAt &&
      now - row.failedAt >
        REG_FAILED_TTL
    ) {
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
  setTimeout(
    processRegistrationQueue,
    2000
  );
}

function startRegistrationQueue() {
  setTimeout(
    processRegistrationQueue,
    500
  );
}

// ================= EXPORT =================
window.getRegQueue = getRegQueue;
window.saveRegQueue = saveRegQueue;
window.getRegArchive =
  getRegArchive;
window.saveRegArchive =
  saveRegArchive;
window.makeRegFingerprint =
  makeRegFingerprint;
window.addToRegistrationQueue =
  addToRegistrationQueue;
window.processRegistrationQueue =
  processRegistrationQueue;
window.processOneRegistration =
  processOneRegistration;
window.startRegistrationQueue =
  startRegistrationQueue;

// ================= START =================
if (!window.__REG_QUEUE_STARTED__) {
  window.__REG_QUEUE_STARTED__ =
    true;

  startRegistrationQueue();
}
