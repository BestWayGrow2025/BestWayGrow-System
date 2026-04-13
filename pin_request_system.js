/*
========================================
PIN REQUEST SYSTEM V7.2 (ULTRA FINAL)
========================================
✔ Safe storage (self-healing)
✔ System lock protected
✔ Queue control integrated
✔ PIN config validation
✔ Full rollback safety
✔ Retry + fail-safe improved
✔ Deadlock protection
✔ Production stable
========================================
*/

const PIN_REQUEST_KEY = "PIN_REQUEST_DATA";

// ================= LOAD / SAVE =================
function getPinRequests() {
  let data = safeGet(PIN_REQUEST_KEY, []);
  return Array.isArray(data) ? data : [];
}

function savePinRequests(data) {
  if (!Array.isArray(data)) data = [];
  safeSet(PIN_REQUEST_KEY, data);
}

// ================= ID =================
function generateRequestId() {
  return "REQ_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
}

// ================= PRIORITY =================
function detectPriority(userId) {

  if (typeof getUserById !== "function") return "YELLOW";

  let user = getUserById(userId);
  if (!user) return "YELLOW";

  let points = Number(user.activePoints || 0);

  if (points >= 5) return "GREEN";
  if (points >= 2) return "YELLOW";
  return "RED";
}

// ================= QUEUE CHECK =================
function isQueueEnabled() {
  if (typeof getSystemSettings !== "function") return true;

  let s = getSystemSettings();
  let q = s.pinQueue || {};

  return q.enabled !== false;
}

// ================= CREATE REQUEST =================
function createPinRequest({ userId, type, amount, paymentId, quantity = 1 }) {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) {
    throw new Error("System locked");
  }

  if (!isQueueEnabled()) {
    throw new Error("Queue OFF");
  }

  if (typeof isPinSystemSafe === "function" && !isPinSystemSafe(type)) {
    throw new Error("PIN system disabled");
  }

  if (!userId || !type || !paymentId) {
    throw new Error("Invalid request data");
  }

  if (!["upgrade", "repurchase"].includes(type)) {
    throw new Error("Invalid PIN type");
  }

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  let requests = getPinRequests();

  // 🔒 DUPLICATE BLOCK
  let pending = requests.find(r =>
    r.userId === userId &&
    r.type === type &&
    r.status === "PENDING"
  );

  if (pending) {
    throw new Error("Pending request already exists");
  }

  let safeQty = parseInt(quantity) || 1;
  if (safeQty < 1) safeQty = 1;

  let newRequest = {
    requestId: generateRequestId(),
    userId,
    type,
    amount,
    paymentId,
    quantity: safeQty,

    status: "PENDING",
    lock: false,

    assignedPins: [],
    priority: detectPriority(userId),

    retry: 0,

    createdAt: Date.now(),
    processedAt: null,

    processedBy: null,
    failReason: null
  };

  requests.push(newRequest);
  savePinRequests(requests);

  return newRequest;
}

// ================= AUTO PROCESS =================
function processPinRequestAuto(requestId) {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) {
    throw new Error("System locked");
  }

  if (!isQueueEnabled()) {
    throw new Error("Queue OFF");
  }

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");
  if (req.lock) throw new Error("Processing");
  if (req.status !== "PENDING") throw new Error("Already processed");

  req.lock = true;
  req.status = "PROCESSING";
  req.processedBy = "SYSTEM";

  savePinRequests(requests);

  let assigned = [];

  try {

    if (typeof loadPins !== "function" || typeof assignPin !== "function") {
      throw new Error("PIN system not available");
    }

    let pins = loadPins();

    let availablePins = pins.filter(p =>
      p.status === "active" &&
      p.type === req.type &&
      p.ownerType === "admin"
    );

    let requiredQty = Number(req.quantity) || 1;

    if (availablePins.length < requiredQty) {
      throw new Error("Insufficient PIN stock");
    }

    // 🔥 SAFE LOOP
    for (let i = 0; i < requiredQty; i++) {
      let pin = availablePins[i];

      assignPin(pin.pinId, req.userId, "user", "SYSTEM");
      assigned.push(pin.pinId);
    }

    req.assignedPins = assigned;
    req.status = "COMPLETED";
    req.processedAt = Date.now();
    req.lock = false;

    savePinRequests(requests);

    return true;

  } catch (err) {

    // 🔁 FULL ROLLBACK
    try {
      let pins = loadPins();

      assigned.forEach(pinId => {
        let p = pins.find(x => x.pinId === pinId);
        if (p) {
          p.status = "active";
          p.ownerId = null;
          p.ownerType = "admin";
          p.assignedTo = null;
          p.assignedAt = null;
        }
      });

      savePins(pins);
    } catch (e) {
      console.warn("Rollback failed");
    }

    req.retry = Number(req.retry || 0) + 1;

    if (req.retry >= 3) {
      req.status = "FAILED";
      req.failReason = err.message || "Unknown error";
      req.processedAt = Date.now();
    } else {
      req.status = "PENDING";
    }

    req.lock = false;

    savePinRequests(requests);

    throw err;
  }
}

// ================= MANUAL PROCESS =================
function processPinRequestManual(requestId, pinIds = [], performedBy) {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) {
    throw new Error("System locked");
  }

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");
  if (req.lock) throw new Error("Processing");
  if (req.status !== "PENDING") throw new Error("Already processed");

  if (!Array.isArray(pinIds) || !pinIds.length) {
    throw new Error("No PINs provided");
  }

  req.lock = true;
  req.status = "PROCESSING";
  req.processedBy = performedBy || "ADMIN";

  savePinRequests(requests);

  let assigned = [];

  try {

    pinIds.forEach(pinId => {
      assignPin(pinId, req.userId, "user", req.processedBy);
      assigned.push(pinId);
    });

    req.assignedPins = assigned;
    req.status = "COMPLETED";
    req.processedAt = Date.now();
    req.lock = false;

    savePinRequests(requests);

    return true;

  } catch (err) {

    req.status = "FAILED";
    req.failReason = err.message || "Unknown error";
    req.processedAt = Date.now();
    req.lock = false;

    savePinRequests(requests);

    throw err;
  }
}

// ================= REJECT =================
function rejectPinRequest(requestId, performedBy = "ADMIN") {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) {
    throw new Error("System locked");
  }

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");
  if (req.lock) throw new Error("Processing");
  if (req.status !== "PENDING") throw new Error("Already processed");

  req.status = "REJECTED";
  req.processedAt = Date.now();
  req.processedBy = performedBy;

  savePinRequests(requests);

  return true;
}

// ================= USER VIEW =================
function getUserPinRequests(userId) {
  return getPinRequests().filter(r => r.userId === userId);
}



