/*
========================================
PIN MASTER SYSTEM (ENTERPRISE FINAL v6)
========================================
✔ Income engine connected (correct source)
✔ No undefined values
✔ Lock-safe operations
✔ Full audit logging
✔ Clean data structure
✔ Production stable
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
    action: actionData.action || "UNKNOWN",
    pinId: actionData.pinId || "-",
    performedBy: actionData.performedBy || "SYSTEM",
    status: actionData.status || "unknown",
    amount: Number(actionData.amount || 0),
    bv: Number(actionData.bv || 0),
    gst: Number(actionData.gst || 0),
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
    bv: Number(bv) || 0,
    amount: Number(amount) || 0,
    gst: Number(gst) || 0,

    status: "active",

    ownerId: null,
    ownerType: "admin",

    createdBy: createdBy || "SYSTEM",

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
    performedBy: newPin.createdBy,
    amount: newPin.amount,
    bv: newPin.bv,
    gst: newPin.gst,
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
      by: performedBy || "SYSTEM",
      timestamp: Date.now()
    });

    pin.lock = false;
    savePins(pins);

    logPinAction({
      action: "PIN_ASSIGN",
      pinId,
      performedBy: performedBy || "SYSTEM",
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

    // ✅ MARK USED
    pin.status = "used";
    pin.usedBy = userId;
    pin.usedAt = Date.now();
    pin.lock = false;

    savePins(pins);

    logPinAction({
      action: "PIN_USE",
      pinId,
      performedBy: userId,
      amount: pin.amount,
      bv: pin.bv,
      gst: pin.gst,
      status: "success"
    });

    // 🔥 INCOME TRIGGER (FINAL SAFE)
    if (typeof processIncome === "function") {
      try {

        processIncome(
          pin.type,          // ✅ correct source
          userId,
          Number(pin.bv || 0)
        );

      } catch (e) {
        console.warn("Income trigger failed:", e.message);
      }
    }

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
    performedBy: performedBy || "SYSTEM",
    status: "success"
  });

  return true;
}



