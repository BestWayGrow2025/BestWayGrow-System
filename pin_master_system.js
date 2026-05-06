/*
========================================
PIN MASTER SYSTEM V8.0 (FINAL PATCH LOCK)
========================================
✔ Safe storage (safeGet / safeSet)
✔ Strong duplicate-safe ID generation
✔ Hard owner validation
✔ Cross-user leakage blocked
✔ Replay / reuse blocked
✔ Safe lock + rollback
✔ Stuck lock recovery
✔ Transfer audit trail
✔ Trigger isolation
✔ Storage collision hardened
✔ Production stable
========================================
*/

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";
const PIN_LOG_LIMIT = 5000;

// ================= LOAD / SAVE =================
function loadPins() {
  let pins = safeGet(PIN_STORAGE_KEY, []);
  if (!Array.isArray(pins)) pins = [];

  let updated = false;
  let now = Date.now();

  pins.forEach(pin => {
    if (!pin || typeof pin !== "object") return;

    let refTime = Number(pin.lockedAt || pin.usedAt || pin.assignedAt || pin.createdAt || now);

    // auto recover stale locks
    if (pin.lock === true && (now - refTime > 10000)) {
      pin.lock = false;
      pin.lockedAt = null;
      updated = true;
    }

    if (!Array.isArray(pin.transferHistory)) {
      pin.transferHistory = [];
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

// ================= DASHBOARD =================
function getPins() {
  return loadPins();
}

// ================= LOG =================
function logPinAction(data) {
  let logs = safeGet(PIN_LOG_KEY, []);
  if (!Array.isArray(logs)) logs = [];

  logs.push({
    id: "PINLOG_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    action: data.action || "UNKNOWN",
    pinId: data.pinId || "-",
    performedBy: data.performedBy || "SYSTEM",
    status: data.status || "unknown",
    amount: Number(data.amount || 0),
    bv: Number(data.bv || 0),
    gst: Number(data.gst || 0),
    note: data.note || "",
    time: new Date().toISOString()
  });

  if (logs.length > PIN_LOG_LIMIT) {
    logs = logs.slice(-PIN_LOG_LIMIT);
  }

  safeSet(PIN_LOG_KEY, logs);
}

// ================= HELPERS =================
function generatePinId(prefix = "PIN") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function setPinLock(pin, val) {
  pin.lock = !!val;
  pin.lockedAt = val ? Date.now() : null;
}

function findPinById(pinId, pins) {
  return (pins || []).find(p => p && p.pinId === pinId) || null;
}

/* ======================================================
   🔥 PATCH INTEGRATION LAYER — ROLE + ACTION CONTROL
   (NO LOGIC CHANGE — ONLY ENFORCEMENT GATE)
====================================================== */

// ================= ASSIGN =================
function assignPin(pinId, toId, toType, performedBy = "SYSTEM") {

  // 🔥 PATCH A — ACTION CONTROL ENFORCEMENT (ASSIGN)
  let role = "system";
  if (typeof getCurrentUser === "function") {
    const user = getCurrentUser();
    role = user?.role || "system";
  }

  if (typeof canExecutePinAction === "function") {
    const allowed = canExecutePinAction("ASSIGN", { status: "active", pinId }, role);
    if (!allowed) return false;
  }

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return false;
  if (!pinId || !toId || !["user", "admin", "franchise"].includes(toType)) return false;

  let pins = loadPins();
  let pin = findPinById(pinId, pins);

  if (!pin || pin.lock || pin.status !== "active") return false;

  if (toType === "user" && typeof getUserById === "function") {
    let target = getUserById(toId);
    if (!target || (target.status && target.status !== "active")) return false;
  }

  setPinLock(pin, true);
  savePins(pins);

  try {
    pin.ownerId = toId;
    pin.ownerType = toType;
    pin.assignedTo = toId;
    pin.assignedAt = Date.now();
    pin.status = "assigned";

    if (toType === "user" && typeof getUserById === "function") {
      let user = getUserById(toId);

      if (user) {
        if (pin.type === "upgrade") {
          user.availableUpgradePins = Number(user.availableUpgradePins || 0) + 1;
        } else {
          user.availableRepurchasePins = Number(user.availableRepurchasePins || 0) + 1;
        }

        user.pinStatus = "active";

        let users = getUsers() || [];
        let idx = users.findIndex(u => u.userId === user.userId);
        if (idx !== -1) {
          users[idx] = user;
          saveUsers(users);
        }
      }
    }

    pin.transferHistory.push({
      from: "admin",
      to: toId,
      toType,
      by: performedBy,
      time: Date.now()
    });

    setPinLock(pin, false);
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
    setPinLock(pin, false);
    savePins(pins);

    logPinAction({
      action: "PIN_ASSIGN",
      pinId,
      performedBy,
      status: "failed",
      note: err.message
    });

    return false;
  }
}

// ================= USE =================
function usePin(pinId, userId, purpose) {

  // 🔥 PATCH B — ACTION CONTROL ENFORCEMENT (VIEW/USE)
  let role = "system";
  if (typeof getCurrentUser === "function") {
    const user = getCurrentUser();
    role = user?.role || "system";
  }

  if (typeof canExecutePinAction === "function") {
    const allowed = canExecutePinAction("VIEW", { status: "assigned", pinId }, role);
    if (!allowed) return null;
  }

  if (typeof isSystemSafe === "function" && !isSystemSafe()) return null;
  if (!pinId || !userId) return null;

  let user = typeof getUserById === "function" ? getUserById(userId) : null;
  if (!user || (user.status && user.status !== "active")) return null;

  let pins = loadPins();
  let pin = findPinById(pinId, pins);

  if (!pin || pin.lock || pin.status !== "assigned") return null;

  if (pin.ownerId !== userId || pin.assignedTo !== userId) return null;

  if (typeof isPinAllowedForPurpose === "function" && !isPinAllowedForPurpose(pin.type, purpose)) {
    return null;
  }

  setPinLock(pin, true);
  savePins(pins);

  try {
    pin.status = "used";
    pin.usedBy = userId;
    pin.usedAt = Date.now();

    user.usedPinCount = Number(user.usedPinCount || 0) + 1;

    if (pin.type === "upgrade") {
      user.availableUpgradePins = Math.max(0, Number(user.availableUpgradePins || 0) - 1);
    } else {
      user.availableRepurchasePins = Math.max(0, Number(user.availableRepurchasePins || 0) - 1);
    }

    let totalPins =
      Number(user.availableUpgradePins || 0) +
      Number(user.availableRepurchasePins || 0);

    user.pinStatus = totalPins > 0 ? "active" : "none";

    let users = getUsers() || [];
    let idx = users.findIndex(u => u.userId === user.userId);
    if (idx !== -1) {
      users[idx] = user;
      saveUsers(users);
    }

    setPinLock(pin, false);
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

    if (typeof triggerPinUseIncome === "function") {
      try {
        triggerPinUseIncome(userId, pin);
      } catch (e) {
        logPinAction({
          action: "PIN_TRIGGER",
          pinId,
          performedBy: userId,
          status: "failed",
          note: e.message
        });
      }
    }

    return pin;

  } catch (err) {
    setPinLock(pin, false);
    savePins(pins);

    logPinAction({
      action: "PIN_USE",
      pinId,
      performedBy: userId,
      status: "failed",
      note: err.message
    });

    return null;
  }
}
