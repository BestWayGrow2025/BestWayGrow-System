/*
========================================
INCOME LOG SYSTEM (FINAL SAFE ENGINE v3)
========================================
✔ Memory safe
✔ Limit controlled
✔ Crash safe
✔ Duplicate protected
✔ Critical logs separated
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

  // 🔒 DUPLICATE PROTECTION
  let exists = logs.some(l =>
    l.userId === data.userId &&
    Number(l.amount) === amount &&
    l.type === data.type &&
    (new Date() - new Date(l.time)) < 3000
  );

  if (exists) return;

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
// 🔹 CRITICAL LOG (SEPARATE STORAGE)
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

  // 🔒 LIMIT CONTROL (CRITICAL)
  if (logs.length > 1000) {
    logs = logs.slice(-1000);
  }

  localStorage.setItem(key, JSON.stringify(logs));
}

