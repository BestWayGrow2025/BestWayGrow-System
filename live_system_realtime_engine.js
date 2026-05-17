"use strict";

/*
========================================
LIVE SYSTEM REALTIME ENGINE V1.0
========================================
✔ Event-based update engine
✔ Auto refresh registry
✔ Dashboard live updates
✔ Escrow, PIN, Product, Audit monitoring
✔ Duplicate-safe callbacks
========================================
*/

console.log("[LIVE SYSTEM REALTIME ENGINE] LOADED");

const REALTIME_SUBSCRIBERS = {};
const REALTIME_EVENT_LOG_KEY = "REALTIME_EVENT_LOG";
const REALTIME_EVENT_LOG_LIMIT = 2000;

/* ================= HELPERS ================= */

function generateRealtimeEventId() {
  return (
    "RT_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 100000)
  );
}

/* ================= EVENT LOG ================= */

function getRealtimeEventLog() {
  let logs = safeGet(REALTIME_EVENT_LOG_KEY, []);
  return Array.isArray(logs) ? logs : [];
}

function saveRealtimeEventLog(logs) {
  if (!Array.isArray(logs)) logs = [];

  if (logs.length > REALTIME_EVENT_LOG_LIMIT) {
    logs = logs.slice(-REALTIME_EVENT_LOG_LIMIT);
  }

  safeSet(REALTIME_EVENT_LOG_KEY, logs);
}

/* ================= SUBSCRIBE ================= */

function subscribeRealtime(eventName, callback) {

  if (!eventName || typeof callback !== "function") {
    return false;
  }

  if (!REALTIME_SUBSCRIBERS[eventName]) {
    REALTIME_SUBSCRIBERS[eventName] = [];
  }

  // Prevent duplicates
  if (
    REALTIME_SUBSCRIBERS[eventName].includes(callback)
  ) {
    return true;
  }

  REALTIME_SUBSCRIBERS[eventName].push(callback);

  return true;
}

/* ================= UNSUBSCRIBE ================= */

function unsubscribeRealtime(eventName, callback) {

  let list = REALTIME_SUBSCRIBERS[eventName];

  if (!Array.isArray(list)) {
    return false;
  }

  REALTIME_SUBSCRIBERS[eventName] =
    list.filter(fn => fn !== callback);

  return true;
}

/* ================= PUBLISH ================= */

function publishRealtime(eventName, payload = {}) {

  if (!eventName) return false;

  let eventRecord = {
    eventId: generateRealtimeEventId(),
    eventName,
    payload,
    time: Date.now()
  };

  // Save event log
  let logs = getRealtimeEventLog();
  logs.push(eventRecord);
  saveRealtimeEventLog(logs);

  // Audit integration (if available)
  if (typeof auditLog === "function") {
    try {
      auditLog("REALTIME", eventName, {
        userId: payload.userId || null,
        amount: payload.amount || 0,
        refId: payload.refId || null,
        details: payload
      });
    } catch (_) {}
  }

  // Notify subscribers
  let list = REALTIME_SUBSCRIBERS[eventName] || [];

  list.forEach(fn => {
    try {
      fn(payload, eventRecord);
    } catch (err) {
      console.error(
        "[REALTIME CALLBACK ERROR]",
        eventName,
        err
      );
    }
  });

  // Notify wildcard subscribers
  let all = REALTIME_SUBSCRIBERS["*"] || [];

  all.forEach(fn => {
    try {
      fn(eventName, payload, eventRecord);
    } catch (err) {
      console.error(
        "[REALTIME WILDCARD ERROR]",
        eventName,
        err
      );
    }
  });

  return true;
}

/* ================= AUTO REFRESH HELPERS ================= */

function triggerDashboardRefresh(moduleName = "dashboard") {
  publishRealtime("dashboard_refresh", {
    module: moduleName
  });
}

function triggerEscrowRefresh(refId = null) {
  publishRealtime("escrow_refresh", {
    refId
  });
}

function triggerPinRefresh(refId = null) {
  publishRealtime("pin_refresh", {
    refId
  });
}

function triggerProductRefresh(refId = null) {
  publishRealtime("product_refresh", {
    refId
  });
}

function triggerAuditRefresh() {
  publishRealtime("audit_refresh", {});
}

/* ================= LOG ACCESS ================= */

function getRecentRealtimeEvents(limit = 50) {
  limit = Number(limit || 50);

  return getRealtimeEventLog()
    .slice(-limit)
    .reverse();
}

/* ================= EXPORT ================= */

window.subscribeRealtime = subscribeRealtime;
window.unsubscribeRealtime = unsubscribeRealtime;
window.publishRealtime = publishRealtime;

window.triggerDashboardRefresh = triggerDashboardRefresh;
window.triggerEscrowRefresh = triggerEscrowRefresh;
window.triggerPinRefresh = triggerPinRefresh;
window.triggerProductRefresh = triggerProductRefresh;
window.triggerAuditRefresh = triggerAuditRefresh;

window.getRecentRealtimeEvents = getRecentRealtimeEvents;

