"use strict";

/*
========================================
PIN PERMISSION AUDIT LAYER V1.0
========================================
✔ Tracks all permission decisions
✔ Logs role-action validation
✔ Detects unauthorized attempts
✔ Security transparency layer
✔ Read-only audit system
✔ No execution logic
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_PERMISSION_AUDIT__) return;

  window.__PIN_PERMISSION_AUDIT__ = true;

  window.__PIN_AUDIT_LOGS__ = [];

})();

// ================= AUDIT LOGGER =================
function auditPermission(userId, role, action, result, reason = "") {

  const entry = {
    userId: userId || "UNKNOWN",
    role: role || "UNKNOWN",
    action: action || "UNKNOWN",
    result: result, // ALLOWED | DENIED
    reason: reason,
    time: Date.now()
  };

  window.__PIN_AUDIT_LOGS__.push(entry);

  console.log(
    "[PIN AUDIT]",
    role,
    action,
    "=>",
    result
  );

  // Optional event broadcast
  if (typeof broadcastPinEvent === "function") {
    broadcastPinEvent("PIN_AUDIT_LOG", entry);
  }
}

// ================= ACCESS CHECK WRAPPER =================
function auditCanExecute(role, action, allowed) {

  if (!allowed) {
    auditPermission(null, role, action, "DENIED", "ACCESS_BLOCKED");
    return false;
  }

  auditPermission(null, role, action, "ALLOWED", "");
  return true;
}

// ================= GET LOGS =================
function getAuditLogs() {
  return window.__PIN_AUDIT_LOGS__ || [];
}

// ================= CLEAR LOGS =================
function clearAuditLogs() {
  window.__PIN_AUDIT_LOGS__ = [];
}

// ================= EXPORT =================
window.auditPermission = auditPermission;
window.auditCanExecute = auditCanExecute;
window.getAuditLogs = getAuditLogs;
window.clearAuditLogs = clearAuditLogs;
