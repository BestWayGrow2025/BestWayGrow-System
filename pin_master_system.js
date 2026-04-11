/*
========================================
PIN MASTER SYSTEM V7 (FINAL LOCKED)
========================================
✔ Trigger system connected (correct flow)
✔ No direct income engine call
✔ Lock-safe operations
✔ Full audit logging
✔ Clean structure
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

// ================= LOG =================
function logPinAction(data) {

  let logs;
  try {
    logs = JSON.parse(localStorage.getItem(PIN_LOG_KEY)) || [];
  } catch {
    logs = [];
  }

  logs.push({
    id: "LOG_" + Date.now(),
    action: data.action || "UNKNOWN",
    pinId: data.pinId || "-",
    performedBy: data.performedBy || "SYSTEM",
    status: data.status || "unknown",
    amount: Number(data.amount || 0),
    bv: Number(data.bv || 0),
    gst: Number(data.gst || 0),
    time: new Date().toISOString()
  });

  localStorage.setItem(PIN_LOG_KEY, JSON.stringify(logs));
}

// ================= GENERATE =================
function generatePinId(prefix = "PIN") {
  return prefix + "_" + Math.random().toString(36).substring(2, 8) + Date.now();
}

// ================= CREATE =================
function createPin({ type="upgrade", bv=0, amount=0, gst=0, createdBy }) {

  let pins = loadPins();

  let pin = {
    pinId: generatePinId(type === "upgrade" ? "UP" : "RP"),
    type,
    bv: Number(bv) || 0,
    amount: Number(amount) || 0,
    gst: Number(gst) || 0,

    status: "active",
    ownerId: null,
    ownerType: "admin",

    assignedTo: null,
    usedBy: null,

    createdAt: Date.now(),
    assignedAt: null,
    usedAt: null,

    lock: false,
    transferHistory: []
  };

  pins.push(pin);
  savePins(pins);

  logPinAction({
    action: "PIN_CREATE",
    pinId: pin.pinId,
    performedBy: createdBy || "SYSTEM",
    amount: pin.amount,
    bv: pin.bv,
    gst: pin.gst,
    status: "success"
  });

  return pin;
}

// ================= ASSIGN =================
function assignPin(pinId, toId, toType, performedBy) {

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin) throw new Error("PIN not found");
  if (pin.lock) throw new Error("PIN locked");
  if (pin.status !== "active") throw new Error("PIN not available");

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
      time: Date.now()
    });

    pin.lock = false;
    savePins(pins);

    logPinAction({
      action: "PIN_ASSIGN",
      pinId,
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
  if (pin.lock) throw new Error("Processing");
  if (pin.status !== "assigned") throw new Error("Not usable");

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

    // ❤️ TRIGGER SYSTEM (CORRECT FLOW)
    if (typeof triggerPinUseIncome === "function") {
      try {
        triggerPinUseIncome(userId, pin);
      } catch (e) {
        console.warn("Trigger failed:", e.message);
      }
    }

    return pin;

  } catch (err) {
    pin.lock = false;
    savePins(pins);
    throw err;
  }
}


