script>

/*
========================================
PIN REQUEST SYSTEM (FINAL - SYSTEM POOL)
========================================
Flow:
User → Request PIN → System Pool → Assign PIN → User Account
Supports:
- AUTO MODE (system assigns)
- MANUAL MODE (admin assigns)
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

// ================= GENERATE REQUEST ID =================
function generateRequestId() {
  return "REQ_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
}

// ================= CREATE REQUEST =================
function requestPin({ userId, type, quantity = 1, paymentRef = null }) {

  if (!userId || !type) {
    alert("Invalid request data");
    return;
  }

  if (!["upgrade", "repurchase"].includes(type)) {
    alert("Invalid PIN type");
    return;
  }

  let requests = getPinRequests();

  let newRequest = {
    requestId: generateRequestId(),

    userId,
    type,
    quantity,

    paymentRef, // bank ref / txn id

    status: "PENDING",

    assignedPins: [],

    createdAt: Date.now(),
    processedAt: null
  };

  requests.push(newRequest);
  savePinRequests(requests);

  alert("✅ PIN request submitted");

  return newRequest;
}

// ================= AUTO PROCESS (SYSTEM MODE) =================
function processPinRequestAuto(requestId, performedBy = "system") {

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");

  if (req.status !== "PENDING") {
    throw new Error("Already processed");
  }

  req.status = "PROCESSING";

  try {

    let assigned = [];

    for (let i = 0; i < req.quantity; i++) {

      // 🔥 GET AVAILABLE PIN FROM MASTER
      let pins = loadPins();
      let available = pins.find(p =>
        p.status === "active" &&
        p.type === req.type &&
        p.ownerType === "admin"
      );

      if (!available) {
        throw new Error("Insufficient PIN stock");
      }

      // 🔥 ASSIGN USING MASTER SYSTEM
      assignPin(available.pinId, req.userId, "user", performedBy);

      assigned.push(available.pinId);
    }

    req.assignedPins = assigned;
    req.status = "COMPLETED";
    req.processedAt = Date.now();

    savePinRequests(requests);

    return true;

  } catch (err) {
    req.status = "PENDING";
    savePinRequests(requests);
    throw err;
  }
}

// ================= MANUAL PROCESS (ADMIN) =================
function processPinRequestManual(requestId, pinIds = [], performedBy) {

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");

  if (req.status !== "PENDING") {
    throw new Error("Already processed");
  }

  if (!pinIds.length) {
    throw new Error("No PINs provided");
  }

  req.status = "PROCESSING";

  try {

    let assigned = [];

    pinIds.forEach(pinId => {

      assignPin(pinId, req.userId, "user", performedBy);
      assigned.push(pinId);

    });

    req.assignedPins = assigned;
    req.status = "COMPLETED";
    req.processedAt = Date.now();

    savePinRequests(requests);

    return true;

  } catch (err) {
    req.status = "PENDING";
    savePinRequests(requests);
    throw err;
  }
}

// ================= REJECT REQUEST =================
function rejectPinRequest(requestId, performedBy = "admin") {

  let requests = getPinRequests();
  let req = requests.find(r => r.requestId === requestId);

  if (!req) throw new Error("Request not found");

  if (req.status !== "PENDING") {
    throw new Error("Already processed");
  }

  req.status = "REJECTED";
  req.processedAt = Date.now();

  savePinRequests(requests);

  return true;
}

// ================= GET USER REQUESTS =================
function getUserPinRequests(userId) {
  let requests = getPinRequests();
  return requests.filter(r => r.userId === userId);
}

</script>
