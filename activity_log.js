// ===============================
// ACTIVITY LOG SYSTEM (FINAL SAFE)
// ===============================

// 🔒 CONFIG
const ACTIVITY_LOG_LIMIT = 5000; // prevent overload

// ===============================
// ✅ ADD LOG
// ===============================
function logActivity(userId, role, action) {

  if (!userId || !role || !action) return; // safety

  let logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");

  logs.push({
    userId: userId,
    role: role,
    action: action,
    time: new Date().toISOString()
  });

  // 🔒 LIMIT CONTROL
  if (logs.length > ACTIVITY_LOG_LIMIT) {
    logs = logs.slice(-ACTIVITY_LOG_LIMIT);
  }

  localStorage.setItem("activityLogs", JSON.stringify(logs));
}

// ===============================
// 📄 GET ALL LOGS
// ===============================
function getActivityLogs() {
  return JSON.parse(localStorage.getItem("activityLogs") || "[]");
}

// ===============================
// 🧹 CLEAR LOGS (ADMIN CONTROL)
// ===============================
function clearActivityLogs() {
  localStorage.removeItem("activityLogs");
}

// ===============================
// 🔍 FILTER LOGS
// ===============================
function filterLogsByUser(userId) {
  let logs = getActivityLogs();
  return logs.filter(l => l.userId === userId);
}

function filterLogsByRole(role) {
  let logs = getActivityLogs();
  return logs.filter(l => l.role === role);
}

// ===============================
// ⚠️ CRITICAL EVENT LOG
// ===============================
function logCritical(message) {

  let logs = JSON.parse(localStorage.getItem("criticalLogs") || "[]");

  logs.push({
    message: message,
    time: new Date().toISOString()
  });

  localStorage.setItem("criticalLogs", JSON.stringify(logs));
}
