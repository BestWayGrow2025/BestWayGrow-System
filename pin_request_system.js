/*
========================================
PIN REQUEST SYSTEM V9.0 (FINAL HARDENED)
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

"use strict";

const PIN_REQUEST_KEY = "PIN_REQUEST_DATA";
const PIN_REQUEST_LIMIT = 5000;

const PIN_REQUEST_LOCKS = {};
const PIN_REQUEST_LOCK_TTL = 10000;

const PIN_PAYMENT_REPLAY_KEY = "PIN_PAYMENT_REPLAY";

// ================= CORE READY =================
function isPinRequestSystemReady() {
  return !!(
    window.__CORE_STATE__ &&
    window.__CORE_STATE__.initialized === true
  );
}

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

  let store = getPaymentReplayStore();
  return store[paymentId] === true;
}

function markPaymentUsed(paymentId) {
  if (!paymentId) return;

  let store = getPaymentReplayStore();
  store[paymentId] = true;

  savePaymentReplayStore(store);
}

// ================= LOCK =================
function isRequestLocked(key) {
  let t = PIN_REQUEST_LOCKS[key];

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

    assignedPins: Array.isArray(r.assignedPins)
      ? r.assignedPins
      : [],

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

  let clean = data
    .map(sanitizeRequest)
    .filter(Boolean);

  safeSet(PIN_REQUEST_KEY, clean);

  return clean;
}

function savePinRequests(data) {

  if (!Array.isArray(data)) {
    data = [];
  }

  data = data
    .map(sanitizeRequest)
    .filter(Boolean);

  if (data.length > PIN_REQUEST_LIMIT) {
    data = data.slice(-PIN_REQUEST_LIMIT);
  }

  safeSet(PIN_REQUEST_KEY, data);
}

// ================= ID =================
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

  if (typeof getUserById !== "function") {
    return "YELLOW";
  }

  let user = getUserById(userId);

  if (!user) return "YELLOW";

  let points = Number(user.activePoints || 0);

  if (points >= 5) return "GREEN";
  if (points >= 2) return "YELLOW";

  return "RED";
}

// ================= QUEUE =================
function isQueueEnabled() {

  if (typeof getSystemSettings !== "function") {
    return true;
  }

  let s = getSystemSettings() || {};
  let q = s.pinQueue || {};

  return q.enabled !== false;
}

// ================= DUPLICATE =================
function hasRecentDuplicateRequest(userId, type, paymentId) {

  let requests = getPinRequests();

  return requests.some(r =>
    r.userId === userId &&
    r.type === type &&
    r.paymentId === paymentId &&
    ["PENDING", "APPROVED", "COMPLETED"].includes(r.status)
  );
}

// ================= CREATE =================
function createPinRequest({
  userId,
  type,
  amount,
  paymentId,
  quantity = 1
}) {

  const lockKey =
    String(userId) + "_" +
    String(paymentId);

  try {

    // ================= CORE =================
    if (!isPinRequestSystemReady()) {
      throw new Error("Core not ready");
    }

    // ================= SESSION =================
    if (typeof getSession === "function") {

      const session = getSession();

      if (!session || !session.userId) {
        throw new Error("Invalid session");
      }
    }

    // ================= LOCK =================
    if (isRequestLocked(lockKey)) {
      throw new Error("Request locked");
    }

    setRequestLock(lockKey, true);

    // ================= SYSTEM =================
    if (
      typeof isSystemSafe === "function" &&
      !isSystemSafe()
    ) {
      throw new Error("System locked");
    }

    if (!isQueueEnabled()) {
      throw new Error("Queue OFF");
    }

    // ================= NORMALIZE =================
    type = String(type || "")
      .trim()
      .toLowerCase();

    paymentId = String(paymentId || "")
      .trim();

    quantity = parseInt(quantity);

    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    }

    amount = Number(amount);

    // ================= VALIDATE =================
    if (!userId || !type || !paymentId) {
      throw new Error("Invalid request data");
    }

    if (!["upgrade", "repurchase"].includes(type)) {
      throw new Error("Invalid PIN type");
    }

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // ================= PAYMENT REPLAY =================
    if (isPaymentUsed(paymentId)) {
      throw new Error("Payment already used");
    }

    // ================= PIN SYSTEM =================
    if (
      typeof isPinSystemSafe === "function" &&
      !isPinSystemSafe(type)
    ) {
      throw new Error("PIN system disabled");
    }

    let requests = getPinRequests();

    // ================= PENDING CHECK =================
    let pending = requests.find(r =>
      r.userId === userId &&
      r.type === type &&
      r.status === "PENDING"
    );

    if (pending) {
      throw new Error("Pending request exists");
    }

    // ================= DUPLICATE =================
    if (
      hasRecentDuplicateRequest(
        userId,
        type,
        paymentId
      )
    ) {
      throw new Error("Duplicate request blocked");
    }

    // ================= ACTION POLICY =================
    let role = "user";

    if (typeof getCurrentUser === "function") {
      const current = getCurrentUser();
      role = current?.role || "user";
    }

    if (typeof canExecutePinAction === "function") {

      const allowed =
        canExecutePinAction(
          PIN_ACTION.REQUEST,
          { status: "pending" },
          role
        );

      if (!allowed) {
        throw new Error(
          "Request blocked by policy"
        );
      }
    }

    // ================= CREATE =================
    let newRequest = {
      requestId: generateRequestId(),

      userId,
      type,

      amount: parseFloat(
        amount.toFixed(2)
      ),

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

    // ================= MARK REPLAY =================
    markPaymentUsed(paymentId);

    return newRequest;

  } finally {

    setRequestLock(lockKey, false);

  }
}
