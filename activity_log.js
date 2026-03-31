// ===============================
// 📜 ACTIVITY LOG SYSTEM (FINAL PRO SAFE)
// ===============================

// 🔒 CONFIG
const ACTIVITY_LOG_LIMIT = 5000;


// ===============================
// ✅ ADD LOG
// ===============================
function logActivity(userId, role, action) {

  if (!userId || !role || !action) return;

  let logs;

  try {
    logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
  } catch {
    logs = [];
  }

  logs.push({
    logId: "LOG" + Date.now(), // 🔥 UNIQUE ID
    userId,
    role,
    action,
    time: new Date().toISOString()
  });

  // 🔒 LIMIT CONTROL
  if (logs.length > ACTIVITY_LOG_LIMIT) {
    logs = logs.slice(-ACTIVITY_LOG_LIMIT);
  }

  localStorage.setItem("activityLogs", JSON.stringify(logs));
}


// ===============================
// 📄 GET LOGS
// ===============================
function getActivityLogs() {

  try {
    return JSON.parse(localStorage.getItem("activityLogs") || "[]");
  } catch {
    return [];
  }
}


// ===============================
// 🧹 CLEAR LOGS
// ===============================
function clearActivityLogs() {

  localStorage.removeItem("activityLogs");

  if (typeof logActivity === "function") {
    logActivity("ADMIN", "SYSTEM", "Activity logs cleared");
  }
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
// 🔍 ADVANCED FILTER (NEW 🔥)
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
function logCritical(message) {

  let logs;

  try {
    logs = JSON.parse(localStorage.getItem("criticalLogs") || "[]");
  } catch {
    logs = [];
  }

  logs.push({
    id: "CRIT" + Date.now(),
    message,
    time: new Date().toISOString()
  });

  localStorage.setItem("criticalLogs", JSON.stringify(logs));
}


// ===============================
// 📄 GET CRITICAL LOGS
// ===============================
function getCriticalLogs() {

  try {
    return JSON.parse(localStorage.getItem("criticalLogs") || "[]");
  } catch {
    return [];
  }
}
