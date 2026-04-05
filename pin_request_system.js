/*
========================================
PIN REQUEST SYSTEM (FINAL PRO ENGINE v5)
========================================
✔ Queue ready
✔ Priority system
✔ Lock system
✔ Fail-safe
✔ Auto + Manual
✔ Multi-PIN support
✔ Duplicate protection
✔ Amount validation
✔ Safe storage handling
========================================
*/

const PIN_REQUEST_KEY = "PIN_REQUEST_DATA";

// ================= LOAD / SAVE =================
function getPinRequests() {
  try {
    return JSON.parse(localStorage.getItem(PIN_REQUEST_KEY)) || [];
  } catch {
    localStorage.setItem(PIN_REQUEST_KEY, "[]");
    return [];
  }
}

function savePinRequests(data) {
  localStorage.setItem(PIN_REQUEST_KEY, JSON.stringify(data || []));
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

  let points = user.activePoints || 0;

  if (points >= 5) return "GREEN";
  if (points >= 2) return "YELLOW";
  return "RED";
}

// ================= CREATE REQUEST =================
function createPinRequest({ userId, type, amount, paymentId, quantity = 1 }) {

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

  // 🔒 DUPLICATE REQUEST BLOCK
  let pending = requests.find(r =>
    r.userId === userId &&
    r.type === type &&
    r.status === "PENDING"
  );

  if (pending) {
    throw new Error("You already have a pending request");
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

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");
  if (req.lock) throw new Error("Already processing");
  if (req.status !== "PENDING") throw new Error("Already processed");

  req.lock = true;
  req.status = "PROCESSING";
  req.processedBy = "SYSTEM";

  savePinRequests(requests);

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

    let requiredQty = req.quantity || 1;

    if (availablePins.length < requiredQty) {
      throw new Error("Insufficient PIN stock");
    }

    let assigned = [];

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

    req.status = "FAILED";
    req.failReason = err.message;
    req.processedAt = Date.now();
    req.lock = false;

    savePinRequests(requests);

    throw err;
  }
}

// ================= MANUAL PROCESS =================
function processPinRequestManual(requestId, pinIds = [], performedBy) {

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");
  if (req.lock) throw new Error("Already processing");
  if (req.status !== "PENDING") throw new Error("Already processed");

  if (!Array.isArray(pinIds) || !pinIds.length) {
    throw new Error("No PINs provided");
  }

  req.lock = true;
  req.status = "PROCESSING";
  req.processedBy = performedBy;

  savePinRequests(requests);

  try {

    let assigned = [];

    pinIds.forEach(pinId => {
      assignPin(pinId, req.userId, "user", performedBy);
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
    req.failReason = err.message;
    req.processedAt = Date.now();
    req.lock = false;

    savePinRequests(requests);

    throw err;
  }
}

// ================= REJECT =================
function rejectPinRequest(requestId, performedBy = "ADMIN") {

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");
  if (req.lock) throw new Error("Processing in progress");
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

