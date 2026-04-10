/*
========================================
INCOME LOG SYSTEM V7 (LOCKED)
========================================
✔ Pure logging system (NO wallet credit)
✔ Duplicate protected
✔ Memory safe
✔ Type normalized
✔ System lock safe
✔ Income control safe
✔ Hold system ready (optional)
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
// 🔹 TYPE NORMALIZER
// ===============================
function normalizeIncomeType(type) {

  if (!type) return "unknown";

  type = String(type).toLowerCase();

  if (type === "upgrade") return "ugli";
  if (type === "repurchase") return "rli";

  return type;
}

// ===============================
// 🔹 ADD LOG (CORE ENTRY)
// ===============================
function addIncomeLog(data) {

  if (!data || !data.userId) return;

  let amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) return;

  // 🔒 SYSTEM LOCK
  if (typeof getSystemSettings === "function") {
    let sys = getSystemSettings();
    if (sys && sys.lockMode) return;
  }

  // 🔒 INCOME CONTROL
  if (typeof isIncomeAllowed === "function") {
    if (!isIncomeAllowed(data.type)) return;
  }

  let logs = getIncomeLogs();

  let type = normalizeIncomeType(data.type);

  // 🔒 DUPLICATE PROTECTION
  let exists = logs.some(l =>
    l.userId === data.userId &&
    Number(l.amount) === amount &&
    l.type === type &&
    Math.abs(new Date() - new Date(l.time)) < 3000
  );

  if (exists) return;

  // ✅ SAFE LOG
  let newLog = {
    logId: "LOG_" + Date.now(),

    userId: data.userId || "UNKNOWN",
    type: type,

    amount: parseFloat(amount.toFixed(2)),

    sourceUser: data.sourceUser || "-",
    note: data.note || "",

    time: new Date().toISOString()
  };

  logs.push(newLog);
  saveIncomeLogs(logs);

  // ===============================
  // 🔥 HOLD SYSTEM (OPTIONAL ONLY)
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
    type = normalizeIncomeType(type);
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

