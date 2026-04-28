/*
========================================
INCOME LOG SYSTEM V8.0 (FINAL CORE PATCH)
========================================
✔ Core aligned (safeGet / safeSet)
✔ Time-window duplicate protection
✔ Replay-safe logging
✔ Hold recursion blocked
✔ Synthetic payout skip guard
✔ Critical log crash guard
✔ Memory safe (auto trim)
✔ Error safe (no crash)
✔ Production LOCKED
========================================
*/

// ===============================
// LIMIT
// ===============================
const INCOME_LOG_LIMIT = 5000;

// ===============================
// GET LOGS
// ===============================
function getIncomeLogs() {
  let logs = safeGet("incomeLogs", []);
  if (!Array.isArray(logs)) logs = [];
  return logs;
}

// ===============================
// SAVE LOGS
// ===============================
function saveIncomeLogs(logs) {
  if (!Array.isArray(logs)) logs = [];

  if (logs.length > INCOME_LOG_LIMIT) {
    logs = logs.slice(-INCOME_LOG_LIMIT);
  }

  safeSet("incomeLogs", logs);
}

// ===============================
// UNIQUE KEY
// ===============================
function generateIncomeKey(data) {
  return [
    data.userId,
    data.type,
    Number(data.amount).toFixed(2),
    data.sourceUser || "-",
    data.note || "-"
  ].join("|");
}

// ===============================
// ADD LOG
// ===============================
function addIncomeLog(data) {
  try {
    if (!data || !data.userId) return false;

    if (typeof isSystemSafe === "function" && !isSystemSafe()) {
      return false;
    }

    let amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) return false;

    let logs = getIncomeLogs();
    let uniqueKey = generateIncomeKey(data);
    let now = Date.now();

    // replay-safe duplicate block (time-window only)
    let exists = logs.some(l =>
      l.uniqueKey === uniqueKey &&
      (now - new Date(l.time).getTime()) < 10000
    );

    if (exists) return false;

    let newLog = {
      logId: "LOG_" + Date.now() + "_" + Math.floor(Math.random() * 10000),

      userId: data.userId || "UNKNOWN",
      type: data.type || "unknown",
      amount: parseFloat(amount.toFixed(2)),

      sourceUser: data.sourceUser || "-",
      note: data.note || "",

      uniqueKey,
      time: new Date().toISOString()
    };

    logs.push(newLog);
    saveIncomeLogs(logs);

    // ===============================
    // HOLD SYNC (OPTIONAL / SAFE)
    // ===============================
    try {
      const HOLD_SKIP_TYPES = ["hold_release", "ctor"];

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
        if (!isUserActive(newLog.userId)) {
          addHoldIncome(
            newLog.userId,
            newLog.amount,
            newLog.type
          );
        }
      }

    } catch (err) {
      try {
        addCriticalIncomeLog("Hold sync failed: " + err.message);
      } catch (_) {}
    }

    return true;

  } catch (err) {
    try {
      addCriticalIncomeLog("addIncomeLog error: " + err.message);
    } catch (_) {}

    return false;
  }
}

// ===============================
// GET USER LOGS
// ===============================
function getUserIncomeLogs(userId) {
  if (!userId) return [];
  return getIncomeLogs().filter(l => l.userId === userId);
}

// ===============================
// FILTER LOGS
// ===============================
function filterIncomeLogs({ userId, type }) {
  let logs = getIncomeLogs();

  if (userId) logs = logs.filter(l => l.userId === userId);
  if (type) logs = logs.filter(l => l.type === type);

  return logs;
}

// ===============================
// CLEAR LOGS
// ===============================
function clearIncomeLogs() {
  safeSet("incomeLogs", []);
}

// ===============================
// CRITICAL LOG
// ===============================
function addCriticalIncomeLog(message) {
  if (!message) return;

  let logs = safeGet("incomeCriticalLogs", []);
  if (!Array.isArray(logs)) logs = [];

  logs.push({
    id: "CRITICAL_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    message,
    time: new Date().toISOString()
  });

  if (logs.length > 1000) {
    logs = logs.slice(-1000);
  }

  safeSet("incomeCriticalLogs", logs);
}
