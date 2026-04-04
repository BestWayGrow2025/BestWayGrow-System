// ===============================
// 📜 ACTIVITY LOG SYSTEM (FINAL ENTERPRISE)
// ===============================

const ACTIVITY_LOG_LIMIT = 5000;
const CRITICAL_LOG_LIMIT = 1000;

const ACTIVITY_KEY = "activityLogs";
const CRITICAL_KEY = "criticalLogs";

// ===============================
// 🔹 SAFE LOAD
// ===============================
function safeLoad(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    localStorage.setItem(key, "[]");
    return [];
  }
}

// ===============================
// 🔹 SAFE SAVE
// ===============================
function safeSave(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===============================
// ✅ ADD LOG
// ===============================
function logActivity(userId, role, action) {

  if (!userId || !role || !action) return;

  let logs = safeLoad(ACTIVITY_KEY);

  logs.push({
    logId: "LOG_" + Date.now(),
    userId,
    role,
    action,
    type: "NORMAL",
    time: new Date().toISOString()
  });

  if (logs.length > ACTIVITY_LOG_LIMIT) {
    logs = logs.slice(-ACTIVITY_LOG_LIMIT);
  }

  safeSave(ACTIVITY_KEY, logs);

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

  logActivity(performedBy, "SYSTEM", "Activity logs cleared");
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
function filterLogsAdvanced({ userId, role, keyword }) {

  let logs = getActivityLogs();

  if (userId) {
    logs = logs.filter(l => l.userId === userId);
  }

  if (role) {
    logs = logs.filter(l => l.role === role);
  }

  if (keyword) {
    logs = logs.filter(l =>
      (l.action || "").toLowerCase().includes(keyword.toLowerCase())
    );
  }

  return logs;
}

// ===============================
// ⚠️ CRITICAL LOG
// ===============================
function logCritical(message, userId = "SYSTEM") {

  if (!message) return;

  let logs = safeLoad(CRITICAL_KEY);

  logs.push({
    id: "CRIT_" + Date.now(),
    userId,
    message,
    type: "CRITICAL",
    time: new Date().toISOString()
  });

  // 🔒 LIMIT CONTROL (ADDED)
  if (logs.length > CRITICAL_LOG_LIMIT) {
    logs = logs.slice(-CRITICAL_LOG_LIMIT);
  }

  safeSave(CRITICAL_KEY, logs);

  console.error("CRITICAL:", message);
}

// ===============================
// 📄 GET CRITICAL LOGS
// ===============================
function getCriticalLogs() {
  return safeLoad(CRITICAL_KEY);
}
