"use strict";

/*
========================================
EVENT ORCHESTRATOR LAYER V1.0 (FINAL SAFE)
CENTRAL EVENT EXECUTION CONTROLLER
========================================
✔ Passive module ONLY
✔ No auto execution on load
✔ Boot controller controlled
✔ Safe event logging + dispatch
✔ Audit-ready event history
========================================
*/

const EVENT_ORCHESTRATOR_KEY = "EVENT_ORCHESTRATOR_LOG";
const EVENT_ORCHESTRATOR_LIMIT = 1000;

// ================= STATE FLAG (CORRECTED) =================
window.__EVENT_ORCHESTRATOR_ACTIVE__ = {
  initialized: true,
  ready: false,
  timestamp: Date.now()
};

// ================= STORAGE HELPERS =================
function getEventOrchestratorLog() {
  try {
    const raw = localStorage.getItem(EVENT_ORCHESTRATOR_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];

  } catch {
    return [];
  }
}

function saveEventOrchestratorLog(log) {
  try {
    const trimmed =
      log.length > EVENT_ORCHESTRATOR_LIMIT
        ? log.slice(-EVENT_ORCHESTRATOR_LIMIT)
        : log;

    localStorage.setItem(
      EVENT_ORCHESTRATOR_KEY,
      JSON.stringify(trimmed)
    );

    return true;

  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical("EVENT_ORCHESTRATOR_SAVE_FAILED: " + e.message);
    }
    return false;
  }
}

// ================= EVENT LOGGING =================
function recordEventExecution(entry = {}) {
  try {
    const log = getEventOrchestratorLog();

    log.push({
      eventName: entry.eventName || "UNKNOWN_EVENT",
      success: entry.success === true,
      timestamp: Date.now(),
      details:
        entry.details && typeof entry.details === "object"
          ? entry.details
          : {}
    });

    return saveEventOrchestratorLog(log);

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("EVENT_RECORD_FAILED: " + err.message);
    }
    return false;
  }
}

// ================= SAFE EXECUTION =================
function executeEvent(eventName, handler, payload = {}) {
  try {
    if (!eventName || typeof handler !== "function") {
      return false;
    }

    const result = handler(payload);

    recordEventExecution({
      eventName,
      success: !!result,
      details: { payload }
    });

    return result;

  } catch (err) {
    recordEventExecution({
      eventName,
      success: false,
      details: { error: err.message }
    });

    return false;
  }
}

// ================= DISPATCH =================
function dispatchSystemEvent(eventName, payload = {}) {
  try {
    if (typeof emitSystemEvent === "function") {
      emitSystemEvent(eventName, payload);
      return true;
    }

    window.dispatchEvent(
      new CustomEvent(eventName, { detail: payload })
    );

    return true;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("DISPATCH_FAILED: " + err.message);
    }
    return false;
  }
}

// ================= COMBINED FLOW =================
function executeAndDispatch(eventName, handler, payload = {}) {
  const result = executeEvent(eventName, handler, payload);

  if (result) {
    dispatchSystemEvent(eventName, payload);
  }

  return result;
}

// ================= STATUS =================
function getEventOrchestratorStatus() {
  const log = getEventOrchestratorLog();

  return {
    active: true,
    totalEvents: log.length,
    storageKey: EVENT_ORCHESTRATOR_KEY,
    retentionLimit: EVENT_ORCHESTRATOR_LIMIT,
    integrationLockAvailable: typeof executeWithSystemLock === "function",
    systemEventHubAvailable: typeof emitSystemEvent === "function"
  };
}

// ================= EXPORTS =================
window.getEventOrchestratorLog = getEventOrchestratorLog;
window.recordEventExecution = recordEventExecution;
window.executeEvent = executeEvent;
window.dispatchSystemEvent = dispatchSystemEvent;
window.executeAndDispatch = executeAndDispatch;
window.getEventOrchestratorStatus = getEventOrchestratorStatus;

// NO AUTO BOOT (CONFIRMED PASSIVE ONLY)
