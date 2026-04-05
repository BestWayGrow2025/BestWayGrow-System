/*
========================================
PIN MASTER SYSTEM (FINAL CORE ENGINE PRO v4)
========================================
✔ No duplicate code
✔ Lock-safe
✔ Queue compatible
✔ Status lifecycle fixed
✔ Secure status update
✔ Full audit tracking
✔ Core system integrated
========================================
*/

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";

// ================= LOAD / SAVE =================
function loadPins() {
  try {
    return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY)) || [];
  } catch {
    localStorage.setItem(PIN_STORAGE_KEY, "[]");
    return [];
  }
}

function savePins(pins) {
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins || []));
}

// ================= LOG SYSTEM =================
function logPinAction(actionData) {
  let logs;
  try {
    logs = JSON.parse(localStorage.getItem(PIN_LOG_KEY)) || [];
  } catch {
    logs = [];
  }

  logs.push({
    id: "LOG_" + Date.now(),
    ...actionData,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem(PIN_LOG_KEY, JSON.stringify(logs));
}

// ================= GENERATE PIN =================
function generatePinId(prefix = "PIN") {
  return prefix + "_" + Math.random().toString(36).substring(2, 8) + Date.now();
}

// ================= PIN MODE =================
function getPinMode() {
  try {
    if (typeof loadSystemControls === "function") {
      let ctrl = loadSystemControls();
      return ctrl.pinMode || "AUTO";
    }
  } catch {}

  return "AUTO";
}

// ================= CREATE PIN =================
function createPin({ type = "upgrade", bv = 0, amount = 0, gst = 0, createdBy }) {

  if (typeof isPinSystemSafe === "function") {
    if (!isPinSystemSafe(type)) {
      throw new Error("PIN config inactive or invalid");
    }
  }

  let pins = loadPins();

  let newPin = {
    pinId: generatePinId(type === "upgrade" ? "UP" : "RP"),
    type,
    bv,
    amount,
    gst,

    status: "active",

    ownerId: null,
    ownerType: "admin",

    createdBy,

    assignedTo: null,
    usedBy: null,

    createdAt: Date.now(),
    assignedAt: null,
    usedAt: null,

    lock: false,

    transferHistory: []
  };

  pins.push(newPin);
  savePins(pins);

  logPinAction({
    action: "PIN_CREATE",
    pinId: newPin.pinId,
    performedBy: createdBy,
    amount,
    bv,
    gst,
    status: "success"
  });

  return newPin;
}

// ================= ASSIGN PIN =================
function assignPin(pinId, toId, toType, performedBy) {

  let mode = getPinMode();
  if (mode === "OFF") throw new Error("PIN system is disabled");

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("PIN not found");
  if (pin.lock) throw new Error("PIN locked");

  if (pin.status !== "active") {
    throw new Error("PIN not available");
  }

  pin.lock = true;

  try {

    pin.ownerId = toId;
    pin.ownerType = toType;
    pin.assignedTo = toId;
    pin.assignedAt = Date.now();

    pin.status = "assigned";

    pin.transferHistory.push({
      from: "admin",
      to: toId,
      by: performedBy,
      timestamp: Date.now()
    });

    pin.lock = false;
    savePins(pins);

    logPinAction({
      action: "PIN_ASSIGN",
      pinId,
      fromId: "admin",
      toId,
      performedBy,
      amount: pin.amount,
      bv: pin.bv,
      gst: pin.gst,
      status: "success"
    });

    return true;

  } catch (err) {
    pin.lock = false;
    savePins(pins);
    throw err;
  }
}

// ================= USE PIN =================
function usePin(pinId, userId, purpose) {

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("Invalid PIN");
  if (pin.lock) throw new Error("PIN is being processed");

  if (pin.status !== "assigned") {
    throw new Error("PIN not usable");
  }

  if (typeof isPinSystemSafe === "function") {
    if (!isPinSystemSafe(pin.type)) {
      throw new Error("PIN system inactive");
    }
  }

  if (typeof isPinAllowedForPurpose === "function") {
    if (!isPinAllowedForPurpose(pin.type, purpose)) {
      throw new Error("Invalid PIN usage");
    }
  }

  pin.lock = true;

  try {

    pin.status = "used";
    pin.usedBy = userId;
    pin.usedAt = Date.now();
    pin.lock = false;

    savePins(pins);

    logPinAction({
      action: "PIN_USE",
      pinId,
      toId: userId,
      performedBy: userId,
      amount: pin.amount,
      bv: pin.bv,
      gst: pin.gst,
      status: "success"
    });

    return pin;

  } catch (err) {
    pin.lock = false;
    savePins(pins);
    throw err;
  }
}

// ================= GET PINS =================
function getPinsByOwner(ownerId) {
  return loadPins().filter(p => p.ownerId === ownerId);
}

// ================= DELETE PIN =================
function deletePin(pinId, performedBy) {

  let pins = loadPins();
  let index = pins.findIndex(p => p.pinId === pinId);

  if (index === -1) throw new Error("PIN not found");

  let pin = pins[index];

  if (
    pin.status !== "active" ||
    pin.ownerType !== "admin" ||
    pin.assignedTo !== null ||
    pin.usedBy !== null
  ) {
    throw new Error("PIN cannot be deleted");
  }

  pins.splice(index, 1);
  savePins(pins);

  logPinAction({
    action: "PIN_DELETE",
    pinId,
    performedBy,
    status: "success"
  });

  return true;
}

// ================= UPDATE STATUS (FINAL SAFE) =================
function updatePinStatus(pinId, status, performedBy) {

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("PIN not found");

  if (pin.lock) {
    throw new Error("PIN is locked / processing");
  }

  const VALID_STATUS = ["active", "assigned", "used"];
  if (!VALID_STATUS.includes(status)) {
    throw new Error("Invalid PIN status");
  }

  let mode = getPinMode();
  if (mode === "OFF") {
    throw new Error("PIN system is disabled");
  }

  let oldStatus = pin.status;

  pin.status = status;

  savePins(pins);

  logPinAction({
    action: "PIN_STATUS_UPDATE",
    pinId,
    performedBy,
    from: oldStatus,
    to: status,
    status: "success"
  });

  return true;
}


