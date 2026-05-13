"use strict";

/*
========================================
SYSTEM AUDIT TRAIL V1.0 (FINAL STABLE)
========================================
✔ Safe event binding
✔ Dashboard detection ready
✔ Retry-safe SYSTEM_EVENTS hookup
✔ Clean global exports
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_AUDIT_TRAIL__) return;

  window.__SYSTEM_AUDIT_TRAIL__ = true;

  initSystemAuditTrail();

})();

// ================= STORAGE =================
const AUDIT_STORAGE_KEY = "BWG_SYSTEM_AUDIT_TRAIL";
const AUDIT_MAX_RECORDS = 10000;

const AUDIT_SEVERITY = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL"
};

// ================= INIT =================
function initSystemAuditTrail() {

  ensureAuditStorage();

  // SAFE DELAY BIND (FIXES EVENT HUB LOAD ORDER ISSUE)
  setTimeout(bindSystemEvents, 500);

  exposeAuditAPI();

  writeAudit({
    module: "SYSTEM_AUDIT_TRAIL",
    action: "INITIALIZED",
    severity: AUDIT_SEVERITY.INFO,
    details: {
      version: "1.0",
      timestamp: Date.now()
    }
  });

  console.log("[AUDIT] INIT COMPLETE");
}

// ================= STORAGE INIT =================
function ensureAuditStorage() {

  try {
    if (!localStorage.getItem(AUDIT_STORAGE_KEY)) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([]));
    }
  } catch (err) {
    console.error("[AUDIT] STORAGE ERROR:", err);
  }
}

// ================= AUDIT WRITER =================
function writeAudit(entry) {

  try {

    const records = getAuditRecords();

    const auditRecord = {
      auditId: generateAuditId(),
      timestamp: Date.now(),
      isoTime: new Date().toISOString(),

      severity: entry.severity || AUDIT_SEVERITY.INFO,
      module: entry.module || "UNKNOWN_MODULE",
      action: entry.action || "UNKNOWN_ACTION",

      userId: entry.userId || getCurrentUserIdSafe(),
      role: entry.role || getCurrentRoleSafe(),

      source: entry.source || "SYSTEM",
      status: entry.status || "SUCCESS",

      details: entry.details || {}
    };

    records.push(auditRecord);

    while (records.length > AUDIT_MAX_RECORDS) {
      records.shift();
    }

    localStorage.setItem(
      AUDIT_STORAGE_KEY,
      JSON.stringify(records)
    );

    window.SYSTEM_EVENTS?.emit("AUDIT_LOGGED", auditRecord);

    return auditRecord;

  } catch (err) {

    console.error("[AUDIT] WRITE ERROR:", err);
    return null;
  }
}

// ================= EVENT BIND =================
function bindSystemEvents() {

  if (!window.SYSTEM_EVENTS || typeof window.SYSTEM_EVENTS.on !== "function") {
    console.warn("[AUDIT] SYSTEM_EVENTS not ready, retrying...");
    setTimeout(bindSystemEvents, 500);
    return;
  }

  const monitored = [
    "PIN_EVENT",
    "PIN_REQUEST_EVENT",
    "PIN_ROUTE_EVENT",
    "UPGRADE_EVENT",
    "WALLET_EVENT",
    "INCOME_EVENT",
    "PAYOUT_EVENT",
    "BANK_UPDATE",
    "SYSTEM_DIAGNOSTICS_COMPLETED",
    "SYSTEM_BACKUP_CREATED"
  ];

  monitored.forEach(eventName => {

    window.SYSTEM_EVENTS.on(eventName, function (data) {

      writeAudit({
        module: extractModuleName(eventName),
        action: eventName,
        severity: AUDIT_SEVERITY.INFO,
        details: sanitizeAuditData(data)
      });

    });

  });

  window.SYSTEM_EVENTS.on("SYSTEM_ERROR", function (data) {

    writeAudit({
      module: "SYSTEM",
      action: "SYSTEM_ERROR",
      severity: AUDIT_SEVERITY.ERROR,
      status: "FAILED",
      details: sanitizeAuditData(data)
    });

  });

  console.log("[AUDIT] EVENT BIND ACTIVE");
}

// ================= HELPERS =================
function extractModuleName(eventName) {
  return eventName?.split("_")[0] || "SYSTEM";
}

function sanitizeAuditData(data) {

  try {
    if (!data) return {};
    return JSON.parse(JSON.stringify(data));
  } catch (_) {
    return { note: "non-serializable" };
  }
}

function generateAuditId() {
  return "AUDIT_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getCurrentUserIdSafe() {

  try {

    if (typeof window.getCurrentUser === "function") {
      const u = window.getCurrentUser();
      if (u?.userId) return u.userId;
    }

    if (window.sessionManager?.getCurrentUser) {
      const u = window.sessionManager.getCurrentUser();
      if (u?.userId) return u.userId;
    }

  } catch (_) {}

  return "SYSTEM";
}

function getCurrentRoleSafe() {

  try {

    if (typeof window.getCurrentUser === "function") {
      const u = window.getCurrentUser();
      if (u?.role) return u.role;
    }

    if (window.sessionManager?.getCurrentUser) {
      const u = window.sessionManager.getCurrentUser();
      if (u?.role) return u.role;
    }

  } catch (_) {}

  return "SYSTEM";
}

// ================= API =================
function exposeAuditAPI() {

  window.writeAudit = writeAudit;

  window.getAuditRecords = function () {
    return getAuditRecords();
  };

  window.getAuditByModule = getAuditByModule;
  window.getAuditBySeverity = getAuditBySeverity;
  window.clearAuditTrail = clearAuditTrail;
}

// ================= READ =================
function getAuditRecords() {

  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getAuditByModule(m) {
  return getAuditRecords().filter(r => r.module === m);
}

function getAuditBySeverity(s) {
  return getAuditRecords().filter(r => r.severity === s);
}

function clearAuditTrail() {

  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([]));

  window.SYSTEM_EVENTS?.emit("AUDIT_CLEARED", {
    time: Date.now()
  });

  return true;
}

// ================= GLOBAL FLAGS =================
window.__AUDIT_TRAIL_ACTIVE__ = true;

window.runAuditCheck = function () {
  console.log("[AUDIT CHECK] OK");
  window.SYSTEM_EVENTS?.emit("AUDIT_CHECK_OK", { time: Date.now() });
};

console.log("[AUDIT] FULLY READY + DASHBOARD SAFE");
