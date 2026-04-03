========================================
PIN REQUEST SYSTEM (FINAL PRO ENGINE)
========================================
✔ Queue based
✔ Lock system
✔ Status tracking
✔ Fail-safe
✔ Auto + Manual
✔ Admin-level thinking system
========================================
*/

const PIN_REQUEST_KEY = "PIN_REQUEST_DATA";

// ================= LOAD / SAVE =================
function getPinRequests() {
  return JSON.parse(localStorage.getItem(PIN_REQUEST_KEY)) || [];
}

function savePinRequests(data) {
  localStorage.setItem(PIN_REQUEST_KEY, JSON.stringify(data));
}

// ================= ID =================
function generateRequestId() {
  return "REQ_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
}

// ================= CREATE REQUEST =================
function createPinRequest({ userId, type, amount, paymentId }) {

  if (!userId || !type || !paymentId) {
    throw new Error("Invalid request data");
  }

  if (!["upgrade", "repurchase"].includes(type)) {
    throw new Error("Invalid PIN type");
  }

  let requests = getPinRequests();

  let newRequest = {
    requestId: generateRequestId(),

    userId,
    type,
    amount,
    paymentId,

    status: "PENDING", // PENDING | PROCESSING | COMPLETED | FAILED | REJECTED
    lock: false,

    assignedPins: [],

    priority: "YELLOW", // future: GREEN / YELLOW / RED

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

  // 🔒 LOCK CHECK
  if (req.lock) throw new Error("Already processing");

  if (req.status !== "PENDING") {
    throw new Error("Already processed");
  }

  req.lock = true;
  req.status = "PROCESSING";
  req.processedBy = "SYSTEM";

  savePinRequests(requests);

  try {

    let pins = loadPins();

    // 🔥 FILTER AVAILABLE PINS
    let availablePins = pins.filter(p =>
      p.status === "active" &&
      p.type === req.type &&
      p.ownerType === "admin"
    );

    if (availablePins.length === 0) {
      throw new Error("No PIN stock available");
    }

    // 🔥 ATOMIC PICK (only 1 or extend later)
    let selected = availablePins[0];

    assignPin(selected.pinId, req.userId, "user", "SYSTEM");

    req.assignedPins = [selected.pinId];
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

  if (req.status !== "PENDING") {
    throw new Error("Already processed");
  }

  if (!pinIds.length) {
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

  if (req.status !== "PENDING") {
    throw new Error("Already processed");
  }

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

