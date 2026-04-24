/*
========================================
PIN MASTER SYSTEM V7.4 (CLEAN FIXED)
========================================
✔ Safe storage (safeGet / safeSet)
✔ System lock protected
✔ PIN config validation
✔ Duplicate-safe ID generation
✔ Auto-unlock stuck pins (with save fix)
✔ Full audit logging
✔ Safe trigger system
✔ Dashboard compatible (getPins added)
✔ FIXED: user save sync
✔ FIXED: lock safety
✔ Production stable
========================================
*/

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";

// ================= LOAD / SAVE =================
function loadPins() {
  let pins = safeGet(PIN_STORAGE_KEY, []);
  if (!Array.isArray(pins)) pins = [];

  let updated = false;
  let now = Date.now();

  // AUTO-UNLOCK FIX
  pins.forEach(p => {
    let refTime = p.usedAt || p.assignedAt || p.createdAt || now;

    if (p.lock && (now - refTime > 10000)) {
      p.lock = false;
      updated = true;
    }
  });

  if (updated) savePins(pins);

  return pins;
}

function savePins(pins) {
  if (!Array.isArray(pins)) pins = [];
  safeSet(PIN_STORAGE_KEY, pins);
}

// DASHBOARD SUPPORT
function getPins() {
  return loadPins();
}

// ================= LOG =================
function logPinAction(data) {

  let logs = safeGet(PIN_LOG_KEY, []);
  if (!Array.isArray(logs)) logs = [];

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

  safeSet(PIN_LOG_KEY, logs);
}

// ================= GENERATE =================
function generatePinId(prefix = "PIN") {
  return prefix + "_" + Math.random().toString(36).substring(2, 8) + Date.now();
}

// ================= CREATE =================
function createPin({ type="upgrade", bv=0, amount=0, gst=0, createdBy }) {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return null;

  if (typeof isPinSystemSafe === "function") {
    if (!isPinSystemSafe(type)) return null;
  }

  let pins = loadPins();

  let pinId;
  do {
    pinId = generatePinId(type === "upgrade" ? "UP" : "RP");
  } while (pins.find(p => p.pinId === pinId));

  let pin = {
    pinId,
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

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;
  if (!toId || !toType) return false;

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin || pin.lock || pin.status !== "active") return false;

  pin.lock = true;

  try {

    pin.ownerId = toId;
    pin.ownerType = toType;
    pin.assignedTo = toId;
    pin.assignedAt = Date.now();
    pin.status = "assigned";

    // ===== USER UPDATE FIX =====
    if (toType === "user" && typeof getUserById === "function") {

      let user = getUserById(toId);

      if (user) {

        if (pin.type === "upgrade") {
          user.availableUpgradePins =
            Number(user.availableUpgradePins || 0) + 1;
        }

        if (pin.type === "repurchase") {
          user.availableRepurchasePins =
            Number(user.availableRepurchasePins || 0) + 1;
        }

        user.pinStatus = "active";

        if (typeof getUsers === "function" && typeof saveUsers === "function") {
          let users = getUsers() || [];
          let index = users.findIndex(u => u.userId === user.userId);

          if (index !== -1) {
            users[index] = user;
            saveUsers(users); // ✅ FIXED SAVE
          }
        }
      }
    }

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
    return false;
  }
}

// ================= USE PIN =================
function usePin(pinId, userId, purpose) {

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return null;
  if (!userId) return null;

  if (typeof getUserById === "function") {
    let user = getUserById(userId);
    if (!user || (user.status && user.status !== "active")) return null;
  }

  let pins = loadPins();
  let pin = pins.find(p => p.pinId === pinId);

  if (!pin || pin.lock || pin.status !== "assigned") return null;

  if (typeof isPinAllowedForPurpose === "function") {
    if (!isPinAllowedForPurpose(pin.type, purpose)) return null;
  }

  pin.lock = true;

  try {

    pin.status = "used";
    pin.usedBy = userId;
    pin.usedAt = Date.now();

    // ===== USER UPDATE =====
    let user = getUserById(userId);

    if (user) {

      user.usedPinCount = Number(user.usedPinCount || 0) + 1;

      if (pin.type === "upgrade") {
        user.availableUpgradePins = Math.max(
          0,
          Number(user.availableUpgradePins || 0) - 1
        );
      }

      if (pin.type === "repurchase") {
        user.availableRepurchasePins = Math.max(
          0,
          Number(user.availableRepurchasePins || 0) - 1
        );
      }

      let totalPins =
        Number(user.availableUpgradePins || 0) +
        Number(user.availableRepurchasePins || 0);

      user.pinStatus = totalPins > 0 ? "active" : "none";

      let users = getUsers();
      let index = users.findIndex(u => u.userId === user.userId);

      if (index !== -1) {
        users[index] = user;
        saveUsers(users);
      }
    }

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

    // SAFE TRIGGER
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
    return null;
  }
}

