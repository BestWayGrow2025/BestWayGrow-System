/*
========================================
📜 ACTIVITY LOG SYSTEM V7.1 (CLEAN LOCK)
========================================
✔ Strong safeLoad validation
✔ Duplicate protection optimized
✔ Limit controlled
✔ Critical + normal logs separated
✔ System lock safe
✔ Source tagging
✔ Clean + production stable
========================================
*/

const ACTIVITY_LOG_LIMIT = 5000;
const CRITICAL_LOG_LIMIT = 1000;

const ACTIVITY_KEY = "activityLogs";
const CRITICAL_KEY = "criticalLogs";

// ===============================
// 🔹 SAFE LOAD
// ===============================
function safeLoad(key) {
  try {
    let data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    localStorage.setItem(key, "[]");
    return [];
  }
}

// ===============================
// 🔹 SAFE SAVE
// ===============================
function safeSave(key, data, limit = null) {

  if (!Array.isArray(data)) data = [];

  if (limit && data.length > limit) {
    data = data.slice(-limit);
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("safeSave error:", e.message);
  }
}

// ===============================
// 🔐 DUPLICATE PROTECTION
// ===============================
function isDuplicateLog(userId, action) {

  let logs = safeLoad(ACTIVITY_KEY);
  let now = Date.now();

  return logs.some(l =>
    l.userId === userId &&
    l.action === action &&
    (now - new Date(l.time).getTime()) < 3000
  );
}

// ===============================
// ✅ ADD ACTIVITY LOG
// ===============================
function logActivity(userId, role, action, source = "SYSTEM") {

  if (!userId || !role || !action) return;

  // 🔒 SYSTEM LOCK
  if (typeof getSystemSettings === "function") {
    let sys = getSystemSettings();
    if (sys && sys.lockMode) return;
  }

  // 🔒 DUPLICATE BLOCK
  if (isDuplicateLog(userId, action)) return;

  let logs = safeLoad(ACTIVITY_KEY);

  logs.push({
    logId: "LOG_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    userId,
    role,
    action,
    source,
    type: "NORMAL",
    time: new Date().toISOString()
  });

  safeSave(ACTIVITY_KEY, logs, ACTIVITY_LOG_LIMIT);

  console.log("ACTIVITY:", action);
}

// ===============================
// 📄 GET LOGS
// ===============================
function getActivityLogs() {
  return safeLoad(ACTIVITY_KEY);
}

// ===============================
// 🧹 CLEAR LOGS
// ===============================
function clearActivityLogs(performedBy = "SYSTEM") {

  safeSave(ACTIVITY_KEY, []);

  // log after clearing (fresh entry)
  logActivity(performedBy, "SYSTEM", "Activity logs cleared", "ADMIN");
}

// ===============================
// 🔍 FILTER
// ===============================
function filterLogsByUser(userId) {
  return getActivityLogs().filter(l => l.userId === userId);
}

function filterLogsByRole(role) {
  return getActivityLogs().filter(l => l.role === role);
}

// ===============================
// 🔍 ADVANCED FILTER
// ===============================
function filterLogsAdvanced({ userId, role, keyword, source }) {

  let logs = getActivityLogs();

  if (userId) logs = logs.filter(l => l.userId === userId);
  if (role) logs = logs.filter(l => l.role === role);
  if (source) logs = logs.filter(l => l.source === source);

  if (keyword) {
    let k = keyword.toLowerCase();
    logs = logs.filter(l =>
      (l.action || "").toLowerCase().includes(k)
    );
  }

  return logs;
}

// ===============================
// ⚠️ CRITICAL LOG
// ===============================
function logCritical(message, userId = "SYSTEM", source = "SYSTEM") {

  if (!message) return;

  let logs = safeLoad(CRITICAL_KEY);

  logs.push({
    id: "CRIT_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
    userId,
    message,
    source,
    type: "CRITICAL",
    time: new Date().toISOString()
  });

  safeSave(CRITICAL_KEY, logs, CRITICAL_LOG_LIMIT);

  console.error("CRITICAL:", message);
}

// ===============================
// 📄 GET CRITICAL LOGS
// ===============================
function getCriticalLogs() {
  return safeLoad(CRITICAL_KEY);
}
