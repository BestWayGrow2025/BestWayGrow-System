"use strict";

/*
========================================
COMPLIANCE ENFORCEMENT ENGINE V1.0
FINAL SYSTEM EXECUTION GATE (GLOBAL STOP/ALLOW CONTROLLER)
========================================
✔ Final execution approval layer
✔ Blocks unsafe financial/system actions
✔ Integrates certification + integrity + audit
✔ Prevents execution during system risk states
✔ Acts as global "ALLOW / DENY" gate
✔ Audit-ready compliance decision log
✔ Production-grade financial safety firewall
========================================
*/

const COMPLIANCE_LOG_KEY = "COMPLIANCE_ENFORCEMENT_LOG";
const COMPLIANCE_LIMIT = 1000;

// ==============================
// LOG STORAGE
// ==============================
function getComplianceLog() {
  try {
    const data = safeGet(COMPLIANCE_LOG_KEY, []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveComplianceLog(log) {
  try {
    if (!Array.isArray(log)) log = [];

    if (log.length > COMPLIANCE_LIMIT) {
      log = log.slice(-COMPLIANCE_LIMIT);
    }

    safeSet(COMPLIANCE_LOG_KEY, log);
    return true;
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("COMPLIANCE_SAVE_FAILED: " + err.message);
    }
    return false;
  }
}

// ==============================
// RECORD DECISION
// ==============================
function recordComplianceDecision(entry = {}) {
  try {
    const log = getComplianceLog();

    log.push({
      timestamp: Date.now(),
      action: entry.action || "UNKNOWN",
      approved: entry.approved === true,
      reason: entry.reason || "NONE",
      context: entry.context || {},
      systemState: {
        certified: typeof isSystemCertified === "function"
          ? isSystemCertified()
          : null,
        integrity: typeof runFinancialIntegrityCheck === "function"
          ? runFinancialIntegrityCheck()
          : null,
        replay: !!window.__SYSTEM_REPLAY_ENGINE_ACTIVE__,
        audit: !!window.__EVENT_ORCHESTRATOR_ACTIVE__
      }
    });

    return saveComplianceLog(log);
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("COMPLIANCE_RECORD_FAILED: " + err.message);
    }
    return false;
  }
}

// ==============================
// CORE SAFETY CHECKS
// ==============================
function isSystemHealthy() {
  try {
    const certified =
      typeof isSystemCertified === "function"
        ? isSystemCertified()
        : false;

    const integrityOk =
      typeof runFinancialIntegrityCheck === "function"
        ? runFinancialIntegrity

