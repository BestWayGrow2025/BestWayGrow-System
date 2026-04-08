/*
========================================
INCOME LOG SYSTEM (ENTERPRISE FINAL v5)
========================================
✔ No undefined values
✔ Memory safe
✔ Duplicate protected
✔ Wallet + Hold sync
✔ Safe fallback values
✔ Consistent data structure
✔ Production ready
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
  try {
    return JSON.parse(localStorage.getItem("incomeLogs") || "[]");
  } catch {
    localStorage.setItem("incomeLogs", "[]");
    return [];
  }
}

// ===============================
// 🔹 SAVE LOGS
// ===============================
function saveIncomeLogs(logs) {

  if (!Array.isArray(logs)) logs = [];

  if (logs.length > INCOME_LOG_LIMIT) {
    logs = logs.slice(-INCOME_LOG_LIMIT);
  }

  localStorage.setItem("incomeLogs", JSON.stringify(logs));
}

// ===============================
// 🔹 ADD LOG (CORE ENTRY POINT)
// ===============================
function addIncomeLog(data) {

  if (!data || !data.userId) return;

  let amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) return;

  let logs = getIncomeLogs();

  // 🔒 DUPLICATE PROTECTION
  let exists = logs.some(l =>
    l.userId === data.userId &&
    Number(l.amount) === amount &&
    l.type === data.type &&
    Math.abs(new Date() - new Date(l.time)) < 3000
  );

  if (exists) return;

  // ✅ SAFE LOG (NO UNDEFINED)
  let newLog = {
    logId: "LOG_" + Date.now(),

    userId: data.userId || "UNKNOWN",
    type: data.type || "unknown",

    amount: parseFloat(amount.toFixed(2)),

    sourceUser: data.sourceUser || "-",
    note: data.note || "",

    time: new Date().toISOString()
  };

  logs.push(newLog);
  saveIncomeLogs(logs);

  // ===============================
  // 🔥 AUTO SYNC (SAFE)
  // ===============================
  try {

    if (typeof creditWallet === "function") {

      // 🔒 HOLD CHECK
      if (typeof isUserActive === "function" && !isUserActive(data.userId)) {

        if (typeof addHoldIncome === "function") {
          addHoldIncome(
            newLog.userId,
            newLog.amount,
            newLog.type
          );
        }

      } else {

        creditWallet(
          newLog.userId,
          newLog.amount,
          newLog.type
        );

      }
    }

  } catch (err) {

    addCriticalIncomeLog("Wallet sync failed: " + err.message);

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
  localStorage.setItem("incomeLogs", "[]");
}

// ===============================
// 🔹 CRITICAL LOG
// ===============================
function addCriticalIncomeLog(message) {

  if (!message) return;

  let key = "incomeCriticalLogs";
  let logs;

  try {
    logs = JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    logs = [];
  }

  logs.push({
    id: "CRITICAL_" + Date.now(),
    message,
    time: new Date().toISOString()
  });

  if (logs.length > 1000) {
    logs = logs.slice(-1000);
  }

  localStorage.setItem(key, JSON.stringify(logs));
}

