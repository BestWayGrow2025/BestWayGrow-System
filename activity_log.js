// ===============================
// ACTIVITY LOG SYSTEM
// ===============================

function logActivity(userId, role, action) {

  let logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");

  logs.push({
    userId: userId,
    role: role,
    action: action,
    time: new Date().toISOString()
  });

  localStorage.setItem("activityLogs", JSON.stringify(logs));
}
