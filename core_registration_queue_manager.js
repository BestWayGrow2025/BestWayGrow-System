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

    const raw =
      localStorage.getItem(REG_QUEUE_KEY);

    if (raw === null || raw === "") {
      return [];
    }

    const data =
      JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error(
        "Registration queue data is invalid"
      );
    }

    return data;

  } catch (e) {

    console.error(
      "[REGISTRATION QUEUE] Queue storage read failed:",
      e.message
    );

    window.__REG_QUEUE_STORAGE_ERROR__ = true;

    return [];
  }
}


function saveRegQueue(data) {

  try {

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid registration queue data"
      );
    }

    const encoded =
      JSON.stringify(data);

    localStorage.setItem(
      REG_QUEUE_KEY,
      encoded
    );

    const verify =
      localStorage.getItem(REG_QUEUE_KEY);

    if (verify !== encoded) {
      throw new Error(
        "Registration queue write verification failed"
      );
    }

    window.__REG_QUEUE_STORAGE_ERROR__ = false;

    return true;

  } catch (e) {

    console.error(
      "[REGISTRATION QUEUE] Queue storage write failed:",
      e.message
    );

    window.__REG_QUEUE_STORAGE_ERROR__ = true;

    return false;
  }
}


function getRegArchive() {

  try {

    const raw =
      localStorage.getItem(
        REG_QUEUE_ARCHIVE_KEY
      );

    if (raw === null || raw === "") {
      return [];
    }

    const data =
      JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error(
        "Registration archive data is invalid"
      );
    }

    return data;

  } catch (e) {

    console.error(
      "[REGISTRATION QUEUE] Archive storage read failed:",
      e.message
    );

    window.__REG_QUEUE_STORAGE_ERROR__ = true;

    return [];
  }
}


function saveRegArchive(data) {

  try {

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid registration archive data"
      );
    }

    if (data.length > 2000) {
      data = data.slice(-2000);
    }

    const encoded =
      JSON.stringify(data);

    localStorage.setItem(
      REG_QUEUE_ARCHIVE_KEY,
      encoded
    );

    const verify =
      localStorage.getItem(
        REG_QUEUE_ARCHIVE_KEY
      );

    if (verify !== encoded) {
      throw new Error(
        "Registration archive write verification failed"
      );
    }

    return true;

  } catch (e) {

    console.error(
      "[REGISTRATION QUEUE] Archive storage write failed:",
      e.message
    );

    window.__REG_QUEUE_STORAGE_ERROR__ = true;

    return false;
  }
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
    String(row.email || "").trim() &&
    String(row.username || "").trim() &&
    String(row.password || "").trim() &&
    String(row.introducerId || "").trim() &&
    row.status === "APPROVED" &&
    (row.position === "L" || row.position === "R")
  );
}
// ================= ADD TO QUEUE =================

function addToRegistrationQueue(data) {

  if (!data || !data.mobile) {
    return false;
  }

  window.__REG_QUEUE_STORAGE_ERROR__ = false;

  let queue = getRegQueue();

  if (
    window.__REG_QUEUE_STORAGE_ERROR__
  ) {
    console.error(
      "[REGISTRATION QUEUE] Cannot add request: queue storage unavailable"
    );

    return false;
  }

  let archive = getRegArchive();

  if (
    window.__REG_QUEUE_STORAGE_ERROR__
  ) {
    console.error(
      "[REGISTRATION QUEUE] Cannot add request: archive storage unavailable"
    );

    return false;
  }

  const fingerprint =
    makeRegFingerprint(data);

  // Prevent duplicates in queue
  if (
    queue.find(function (q) {
      return (
        q &&
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
      return (
        a &&
        a.fingerprint === fingerprint
      );
    })
  ) {
    return false;
  }

  // Repository duplicate validation is owned by
  // core_registration_validation_authority.js.
  // RBK-004 does not independently inspect
  // the user repository for registration duplicates.

  queue.push({
    ...data,
    fingerprint: fingerprint,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0,
    error: ""
  });

  return saveRegQueue(queue);
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

  const result =
    createUserWithTree(req);

  if (!result) {
    throw new Error(
      "User creation returned no result"
    );
  }

  const returnedUserId =
    result && result.userId
      ? String(result.userId).trim()
      : "";

  if (!returnedUserId) {
    throw new Error(
      "User creation did not return a valid User ID"
    );
  }

  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  const created =
    users.find(function (u) {
      return (
        u &&
        String(u.userId || "").trim() ===
        returnedUserId
      );
    });

  if (!created) {
    throw new Error(
      "Created user could not be verified by User ID"
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

         // Only APPROVED registrations may proceed to user creation.
// PENDING registrations remain in the queue awaiting approval.
if (
  queue[i].status !==
  "APPROVED"
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

  const queueBefore =
    getRegQueue();

  if (
    window.__REG_QUEUE_STORAGE_ERROR__
  ) {
    console.error(
      "[REGISTRATION QUEUE] Cleanup aborted: queue storage unavailable"
    );

    return false;
  }

  const archiveBefore =
    getRegArchive();

  if (
    window.__REG_QUEUE_STORAGE_ERROR__
  ) {
    console.error(
      "[REGISTRATION QUEUE] Cleanup aborted: archive storage unavailable"
    );

    return false;
  }

  const queue =
    Array.isArray(queueBefore)
      ? queueBefore
      : [];

  const archive =
    Array.isArray(archiveBefore)
      ? archiveBefore
      : [];

  const now = Date.now();

  const keep = [];
  const archiveAdditions = [];

  for (const row of queue) {

    if (!row) {
      continue;
    }

    if (
      row.status === "DONE" &&
      row.completedAt &&
      now - row.completedAt >
        REG_DONE_TTL
    ) {
      archiveAdditions.push(row);
      continue;
    }

    if (
      row.status === "FAILED" &&
      row.failedAt &&
      now - row.failedAt >
        REG_FAILED_TTL
    ) {
      archiveAdditions.push(row);
      continue;
    }

    keep.push(row);
  }

  if (archiveAdditions.length === 0) {
    return true;
  }

  const originalArchive =
    archive.slice();

  const updatedArchive =
    archive.concat(archiveAdditions);

  /*
  ========================================
  CONTROLLED TWO-KEY PERSISTENCE
  ========================================
  */

  const archiveSaved =
    saveRegArchive(updatedArchive);

  if (!archiveSaved) {

    console.error(
      "[REGISTRATION QUEUE] Cleanup aborted: archive persistence failed"
    );

    return false;
  }

  const queueSaved =
    saveRegQueue(keep);

  if (!queueSaved) {

    console.error(
      "[REGISTRATION QUEUE] Queue persistence failed. Restoring original archive."
    );

    const rollbackArchive =
      saveRegArchive(originalArchive);

    if (!rollbackArchive) {

      console.error(
        "[REGISTRATION QUEUE] CRITICAL: archive rollback failed"
      );

      window.__REG_QUEUE_CLEANUP_INCONSISTENT__ =
        true;

      return false;
    }

    window.__REG_QUEUE_CLEANUP_INCONSISTENT__ =
      false;

    return false;
  }

  /*
  ========================================
  FINAL STATE VERIFICATION
  ========================================
  */

  const verifiedQueue =
    getRegQueue();

  if (
    window.__REG_QUEUE_STORAGE_ERROR__ ||
    JSON.stringify(verifiedQueue) !==
      JSON.stringify(keep)
  ) {

    console.error(
      "[REGISTRATION QUEUE] Cleanup verification failed. Restoring archive."
    );

    saveRegQueue(queue);
    saveRegArchive(originalArchive);

    window.__REG_QUEUE_CLEANUP_INCONSISTENT__ =
      true;

    return false;
  }

  const verifiedArchive =
    getRegArchive();

  if (
    window.__REG_QUEUE_STORAGE_ERROR__ ||
    JSON.stringify(verifiedArchive) !==
      JSON.stringify(
        updatedArchive.length > 2000
          ? updatedArchive.slice(-2000)
          : updatedArchive
      )
  ) {

    console.error(
      "[REGISTRATION QUEUE] Archive verification failed. Restoring original state."
    );

    saveRegQueue(queue);
    saveRegArchive(originalArchive);

    window.__REG_QUEUE_CLEANUP_INCONSISTENT__ =
      true;

    return false;
  }

  window.__REG_QUEUE_CLEANUP_INCONSISTENT__ =
    false;

  return true;
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
