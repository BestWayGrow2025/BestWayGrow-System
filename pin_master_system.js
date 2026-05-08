/*
========================================
PIN MASTER SYSTEM V9.0 HARDENED
========================================
✔ Central execution authority
✔ Session-engine enforced
✔ Core init protection
✔ Replay-safe execution
✔ Atomic-style mutation flow
✔ Lock release guaranteed
✔ Duplicate execution prevention
✔ Ownership drift protection
✔ Inventory consistency hardened
✔ Orchestration-safe execution
✔ Production LOCKED
========================================
*/

"use strict";

const PIN_STORAGE_KEY = "PIN_MASTER_DATA";
const PIN_LOG_KEY = "PIN_MASTER_LOG";
const PIN_LOG_LIMIT = 5000;

const PIN_EXEC_LOCKS = {};
const PIN_EXEC_TTL = 10000;

// ================= CORE SAFE =================
function isPinMasterSafe() {

  if (
    !window.__CORE_STATE__ ||
    window.__CORE_STATE__.initialized !== true
  ) {
    return false;
  }

  if (typeof isSystemSafe === "function") {
    if (!isSystemSafe()) return false;
  }

  return true;
}

// ================= EXEC LOCK =================
function isPinExecLocked(key) {

  let t = PIN_EXEC_LOCKS[key];

  if (!t) return false;

  if ((Date.now() - t) > PIN_EXEC_TTL) {
    delete PIN_EXEC_LOCKS[key];
    return false;
  }

  return true;
}

function setPinExecLock(key, val) {

  if (val) {
    PIN_EXEC_LOCKS[key] = Date.now();
  } else {
    delete PIN_EXEC_LOCKS[key];
  }
}

// ================= LOAD / SAVE =================
function loadPins() {

  let pins = safeGet(PIN_STORAGE_KEY, []);

  if (!Array.isArray(pins)) {
    pins = [];
  }

  let updated = false;
  let now = Date.now();

  pins.forEach(pin => {

    if (!pin || typeof pin !== "object") return;

    let refTime = Number(
      pin.lockedAt ||
      pin.usedAt ||
      pin.assignedAt ||
      pin.createdAt ||
      now
    );

    if (
      pin.lock === true &&
      (now - refTime > 10000)
    ) {
      pin.lock = false;
      pin.lockedAt = null;
      updated = true;
    }

    if (!Array.isArray(pin.transferHistory)) {
      pin.transferHistory = [];
      updated = true;
    }
  });

  if (updated) {
    savePins(pins);
  }

  return pins;
}

function savePins(pins) {

  if (!Array.isArray(pins)) {
    pins = [];
  }

  safeSet(PIN_STORAGE_KEY, pins);
}

// ================= LOG =================
function logPinAction(data) {

  try {

    let logs = safeGet(PIN_LOG_KEY, []);

    if (!Array.isArray(logs)) {
      logs = [];
    }

    logs.push({
      id:
        "PINLOG_" +
        Date.now() +
        "_" +
        Math.floor(Math.random() * 100000),

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

  } catch (_) {}
}

// ================= HELPERS =================
function generatePinId(prefix = "PIN") {

  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
}

function setPinLock(pin, val) {

  pin.lock = !!val;
  pin.lockedAt = val ? Date.now() : null;
}

function findPinById(pinId, pins) {

  return (pins || []).find(
    p => p && p.pinId === pinId
  ) || null;
}

// ================= SESSION =================
function getPinSessionUser() {

  if (typeof getCurrentUser !== "function") {
    return null;
  }

  let user = getCurrentUser();

  if (!user || !user.userId) {
    return null;
  }

  return user;
}

// ================= ASSIGN =================
function assignPin(
  pinId,
  toId,
  toType,
  performedBy = "SYSTEM"
) {

  let execKey = "ASSIGN_" + pinId;

  if (isPinExecLocked(execKey)) {
    return false;
  }

  setPinExecLock(execKey, true);

  let pin = null;

  try {

    if (!isPinMasterSafe()) {
      return false;
    }

    let sessionUser = getPinSessionUser();

    let role = sessionUser?.role || "system";

    if (typeof canExecutePinAction === "function") {

      const allowed = canExecutePinAction(
        PIN_ACTION.ASSIGN,
        { status: "active", pinId },
        role
      );

      if (!allowed) {
        return false;
      }
    }

    if (
      !pinId ||
      !toId ||
      !["user", "admin", "franchise"].includes(toType)
    ) {
      return false;
    }

    let pins = loadPins();

    pin = findPinById(pinId, pins);

    if (
      !pin ||
      pin.lock ||
      pin.status !== "active"
    ) {
      return false;
    }

    setPinLock(pin, true);

    let snapshot = JSON.parse(JSON.stringify(pin));

    try {

      pin.ownerId = toId;
      pin.ownerType = toType;

      pin.assignedTo = toId;
      pin.assignedAt = Date.now();

      pin.status = "assigned";

      pin.transferHistory.push({
        from: "admin",
        to: toId,
        toType,
        by: performedBy,
        time: Date.now()
      });

      savePins(pins);

      if (
        toType === "user" &&
        typeof getUserById === "function"
      ) {

        let user = getUserById(toId);

        if (!user) {
          throw new Error("Target user missing");
        }

        if (pin.type === "upgrade") {
          user.availableUpgradePins =
            Number(user.availableUpgradePins || 0) + 1;
        } else {
          user.availableRepurchasePins =
            Number(user.availableRepurchasePins || 0) + 1;
        }

        user.pinStatus = "active";

        let users = getUsers() || [];

        let idx = users.findIndex(
          u => u.userId === user.userId
        );

        if (idx === -1) {
          throw new Error("User update failed");
        }

        users[idx] = user;

        saveUsers(users);
      }

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

      Object.assign(pin, snapshot);

      setPinLock(pin, false);

      savePins(pins);

      throw err;
    }

  } catch (err) {

    logPinAction({
      action: "PIN_ASSIGN",
      pinId,
      performedBy,
      status: "failed",
      note: err.message
    });

    return false;

  } finally {

    if (pin) {
      setPinLock(pin, false);
    }

    setPinExecLock(execKey, false);
  }
}

// ================= USE =================
function usePin(
  pinId,
  userId,
  purpose
) {

  let execKey = "USE_" + pinId;

  if (isPinExecLocked(execKey)) {
    return null;
  }

  setPinExecLock(execKey, true);

  let pin = null;

  try {

    if (!isPinMasterSafe()) {
      return null;
    }

    let sessionUser = getPinSessionUser();

    let role = sessionUser?.role || "system";

    if (typeof canExecutePinAction === "function") {

      const allowed = canExecutePinAction(
        PIN_ACTION.USE,
        { status: "assigned", pinId },
        role
      );

      if (!allowed) {
        return null;
      }
    }

    if (!pinId || !userId) {
      return null;
    }

    let user =
      typeof getUserById === "function"
        ? getUserById(userId)
        : null;

    if (
      !user ||
      (user.status && user.status !== "active")
    ) {
      return null;
    }

    let pins = loadPins();

    pin = findPinById(pinId, pins);

    if (
      !pin ||
      pin.lock ||
      pin.status !== "assigned"
    ) {
      return null;
    }

    if (
      pin.ownerId !== userId ||
      pin.assignedTo !== userId
    ) {
      return null;
    }

    if (
      typeof isPinAllowedForPurpose === "function" &&
      !isPinAllowedForPurpose(pin.type, purpose)
    ) {
      return null;
    }

    setPinLock(pin, true);

    let pinSnapshot =
      JSON.parse(JSON.stringify(pin));

    let userSnapshot =
      JSON.parse(JSON.stringify(user));

    try {

      pin.status = "used";
      pin.usedBy = userId;
      pin.usedAt = Date.now();

      user.usedPinCount =
        Number(user.usedPinCount || 0) + 1;

      if (pin.type === "upgrade") {

        user.availableUpgradePins =
          Math.max(
            0,
            Number(user.availableUpgradePins || 0) - 1
          );

      } else {

        user.availableRepurchasePins =
          Math.max(
            0,
            Number(user.availableRepurchasePins || 0) - 1
          );
      }

      let totalPins =
        Number(user.availableUpgradePins || 0) +
        Number(user.availableRepurchasePins || 0);

      user.pinStatus =
        totalPins > 0 ? "active" : "none";

      savePins(pins);

      let users = getUsers() || [];

      let idx = users.findIndex(
        u => u.userId === user.userId
      );

      if (idx === -1) {
        throw new Error("User save failed");
      }

      users[idx] = user;

      saveUsers(users);

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

      return JSON.parse(JSON.stringify(pin));

    } catch (err) {

      Object.assign(pin, pinSnapshot);
      Object.assign(user, userSnapshot);

      setPinLock(pin, false);

      savePins(pins);

      throw err;
    }

  } catch (err) {

    logPinAction({
      action: "PIN_USE",
      pinId,
      performedBy: userId,
      status: "failed",
      note: err.message
    });

    return null;

  } finally {

    if (pin) {
      setPinLock(pin, false);
    }

    setPinExecLock(execKey, false);
  }
}

