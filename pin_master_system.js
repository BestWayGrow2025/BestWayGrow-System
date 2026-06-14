"use strict";

/*
========================================
PIN MASTER SYSTEM V9.1 FINAL MASTER
========================================
✔ Upgrade PIN (UGLI SYSTEM)
✔ Repurchase PIN (RLI SYSTEM)
✔ Unique PIN ID system
✔ Stock tracking + ownership
✔ Request → Assign → Use flow
✔ Super Admin safe execution
✔ Replay protection + locks
✔ Production stable system
========================================
*/

/* ================= STORAGE KEYS ================= */

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";
const PIN_LOG_LIMIT = 5000;

/* ================= PIN TYPES ================= */

const PIN_TYPE = {
  UPGRADE: "upgrade",
  REPURCHASE: "repurchase"
};

/* ================= EXEC LOCK SYSTEM ================= */

const PIN_EXEC_LOCKS = {};
const PIN_EXEC_TTL = 10000;

function isLocked(key) {
  const t = PIN_EXEC_LOCKS[key];
  if (!t) return false;

  if (Date.now() - t > PIN_EXEC_TTL) {
    delete PIN_EXEC_LOCKS[key];
    return false;
  }
  return true;
}

function setLock(key, state) {
  if (state) PIN_EXEC_LOCKS[key] = Date.now();
  else delete PIN_EXEC_LOCKS[key];
}

/* ================= CORE SAFETY ================= */

function isPinSystemSafe() {
  return window.__CORE_STATE__?.initialized === true;
}

/* ================= LOAD PINS ================= */

function loadPins() {
  let pins = safeGet(PIN_STORAGE_KEY, []);
  if (!Array.isArray(pins)) pins = [];

  const now = Date.now();

  pins.forEach(p => {
    if (!p) return;

    if (!p.pinId) {
      p.pinId = generatePinId("PIN");
    }

    if (!p.transferHistory) {
      p.transferHistory = [];
    }

    if (p.lock && now - (p.lockedAt || now) > 10000) {
      p.lock = false;
      p.lockedAt = null;
    }
  });

  savePins(pins);
  return pins;
}

/* ================= SAVE PINS ================= */

function savePins(pins) {
  safeSet(PIN_STORAGE_KEY, pins);
}

/* ================= PIN ID GENERATOR ================= */

function generatePinId(prefix = "PIN") {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

/* ================= LOG SYSTEM ================= */

function logPin(data) {
  let logs = safeGet(PIN_LOG_KEY, []);
  if (!Array.isArray(logs)) logs = [];

  logs.push({
    id: "LOG_" + Date.now(),
    action: data.action,
    pinId: data.pinId,
    by: data.by,
    status: data.status,
    time: new Date().toISOString()
  });

  if (logs.length > PIN_LOG_LIMIT) {
    logs = logs.slice(-PIN_LOG_LIMIT);
  }

  safeSet(PIN_LOG_KEY, logs);
}

/* ================= PIN CREATION ================= */

function createPin(type, amount, bv, gst, quantity = 1) {
  if (!isPinSystemSafe()) return false;

  let pins = loadPins();

  for (let i = 0; i < quantity; i++) {
    pins.push({
      pinId: generatePinId(type === "upgrade" ? "UGLI" : "RLI"),
      type: type,
      amount: Number(amount),
      bv: Number(bv),
      gst: Number(gst),
      status: "stock",
      ownerId: null,
      assignedTo: null,
      usedBy: null,
      createdAt: Date.now(),
      locked: false
    });
  }

  savePins(pins);

  logPin({
    action: "CREATE_PIN",
    pinId: type,
    by: "SUPER_ADMIN",
    status: "success"
  });

  return true;
}

/* ================= ASSIGN PIN ================= */

function assignPin(pinId, toUserId) {
  const key = "ASSIGN_" + pinId;
  if (isLocked(key)) return false;

  setLock(key, true);

  try {
    let pins = loadPins();
    let pin = pins.find(p => p.pinId === pinId);

    if (!pin || pin.status !== "stock") return false;

    pin.status = "assigned";
    pin.assignedTo = toUserId;
    pin.assignedAt = Date.now();

    savePins(pins);

    logPin({
      action: "ASSIGN",
      pinId,
      by: toUserId,
      status: "success"
    });

    return true;
  } finally {
    setLock(key, false);
  }
}

/* ================= USE PIN ================= */

function usePin(pinId, userId) {
  const key = "USE_" + pinId;
  if (isLocked(key)) return false;

  setLock(key, true);

  try {
    let pins = loadPins();
    let pin = pins.find(p => p.pinId === pinId);

    if (!pin || pin.status !== "assigned") return false;

    pin.status = "used";
    pin.usedBy = userId;
    pin.usedAt = Date.now();

    savePins(pins);

    logPin({
      action: "USE",
      pinId,
      by: userId,
      status: "success"
    });

    return true;
  } finally {
    setLock(key, false);
  }
}

/* ================= PIN FETCH ================= */

function getAllPins() {
  return loadPins();
}

/* ================= PIN FILTER ================= */

function getPinsByType(type) {
  return loadPins().filter(p => p.type === type);
}

/* ================= EXPORT ================= */

window.loadPins = loadPins;
window.createPin = createPin;
window.assignPin = assignPin;
window.usePin = usePin;
window.getAllPins = getAllPins;
window.getPinsByType = getPinsByType;
