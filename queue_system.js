========================================
QUEUE SYSTEM (FINAL PRO MAX)
========================================
✔ Weighted Priority (G G G → Y Y → R)
✔ Smart fallback
✔ No starvation
✔ Batch control
✔ Admin-like decision system
========================================
*/

const QUEUE_KEY = "PIN_QUEUE_DATA";

// ================= LOAD / SAVE =================
function getQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
}

function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

// ================= ADD TO QUEUE =================
function addToQueue(data) {

  let queue = getQueue();

  queue.push({
    id: "Q_" + Date.now(),

    ...data,

    priority: data.priority || "YELLOW",

    status: "PENDING",
    retry: 0,

    createdAt: Date.now(),
    lastTried: null
  });

  saveQueue(queue);
}

// ================= CONFIG =================
const QUEUE_CONFIG = {
  BATCH_SIZE: 6,
  RETRY_LIMIT: 3
};

// 🔥 PRIORITY WEIGHT
const PRIORITY_WEIGHT = {
  GREEN: 3,
  YELLOW: 2,
  RED: 1
};

// ================= PROCESS ENGINE =================
let isProcessing = false;

function processQueue() {

  if (isProcessing) return;

  let queue = getQueue();
  if (!queue.length) return;

  isProcessing = true;

  try {

    // ================= GROUP =================
    let grouped = {
      GREEN: [],
      YELLOW: [],
      RED: []
    };

    queue.forEach(q => {
      if (q.status === "PENDING") {
        grouped[q.priority]?.push(q);
      }
    });

    let processedCount = 0;

    // ================= WEIGHT LOOP =================
    while (processedCount < QUEUE_CONFIG.BATCH_SIZE) {

      let didProcess = false;

      for (let p of ["GREEN", "YELLOW", "RED"]) {

        let weight = PRIORITY_WEIGHT[p];

        for (let i = 0; i < weight; i++) {

          if (processedCount >= QUEUE_CONFIG.BATCH_SIZE) break;

          let item = grouped[p].shift();

          // 🔥 FALLBACK (if empty)
          if (!item) {
            item = getNextAvailable(grouped);
          }

          if (!item) continue;

          try {

            item.status = "PROCESSING";
            item.lastTried = Date.now();

            processQueueItem(item);

            item.status = "DONE";
            processedCount++;
            didProcess = true;

          } catch (err) {

            item.retry++;

            if (item.retry >= QUEUE_CONFIG.RETRY_LIMIT) {
              item.status = "FAILED";
              item.failReason = err.message;
            } else {
              item.status = "PENDING";
            }

          }
        }
      }

      // 🚫 STOP if nothing processed
      if (!didProcess) break;
    }

    saveQueue(queue);

  } catch (err) {
    console.error("Queue Crash:", err);
  } finally {
    isProcessing = false;
  }
}

// ================= FALLBACK PICK =================
function getNextAvailable(grouped) {

  return (
    grouped.GREEN.shift() ||
    grouped.YELLOW.shift() ||
    grouped.RED.shift() ||
    null
  );
}

// ================= CORE PROCESS =================
function processQueueItem(item) {

  if (item.type === "PIN_REQUEST") {
    processPinRequestAuto(item.requestId);
  }

}

// ================= AUTO RUN =================
setInterval(() => {
  processQueue();
}, 2000);

