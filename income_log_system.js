/*
========================================
INCOME LOG SYSTEM V7.2 (ULTIMATE FINAL)
========================================
✔ Core aligned (safeGet / safeSet)
✔ Strong duplicate protection (hash-based)
✔ System lock protected
✔ Memory safe (auto trim)
✔ Error safe (no crash)
✔ Hold system optional
✔ Production locked
========================================
*/

// ===============================
// 🔹 LIMIT
// ===============================
const INCOME_LOG_LIMIT = 5000;

// ===============================
// 🔹 GET LOGS
// ===============================
function getIncomeLogs() {

  let logs = safeGet("incomeLogs", []);

  if (!Array.isArray(logs)) logs = [];

  return logs;
}

// ===============================
// 🔹 SAVE LOGS
// ===============================
function saveIncomeLogs(logs) {

  if (!Array.isArray(logs)) logs = [];

  // 🔥 AUTO TRIM
  if (logs.length > INCOME_LOG_LIMIT) {
    logs = logs.slice(-INCOME_LOG_LIMIT);
  }

  safeSet("incomeLogs", logs);
}

// ===============================
// 🔹 UNIQUE KEY GENERATOR
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
// 🔹 ADD LOG (CORE ENTRY)
// ===============================
function addIncomeLog(data) {

  try {

    if (!data || !data.userId) return false;

    // 🔒 SYSTEM LOCK
    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) return false;
    }

    let amount = Number(data.amount);

    if (isNaN(amount) || amount <= 0) return false;

    let logs = getIncomeLogs();

    // 🔒 STRONG DUPLICATE PROTECTION
    let uniqueKey = generateIncomeKey(data);

    let exists = logs.some(l => l.uniqueKey === uniqueKey);

    if (exists) return false;

    // ✅ SAFE LOG
    let newLog = {
      logId: "LOG_" + Date.now(),

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
    // 🔥 HOLD SYSTEM (OPTIONAL)
    // ===============================
    try {

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

      addCriticalIncomeLog("Hold sync failed: " + err.message);

    }

    return true;

  } catch (err) {

    addCriticalIncomeLog("addIncomeLog error: " + err.message);
    return false;
  }
}

// ===============================
// 🔹 GET USER LOGS
// ===============================
function getUserIncomeLogs(userId) {

  if (!userId) return [];

  return getIncomeLogs().filter(l => l.userId === userId);
}

// ===============================
// 🔹 FILTER LOGS
// ===============================
function filterIncomeLogs({ userId, type }) {

  let logs = getIncomeLogs();

  if (userId) {
    logs = logs.filter(l => l.userId === userId);
  }

  if (type) {
    logs = logs.filter(l => l.type === type);
  }

  return logs;
}

// ===============================
// 🔹 CLEAR LOGS (ADMIN)
// ===============================
function clearIncomeLogs() {
  safeSet("incomeLogs", []);
}

// ===============================
// 🔹 CRITICAL LOG
// ===============================
function addCriticalIncomeLog(message) {

  if (!message) return;

  let logs = safeGet("incomeCriticalLogs", []);

  if (!Array.isArray(logs)) logs = [];

  logs.push({
    id: "CRITICAL_" + Date.now(),
    message,
    time: new Date().toISOString()
  });

  // 🔥 LIMIT
  if (logs.length > 1000) {
    logs = logs.slice(-1000);
  }

  safeSet("incomeCriticalLogs", logs);
}


