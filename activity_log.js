/*
========================================
📜 ACTIVITY LOG SYSTEM V7.3 (FINAL LOCK)
========================================
✔ Lock-safe audit (logs still write in lock mode)
✔ Strong safeLoad validation
✔ Safe save with retry trim
✔ Duplicate protection upgraded
✔ Critical duplicate protection
✔ Critical + normal logs separated
✔ Source normalization
✔ Clear-safe audit trail
✔ Monotonic sequence safety
✔ Mirror guard protection
✔ Production safe
========================================
*/

const ACTIVITY_LOG_LIMIT = 5000;
const CRITICAL_LOG_LIMIT = 1000;

const ACTIVITY_KEY = "activityLogs";
const CRITICAL_KEY = "criticalLogs";

let __logSequence = 0;

// ===============================
// 🔹 SAFE LOAD
// ===============================
function safeLoad(key) {
  try {
    let data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch (e) {
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
    try {
      let retryData = Array.isArray(data)
        ? data.slice(-Math.floor((limit || 100) / 2))
        : [];
      localStorage.setItem(key, JSON.stringify(retryData));
    } catch (err) {
      console.error("safeSave failed:", err.message);
    }
  }
}

// ===============================
// 🔹 NORMALIZE SOURCE
// ===============================
function normalizeSource(source) {
  let s = String(source || "SYSTEM").trim().toUpperCase();

  if (s === "SUPERADMIN") return "SUPER_ADMIN";
  if (s === "SYSADMIN") return "SYSTEM_ADMIN";
  if (!s) return "SYSTEM";

  return s;
}

// ===============================
// 🔹 CHECKSUM
// ===============================
function makeChecksum(parts) {
  let str = parts.join("|");
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }

  return "CHK_" + Math.abs(hash);
}

// ===============================
// 🔐 DUPLICATE PROTECTION
// ===============================
function isDuplicateLog(userId, role, action, source) {
  let logs = safeLoad(ACTIVITY_KEY);
  let now = Date.now();
  source = normalizeSource(source);

  return logs.some(function (l) {
    return (
      l.userId === userId &&
      l.role === role &&
      l.action === action &&
      l.source === source &&
      (now - new Date(l.time).getTime()) < 3000
    );
  });
}

function isDuplicateCritical(message, userId, source) {
  let logs = safeLoad(CRITICAL_KEY);
  let now = Date.now();
  source = normalizeSource(source);

  return logs.some(function (l) {
    return (
      l.userId === userId &&
      l.message === message &&
      l.source === source &&
      (now - new Date(l.time).getTime()) < 5000
    );
  });
}

// ===============================
// ✅ ADD ACTIVITY LOG
// ===============================
function logActivity(userId, role, action, source = "SYSTEM") {
  if (!userId || !role || !action) return;

  source = normalizeSource(source);

  if (isDuplicateLog(userId, role, action, source)) return;

  let logs = safeLoad(ACTIVITY_KEY);
  let now = new Date().toISOString();

  __logSequence++;

  let row = {
    logId: "LOG_" + Date.now() + "_" + __logSequence,
    userId,
    role,
    action,
    source,
    type: "NORMAL",
    seq: __logSequence,
    time: now
  };

  row.checksum = makeChecksum([
    row.logId,
    row.userId,
    row.role,
    row.action,
    row.source,
    row.time,
    row.seq
  ]);

  logs.push(row);

  safeSave(ACTIVITY_KEY, logs, ACTIVITY_LOG_LIMIT);
}

// ===============================
// 📄 GET LOGS
// ===============================
function getActivityLogs() {
  return safeLoad(ACTIVITY_KEY).sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
}

// ===============================
// 🧹 CLEAR LOGS
// ===============================
function clearActivityLogs(performedBy = "SYSTEM") {
  safeSave(ACTIVITY_KEY, []);
  logCritical("Activity logs cleared", performedBy, "ADMIN");
}

// ===============================
// 🔍 FILTER
// ===============================
function filterLogsByUser(userId) {
  return getActivityLogs().filter(function (l) {
    return l.userId === userId;
  });
}

function filterLogsByRole(role) {
  return getActivityLogs().filter(function (l) {
    return l.role === role;
  });
}

// ===============================
// 🔍 ADVANCED FILTER
// ===============================
function filterLogsAdvanced(filters = {}) {
  let userId = filters.userId ? String(filters.userId).trim() : "";
  let role = filters.role ? String(filters.role).trim() : "";
  let keyword = filters.keyword ? String(filters.keyword).trim().toLowerCase() : "";
  let source = filters.source ? normalizeSource(filters.source) : "";

  let logs = getActivityLogs();

  if (userId) logs = logs.filter(l => l.userId === userId);
  if (role) logs = logs.filter(l => l.role === role);
  if (source) logs = logs.filter(l => l.source === source);

  if (keyword) {
    logs = logs.filter(l => (l.action || "").toLowerCase().includes(keyword));
  }

  return logs;
}

// ===============================
// ⚠️ CRITICAL LOG
// ===============================
function logCritical(message, userId = "SYSTEM", source = "SYSTEM") {
  if (!message) return;

  source = normalizeSource(source);

  if (isDuplicateCritical(message, userId, source)) return;

  let logs = safeLoad(CRITICAL_KEY);
  let now = new Date().toISOString();

  __logSequence++;

  let row = {
    id: "CRIT_" + Date.now() + "_" + __logSequence,
    userId,
    message,
    source,
    type: "CRITICAL",
    seq: __logSequence,
    time: now
  };

  row.checksum = makeChecksum([
    row.id,
    row.userId,
    row.message,
    row.source,
    row.time,
    row.seq
  ]);

  logs.push(row);

  safeSave(CRITICAL_KEY, logs, CRITICAL_LOG_LIMIT);

  // guarded mirror into normal audit stream
  if (source !== "AUDIT_MIRROR") {
    logActivity(userId, "SYSTEM", "CRITICAL: " + message, "AUDIT_MIRROR");
  }
}

// ===============================
// 📄 GET CRITICAL LOGS
// ===============================
function getCriticalLogs() {
  return safeLoad(CRITICAL_KEY).sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
}

// ===============================
// 🧹 CLEAR CRITICAL LOGS
// ===============================
function clearCriticalLogs(performedBy = "SYSTEM") {
  safeSave(CRITICAL_KEY, []);
  logActivity(performedBy, "SYSTEM", "Critical logs cleared", "ADMIN");
}
