/*
========================================
PIN MASTER SYSTEM (FINAL CORE ENGINE PRO)
========================================
Handles:
- Create PIN
- Assign PIN
- Use PIN
- Transfer PIN
- Delete PIN (admin safe)
- Track history
- Prevent double use (lock system)
- Config system integration 🔥
========================================
*/

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";

// ================= LOAD / SAVE =================
function loadPins() {
  try {
    return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePins(pins) {
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
}

// ================= LOG SYSTEM =================
function logPinAction(actionData) {
  let logs = JSON.parse(localStorage.getItem(PIN_LOG_KEY)) || [];
  logs.push({
    id: "LOG_" + Date.now(),
    ...actionData,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(PIN_LOG_KEY, JSON.stringify(logs));
}

// ================= GENERATE UNIQUE PIN =================
function generatePinId(prefix = "PIN") {
  return (
    prefix +
    "_" +
    Math.random().toString(36).substring(2, 8) +
    Date.now()
  );
}

// ================= CONFIG LINK 🔥 =================
function getPinMode() {
  if (typeof loadSystemControls === "function") {
    return loadSystemControls().pinMode;
  }
  return "AUTO";
}

// ================= CREATE PIN =================
function createPin({ type, bv, amount, gst, createdBy }) {

  // 🔒 CONFIG SAFETY
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

  // 🔒 SYSTEM MODE CHECK
  let mode = getPinMode();
  if (mode === "OFF") {
    throw new Error("PIN system is disabled");
  }

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("PIN not found");

  if (pin.status !== "active") throw new Error("PIN not available");

  pin.ownerId = toId;
  pin.ownerType = toType;
  pin.assignedTo = toId;
  pin.assignedAt = Date.now();

  pin.transferHistory.push({
    from: "admin",
    to: toId,
    by: performedBy,
    timestamp: Date.now()
  });

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
}

// ================= USE PIN =================
function usePin(pinId, userId, purpose) {
  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("Invalid PIN");

  // 🔒 LOCK SYSTEM
  if (pin.lock) throw new Error("PIN is being processed");

  if (pin.status !== "active") throw new Error("PIN already used or invalid");

  // 🔒 CONFIG VALIDATION
  if (typeof isPinSystemSafe === "function") {
    if (!isPinSystemSafe(pin.type)) {
      throw new Error("PIN system inactive");
    }
  }

  // 🔒 TYPE RULE (CONFIG LINKED)
  if (typeof isPinAllowedForPurpose === "function") {
    if (!isPinAllowedForPurpose(pin.type, purpose)) {
      throw new Error("Invalid PIN usage");
    }
  }

  // LOCK START
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

// ================= GET PINS BY OWNER =================
function getPinsByOwner(ownerId) {
  let pins = loadPins();
  return pins.filter(p => p.ownerId === ownerId);
}

// ================= DELETE PIN =================
function deletePin(pinId, performedBy) {
  let pins = loadPins();
  let index = pins.findIndex(p => p.pinId === pinId);

  if (index === -1) throw new Error("PIN not found");

  let pin = pins[index];

  // 🔒 SAFE DELETE RULE
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

// ================= UPDATE STATUS =================
/*
========================================
PIN MASTER SYSTEM (FINAL CORE ENGINE PRO)
========================================
Handles:
- Create PIN
- Assign PIN
- Use PIN
- Transfer PIN
- Delete PIN (admin safe)
- Track history
- Prevent double use (lock system)
- Config system integration 🔥
========================================
*/

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";

// ================= LOAD / SAVE =================
function loadPins() {
  try {
    return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePins(pins) {
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
}

// ================= LOG SYSTEM =================
function logPinAction(actionData) {
  let logs = JSON.parse(localStorage.getItem(PIN_LOG_KEY)) || [];
  logs.push({
    id: "LOG_" + Date.now(),
    ...actionData,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(PIN_LOG_KEY, JSON.stringify(logs));
}

// ================= GENERATE UNIQUE PIN =================
function generatePinId(prefix = "PIN") {
  return (
    prefix +
    "_" +
    Math.random().toString(36).substring(2, 8) +
    Date.now()
  );
}

// ================= CONFIG LINK 🔥 =================
function getPinMode() {
  if (typeof loadSystemControls === "function") {
    return loadSystemControls().pinMode;
  }
  return "AUTO";
}

// ================= CREATE PIN =================
function createPin({ type, bv, amount, gst, createdBy }) {

  // 🔒 CONFIG SAFETY
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

  // 🔒 SYSTEM MODE CHECK
  let mode = getPinMode();
  if (mode === "OFF") {
    throw new Error("PIN system is disabled");
  }

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("PIN not found");

  if (pin.status !== "active") throw new Error("PIN not available");

  pin.ownerId = toId;
  pin.ownerType = toType;
  pin.assignedTo = toId;
  pin.assignedAt = Date.now();

  pin.transferHistory.push({
    from: "admin",
    to: toId,
    by: performedBy,
    timestamp: Date.now()
  });

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
}

// ================= USE PIN =================
function usePin(pinId, userId, purpose) {
  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("Invalid PIN");

  // 🔒 LOCK SYSTEM
  if (pin.lock) throw new Error("PIN is being processed");

  if (pin.status !== "active") throw new Error("PIN already used or invalid");

  // 🔒 CONFIG VALIDATION
  if (typeof isPinSystemSafe === "function") {
    if (!isPinSystemSafe(pin.type)) {
      throw new Error("PIN system inactive");
    }
  }

  // 🔒 TYPE RULE (CONFIG LINKED)
  if (typeof isPinAllowedForPurpose === "function") {
    if (!isPinAllowedForPurpose(pin.type, purpose)) {
      throw new Error("Invalid PIN usage");
    }
  }

  // LOCK START
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

// ================= GET PINS BY OWNER =================
function getPinsByOwner(ownerId) {
  let pins = loadPins();
  return pins.filter(p => p.ownerId === ownerId);
}

// ================= DELETE PIN =================
function deletePin(pinId, performedBy) {
  let pins = loadPins();
  let index = pins.findIndex(p => p.pinId === pinId);

  if (index === -1) throw new Error("PIN not found");

  let pin = pins[index];

  // 🔒 SAFE DELETE RULE
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

// ================= UPDATE STATUS =================
function updatePinStatus(pinId, status, performedBy) {
  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("PIN not found");

  pin.status = status;

  savePins(pins);

  logPinAction({
    action: "PIN_STATUS_UPDATE",
    pinId,
    performedBy,
    status
  });

  return true;
}
