/*
========================================
INCOME LOG SYSTEM (FINAL SAFE ENGINE v2)
========================================
✔ Memory safe
✔ Limit controlled
✔ Crash safe
✔ Clean structure
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

  // 🔒 LIMIT CONTROL
  if (logs.length > INCOME_LOG_LIMIT) {
    logs = logs.slice(-INCOME_LOG_LIMIT);
  }

  localStorage.setItem("incomeLogs", JSON.stringify(logs));
}

// ===============================
// 🔹 ADD LOG
// ===============================
function addIncomeLog(data) {

  if (!data || !data.userId) return;

  let amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) return;

  let logs = getIncomeLogs();

  logs.push({
    logId: "LOG_" + Date.now(),
    userId: data.userId,
    type: data.type || "unknown",
    amount: amount,
    sourceUser: data.sourceUser || null,
    note: data.note || "",
    time: new Date().toISOString()
  });

  saveIncomeLogs(logs);
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

  let logs = getIncomeLogs();

  logs.push({
    logId: "CRITICAL_" + Date.now(),
    userId: "SYSTEM",
    type: "critical",
    amount: 0,
    sourceUser: null,
    note: message,
    time: new Date().toISOString()
  });

  saveIncomeLogs(logs);
}
