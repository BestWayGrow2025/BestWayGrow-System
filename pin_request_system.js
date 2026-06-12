"use strict";

/*
========================================
PIN REQUEST SYSTEM V9.1 (FINAL HARDENED)
========================================
✔ Core aligned
✔ Session protected
✔ Runtime request locking
✔ Permanent replay protection
✔ Duplicate request blocked
✔ Safe request normalization
✔ Storage self-healing
✔ Queue control integrated
✔ Action policy protected
✔ Corruption safe
✔ Production LOCKED
========================================
*/

// ================= IMPORT SAFE =================
const PIN_ACTION = {
  REQUEST: "REQUEST"
};

// ================= CORE READY =================
function isPinRequestSystemReady() {
  return !!(
    window.__CORE_STATE__ &&
    window.__CORE_STATE__.initialized === true
  );
}

// ================= STORAGE KEYS =================
const PIN_REQUEST_KEY = "PIN_REQUEST_DATA";
const PIN_REQUEST_LIMIT = 5000;
const PIN_REQUEST_LOCKS = {};
const PIN_REQUEST_LOCK_TTL = 10000;
const PIN_PAYMENT_REPLAY_KEY = "PIN_PAYMENT_REPLAY";

// ================= PAYMENT REPLAY =================
function getPaymentReplayStore() {
  let data = safeGet(PIN_PAYMENT_REPLAY_KEY, {});
  return (data && typeof data === "object") ? data : {};
}

function savePaymentReplayStore(data) {
  safeSet(PIN_PAYMENT_REPLAY_KEY, data || {});
}

function isPaymentUsed(paymentId) {
  if (!paymentId) return false;

  const store = getPaymentReplayStore();
  return store[paymentId] === true;
}

function markPaymentUsed(paymentId) {
  if (!paymentId) return;

  const store = getPaymentReplayStore();
  store[paymentId] = true;

  savePaymentReplayStore(store);
}

// ================= LOCK SYSTEM =================
function isRequestLocked(key) {
  const t = PIN_REQUEST_LOCKS[key];

  if (!t) return false;

  if ((Date.now() - t) > PIN_REQUEST_LOCK_TTL) {
    delete PIN_REQUEST_LOCKS[key];
    return false;
  }

  return true;
}

function setRequestLock(key, val) {
  if (val) {
    PIN_REQUEST_LOCKS[key] = Date.now();
  } else {
    delete PIN_REQUEST_LOCKS[key];
  }
}

// ================= SANITIZER =================
function sanitizeRequest(r) {
  if (!r || typeof r !== "object") return null;

  return {
    requestId: String(r.requestId || ""),
    userId: String(r.userId || ""),
    type: String(r.type || "").toLowerCase(),
    amount: parseFloat(Number(r.amount || 0).toFixed(2)),
    paymentId: String(r.paymentId || "").trim(),
    quantity: Math.max(1, parseInt(r.quantity || 1)),
    status: String(r.status || "PENDING").toUpperCase(),
    lock: r.lock === true,
    assignedPins: Array.isArray(r.assignedPins) ? r.assignedPins : [],
    priority: String(r.priority || "YELLOW"),
    retry: Number(r.retry || 0),
    createdAt: Number(r.createdAt || Date.now()),
    processedAt: r.processedAt || null,
    processedBy: r.processedBy || null,
    failReason: r.failReason || null
  };
}

// ================= LOAD / SAVE =================
function getPinRequests() {
  let data = safeGet(PIN_REQUEST_KEY, []);

  if (!Array.isArray(data)) {
    safeSet(PIN_REQUEST_KEY, []);
    return [];
  }

  const clean = data.map(sanitizeRequest).filter(Boolean);

  safeSet(PIN_REQUEST_KEY, clean);

  return clean;
}

function savePinRequests(data) {
  if (!Array.isArray(data)) data = [];

  const clean = data.map(sanitizeRequest).filter(Boolean);

  if (clean.length > PIN_REQUEST_LIMIT) {
    clean.splice(0, clean.length - PIN_REQUEST_LIMIT);
  }

  safeSet(PIN_REQUEST_KEY, clean);
}

// ================= ID GENERATOR =================
function generateRequestId() {
  return (
    "REQ_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

// ================= PRIORITY =================
function detectPriority(userId) {
  if (typeof getUserById !== "function") return "YELLOW";

  const user = getUserById(userId);
  if (!user) return "YELLOW";

  const points = Number(user.activePoints || 0);

  if (points >= 5) return "GREEN";
  if (points >= 2) return "YELLOW";

  return "RED";
}

// ================= QUEUE CONTROL =================
function isQueueEnabled() {
  if (typeof getSystemSettings !== "function") return true;

  const s = getSystemSettings() || {};
  return s.pinQueue?.enabled !== false;
}

// ================= DUPLICATE CHECK =================
function hasRecentDuplicateRequest(userId, type, paymentId) {
  const requests = getPinRequests();

  return requests.some(r =>
    r.userId === userId &&
    r.type === type &&
    r.paymentId === paymentId &&
    ["PENDING", "APPROVED", "COMPLETED"].includes(r.status)
  );
}

// ================= CREATE REQUEST =================
function createPinRequest({
  userId,
  type,
  amount,
  paymentId,
  quantity = 1
}) {

  const lockKey = `${userId}_${paymentId}`;

  try {

    // ================= CORE CHECK =================
    if (!isPinRequestSystemReady()) {
      throw new Error("Core not ready");
    }

    // ================= SESSION CHECK =================
    if (typeof getSession === "function") {
  const session = getSession();

  if (!session || !session.userId) {
    throw new Error("Invalid session");
  }

  if (session.userId !== userId) {
    throw new Error("User mismatch");
  }
}

    // ================= LOCK =================
    if (isRequestLocked(lockKey)) {
      throw new Error("Request locked");
    }

    setRequestLock(lockKey, true);

    // ================= SYSTEM SAFETY =================
    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) {
        throw new Error("System locked");
      }
    }

    if (!isQueueEnabled()) {
      throw new Error("Queue OFF");
    }

    // ================= NORMALIZE =================
    type = String(type || "").trim().toLowerCase();
    paymentId = String(paymentId || "").trim();
    quantity = Math.max(1, parseInt(quantity || 1));
    amount = Number(amount);

    // ================= VALIDATION =================
    if (!userId || !type || !paymentId) {
      throw new Error("Invalid request data");
    }

    if (!["upgrade", "repurchase"].includes(type)) {
      throw new Error("Invalid PIN type");
    }

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // ================= REPLAY PROTECTION =================
    if (isPaymentUsed(paymentId)) {
      throw new Error("Payment already used");
    }

    // ================= PIN SYSTEM CHECK =================
    if (typeof isPinSystemSafe === "function") {
      if (!isPinSystemSafe(type)) {
        throw new Error("PIN system disabled");
      }
    }

    const requests = getPinRequests();

    // ================= PENDING CHECK =================
    const pending = requests.find(r =>
      r.userId === userId &&
      r.type === type &&
      r.status === "PENDING"
    );

    if (pending) {
      throw new Error("Pending request exists");
    }

    // ================= DUPLICATE CHECK =================
    if (hasRecentDuplicateRequest(userId, type, paymentId)) {
      throw new Error("Duplicate request blocked");
    }

    // ================= POLICY CHECK =================
    let role = "user";

    if (typeof getCurrentUser === "function") {
      const current = getCurrentUser();
      role = current?.role || "user";
    }

    if (typeof canExecutePinAction === "function") {
      const allowed = canExecutePinAction(
        PIN_ACTION.REQUEST,
        { status: "pending" },
        role
      );

      if (!allowed) {
        throw new Error("Request blocked by policy");
      }
    }

    // ================= CREATE REQUEST =================
    const newRequest = {
      requestId: generateRequestId(),
      userId,
      type,
      amount: parseFloat(amount.toFixed(2)),
      paymentId,
      quantity,
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

    markPaymentUsed(paymentId);

    return newRequest;

  } finally {
    setRequestLock(lockKey, false);
  }
}

// ================= EXPORT =================
window.createPinRequest = createPinRequest;
window.getPinRequests = getPinRequests;
window.savePinRequests = savePinRequests;
