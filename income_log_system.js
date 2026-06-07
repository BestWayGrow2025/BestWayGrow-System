"use strict";

/*
========================================
INCOME LOG SYSTEM V9.0 (HARDENED FINAL)
========================================
✔ Core aligned (safeGet / safeSet)
✔ Replay-safe duplicate protection
✔ Hold sync duplication blocked
✔ Collision-safe log IDs
✔ Critical log crash guard
✔ Memory safe auto trim
✔ Core initialization guard
✔ Session-safe validation
✔ System lock aligned
✔ Final hardened production version
========================================
*/

// ===============================
// LIMIT
// ===============================
const INCOME_LOG_LIMIT = 5000;
const INCOME_CRITICAL_LIMIT = 1000;

// ===============================
// CORE SAFETY
// ===============================
function isIncomeLogSystemReady() {

  return !!(
    window.__CORE_STATE__ &&
    window.__CORE_STATE__.initialized
  );
}

// ===============================
// GET LOGS
// ===============================
function getIncomeLogs() {

  if (!isIncomeLogSystemReady()) {
    return [];
  }

  let logs = safeGet("incomeLogs", []);

  if (!Array.isArray(logs)) {
    logs = [];
  }

  return logs;
}

// ===============================
// SAVE LOGS
// ===============================
function saveIncomeLogs(logs) {

  if (!Array.isArray(logs)) {
    logs = [];
  }

  if (logs.length > INCOME_LOG_LIMIT) {
    logs = logs.slice(-INCOME_LOG_LIMIT);
  }

  return safeSet("incomeLogs", logs);
}

// ===============================
// UNIQUE KEY
// ===============================
function generateIncomeKey(data) {

  return [
    String(data.userId || ""),
    String(data.type || ""),
    Number(data.amount || 0).toFixed(2),
    String(data.sourceUser || "-"),
    String(data.note || "-")
  ].join("|");
}

// ===============================
// SAFE LOG ID
// ===============================
function generateIncomeLogId(prefix = "LOG") {

  return [
    prefix,
    Date.now(),
    Math.random().toString(36).slice(2, 10)
  ].join("_");
}

// ===============================
// ADD LOG
// ===============================
function addIncomeLog(data) {

  try {

    // ===============================
    // CORE CHECK
    // ===============================
    if (!isIncomeLogSystemReady()) {
      return false;
    }

    // ===============================
    // SYSTEM SAFETY
    // ===============================
    if (
      typeof isSystemSafe === "function" &&
      !isSystemSafe()
    ) {
      return false;
    }

    // ===============================
    // DATA VALIDATION
    // ===============================
    if (!data || typeof data !== "object") {
      return false;
    }

    if (!data.userId) {
      return false;
    }

    let amount = Number(data.amount);

    if (isNaN(amount) || amount <= 0) {
      return false;
    }

    amount = parseFloat(amount.toFixed(2));

    // ===============================
    // LOG LOAD
    // ===============================
    let logs = getIncomeLogs();

    let uniqueKey = generateIncomeKey({
      ...data,
      amount
    });

    let now = Date.now();

    // ===============================
    // DUPLICATE BLOCK
    // ===============================
    let exists = logs.some(l => {

      if (!l || typeof l !== "object") {
        return false;
      }

      if (l.uniqueKey !== uniqueKey) {
        return false;
      }

      let logTime =
        new Date(l.time || 0).getTime();

      if (isNaN(logTime)) {
        return false;
      }

      return (now - logTime) < 10000;
    });

    if (exists) {
      return false;
    }

    // ===============================
    // CREATE LOG
    // ===============================
    let newLog = {

      logId: generateIncomeLogId(),

      userId: String(data.userId),

      type: String(
        data.type || "unknown"
      ),

      amount,

      sourceUser: String(
        data.sourceUser || "-"
      ),

      note: String(
        data.note || ""
      ),

      uniqueKey,

      time: new Date().toISOString()
    };

    logs.push(newLog);

    // ===============================
    // SAVE
    // ===============================
    let saved = saveIncomeLogs(logs);

    if (!saved) {
      throw new Error("Income log save failed");
    }

    // ===============================
    // HOLD SYNC
    // ===============================
    try {

      if (data.skipHoldSync === true) {
        return true;
      }

      const HOLD_SKIP_TYPES = [
        "hold_release",
        "ctor"
      ];

      if (
        newLog.userId === "SYSTEM" ||
        HOLD_SKIP_TYPES.includes(newLog.type)
      ) {
        return true;
      }

      if (
        typeof isUserActive === "function" &&
        typeof addHoldIncome === "function"
      ) {

        let active =
          isUserActive(newLog.userId);

        if (active === false) {

          addHoldIncome(
            newLog.userId,
            newLog.amount,
            newLog.type
          );
        }
      }

    } catch (err) {

      try {

        addCriticalIncomeLog(
          "Hold sync failed: " +
          err.message
        );

      } catch (_) {}
    }

    return true;

  } catch (err) {

    try {

      addCriticalIncomeLog(
        "addIncomeLog error: " +
        err.message
      );

    } catch (_) {}

    return false;
  }
}

// ===============================
// GET USER LOGS
// ===============================
function getUserIncomeLogs(userId) {

  if (!userId) {
    return [];
  }

  return getIncomeLogs().filter(
    l => l.userId === userId
  );
}

// ===============================
// FILTER LOGS
// ===============================
function filterIncomeLogs({
  userId,
  type
} = {}) {

  let logs = getIncomeLogs();

  if (userId) {
    logs = logs.filter(
      l => l.userId === userId
    );
  }

  if (type) {
    logs = logs.filter(
      l => l.type === type
    );
  }

  return logs;
}

// ===============================
// CLEAR LOGS
// ===============================
function clearIncomeLogs() {

  if (
    typeof getSession === "function"
  ) {

    let session = getSession();

    if (
      !session ||
      (
        session.role !== "super_admin" &&
        session.role !== "system_admin"
      )
    ) {
      return false;
    }
  }

  return safeSet("incomeLogs", []);
}

// ===============================
// CRITICAL LOG
// ===============================
function addCriticalIncomeLog(message) {

  try {

    if (!message) {
      return false;
    }

    let logs = safeGet(
      "incomeCriticalLogs",
      []
    );

    if (!Array.isArray(logs)) {
      logs = [];
    }

    logs.push({

      id: generateIncomeLogId(
        "CRITICAL"
      ),

      message: String(message),

      time: new Date().toISOString()
    });

    if (
      logs.length > INCOME_CRITICAL_LIMIT
    ) {
      logs = logs.slice(
        -INCOME_CRITICAL_LIMIT
      );
    }

    return safeSet(
      "incomeCriticalLogs",
      logs
    );

  } catch (_) {

    return false;
  }
}

// ===============================
// READY
// ===============================

window.__INCOME_LOG_SYSTEM__ = {
  initialized: true,
  ready: true,
  timestamp: Date.now()
};

// ===============================
// EXPORTS
// ===============================

window.getIncomeLogs =
  getIncomeLogs;

window.saveIncomeLogs =
  saveIncomeLogs;

window.addIncomeLog =
  addIncomeLog;

window.getUserIncomeLogs =
  getUserIncomeLogs;

window.filterIncomeLogs =
  filterIncomeLogs;

window.clearIncomeLogs =
  clearIncomeLogs;

window.addCriticalIncomeLog =
  addCriticalIncomeLog;

window.generateIncomeLogId =
  generateIncomeLogId;

// ===============================
// HEALTH FLAG
// ===============================

window.INCOME_LOG_SYSTEM_ACTIVE = true;
