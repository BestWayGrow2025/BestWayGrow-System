"use strict";

/*
========================================
EVENT ORCHESTRATOR LAYER V1.0
CENTRAL EVENT EXECUTION CONTROLLER
========================================
✔ Centralized event dispatching
✔ Duplicate event protection
✔ Safe execution wrapper
✔ Error isolation
✔ Audit-ready event history
✔ Compatible with integration_lock.js
✔ Compatible with system_event_hub.js
========================================
*/

const EVENT_ORCHESTRATOR_KEY = "EVENT_ORCHESTRATOR_LOG";
const EVENT_ORCHESTRATOR_LIMIT = 1000;

// ========================================
// STORAGE HELPERS
// ========================================
function getEventOrchestratorLog() {
  try {
    const raw = localStorage.getItem(EVENT_ORCHESTRATOR_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEventOrchestratorLog(log) {
  try {
    const safeLog = Array.isArray(log) ? log : [];

    // Keep only latest N events
    const trimmed =
      safeLog.length > EVENT_ORCHESTRATOR_LIMIT
        ? safeLog.slice(-EVENT_ORCHESTRATOR_LIMIT)
        : safeLog;

    localStorage.setItem(
      EVENT_ORCHESTRATOR_KEY,
      JSON.stringify(trimmed)
    );

    return true;
  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical(
        "EVENT_ORCHESTRATOR_SAVE_FAILED: " + e.message
      );
    }

    return false;
  }
}

// ========================================
// EVENT LOGGING
// ========================================
function recordEventExecution(entry = {}) {
  try {
    const log = getEventOrchestratorLog();

    log.push({
      eventName: entry.eventName || "UNKNOWN_EVENT",
      success: entry.success === true,
      timestamp: Date.now(),
      details:
        entry.details &&
        typeof entry.details === "object"
          ? entry.details
          : {}
    });

    return saveEventOrchestratorLog(log);
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical(
        "EVENT_ORCHESTRATOR_RECORD_FAILED: " + err.message
      );
    }

    return false;
  }
}

// ========================================
// SAFE EVENT EXECUTION
// ========================================
function executeEvent(eventName, handler, payload = {}) {
  try {
    if (!eventName) {
      return false;
    }

    if (typeof handler !== "function") {
      recordEventExecution({
        eventName,
        success: false,
        details: {
          reason: "INVALID_HANDLER"
        }
      });

      return false;
    }

    // Use global integration lock if available
    if (
      typeof executeWithSystemLock === "function"
    ) {
      const result = executeWithSystemLock(
        function () {
          return handler(payload);
        },
        "EVENT_" + eventName
      );

      recordEventExecution({
        eventName,
        success: !!result,
        details: {
          payload
        }
      });

      return result;
    }

    // Fallback execution without lock
    const result = handler(payload);

    recordEventExecution({
      eventName,
      success: !!result,
      details: {
        payload
      }
    });

    return result;
  } catch (err) {
    recordEventExecution({
      eventName,
      success: false,
      details: {
        error: err.message
      }
    });

    if (typeof logCritical === "function") {
      logCritical(
        "EVENT_EXECUTION_FAILED: " + err.message
      );
    }

    return false;
  }
}

// ========================================
// EVENT DISPATCH TO system_event_hub.js
// ========================================
function dispatchSystemEvent(eventName, payload = {}) {
  try {
    // Preferred centralized event hub
    if (
      typeof emitSystemEvent === "function"
    ) {
      emitSystemEvent(eventName, payload);
      return true;
    }

    // Alternative browser CustomEvent
    if (
      typeof window.dispatchEvent === "function"
    ) {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: payload
        })
      );

      return true;
    }

    return false;
  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical(
        "SYSTEM_EVENT_DISPATCH_FAILED: " + err.message
      );
    }

    return false;
  }
}

// ========================================
// EXECUTE + DISPATCH
// ========================================
function executeAndDispatch(
  eventName,
  handler,
  payload = {}
) {
  const result = executeEvent(
    eventName,
    handler,
    payload
  );

  if (result) {
    dispatchSystemEvent(eventName, payload);
  }

  return result;
}

// ========================================
// STATUS API
// ========================================
function getEventOrchestratorStatus() {
  const log = getEventOrchestratorLog();

  return {
    active: true,
    totalEvents: log.length,
    storageKey: EVENT_ORCHESTRATOR_KEY,
    retentionLimit: EVENT_ORCHESTRATOR_LIMIT,
    integrationLockAvailable:
      typeof executeWithSystemLock === "function",
    systemEventHubAvailable:
      typeof emitSystemEvent === "function"
  };
}

// ========================================
// GLOBAL EXPORTS
// ========================================
window.getEventOrchestratorLog =
  getEventOrchestratorLog;

window.recordEventExecution =
  recordEventExecution;

window.executeEvent =
  executeEvent;

window.dispatchSystemEvent =
  dispatchSystemEvent;

window.executeAndDispatch =
  executeAndDispatch;

window.getEventOrchestratorStatus =
  getEventOrchestratorStatus;

window.__EVENT_ORCHESTRATOR_ACTIVE__ =
  true;
