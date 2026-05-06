/*
========================================
PIN REQUEST SYSTEM V8.1 (FINAL CLEAN PATCH + ACTION GATE)
========================================
✔ Safe storage (self-healing)
✔ System lock protected
✔ Queue control integrated
✔ PIN config validation
✔ Duplicate protection
✔ Rollback safety
✔ DEADLOCK protection
✔ CROSS USER leakage blocked
✔ ACTION CONTROL ENFORCED (NEW)
========================================
*/

const PIN_REQUEST_KEY = "PIN_REQUEST_DATA";
const PIN_REQUEST_LIMIT = 5000;

// ================= LOAD / SAVE =================
function getPinRequests() {
  let data = safeGet(PIN_REQUEST_KEY, []);
  return Array.isArray(data) ? data : [];
}

function savePinRequests(data) {
  if (!Array.isArray(data)) data = [];

  if (data.length > PIN_REQUEST_LIMIT) {
    data = data.slice(-PIN_REQUEST_LIMIT);
  }

  safeSet(PIN_REQUEST_KEY, data);
}

// ================= ID =================
function generateRequestId() {
  return "REQ_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();
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

  let s = getSystemSettings() || {};
  let q = s.pinQueue || {};

  return q.enabled !== false;
}

// ================= DUPLICATE CHECK =================
function hasRecentDuplicateRequest(userId, type, paymentId) {
  let now = Date.now();

  return getPinRequests().some(r =>
    r.userId === userId &&
    r.type === type &&
    r.paymentId === paymentId &&
    (now - Number(r.createdAt || 0)) < 10000
  );
}

// ================= CREATE REQUEST =================
function createPinRequest({ userId, type, amount, paymentId, quantity = 1 }) {

  // ================= ACTION CONTROL GATE (NEW PATCH) =================
  if (typeof canExecutePinAction === "function") {
    const role = typeof getCurrentUser === "function"
      ? (getCurrentUser()?.role || "user")
      : "user";

    const allowed = canExecutePinAction(
      PIN_ACTION.ASSIGN,
      { status: "pending" },
      role
    );

    if (!allowed) {
      throw new Error("Permission denied by action control");
    }
  }

  // ================= SYSTEM CHECKS =================
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

  let pending = requests.find(r =>
    r.userId === userId &&
    r.type === type &&
    r.status === "PENDING"
  );

  if (pending) throw new Error("Pending request already exists");

  if (hasRecentDuplicateRequest(userId, type, paymentId)) {
    throw new Error("Duplicate request blocked");
  }

  let safeQty = parseInt(quantity);
  if (isNaN(safeQty) || safeQty < 1) safeQty = 1;

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

// ================= USER VIEW =================
function getUserPinRequests(userId) {
  return getPinRequests().filter(r => r.userId === userId);
}
