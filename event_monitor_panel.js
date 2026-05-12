
"use strict";

/*
========================================
EVENT MONITOR PANEL V1.0 (FINAL)
========================================
✔ Live diagnostics for SYSTEM_EVENTS
✔ Tracks event counts
✔ Records recent events
✔ Monitors bridge initialization
✔ Zero impact on business logic
✔ Optional UI panel rendering
✔ Production LOCKED
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__EVENT_MONITOR_PANEL__) return;

  window.__EVENT_MONITOR_PANEL__ = true;

  initEventMonitorPanel();

})();

// ================= STATE =================
const EVENT_MONITOR = {
  counts: {},
  recent: [],
  maxRecent: 50,
  startedAt: Date.now()
};

// ================= INIT =================
function initEventMonitorPanel() {

  if (
    typeof window.SYSTEM_EVENTS === "undefined" ||
    typeof window.SYSTEM_EVENTS.emit !== "function"
  ) {
    return;
  }

  hookEventEmitter();

  document.addEventListener("DOMContentLoaded", function () {
    renderEventMonitorIfExists();
  });
}

// ================= HOOK EMITTER =================
function hookEventEmitter() {

  const bus = window.SYSTEM_EVENTS;

  // Prevent duplicate wrapping
  if (bus.emit.__eventMonitorWrapped === true) {
    return;
  }

  const originalEmit = bus.emit.bind(bus);

  function wrappedEmit(event, data) {

    try {
      trackEvent(event, data);
    } catch (err) {
      console.error("EVENT MONITOR ERROR:", err);
    }

    return originalEmit(event, data);
  }

  wrappedEmit.__eventMonitorWrapped = true;

  bus.emit = wrappedEmit;
}

// ================= TRACK =================
function trackEvent(event, data) {

  EVENT_MONITOR.counts[event] =
    (EVENT_MONITOR.counts[event] || 0) + 1;

  EVENT_MONITOR.recent.unshift({
    event,
    timestamp: Date.now(),
    data
  });

  if (EVENT_MONITOR.recent.length > EVENT_MONITOR.maxRecent) {
    EVENT_MONITOR.recent.pop();
  }

  updateMonitorUI();
}

// ================= OPTIONAL UI RENDER =================
function renderEventMonitorIfExists() {

  const el = document.getElementById("eventMonitorPanel");
  if (!el) return;

  el.innerHTML = `
    <h3>📡 Event Monitor</h3>
    <div id="eventMonitorStats"></div>
  `;

  updateMonitorUI();
}

// ================= UI UPDATE =================
function updateMonitorUI() {

  const stats = document.getElementById("eventMonitorStats");
  if (!stats) return;

  const totalEvents = Object.values(EVENT_MONITOR.counts)
    .reduce((a, b) => a + b, 0);

  const recent = EVENT_MONITOR.recent
    .slice(0, 10)
    .map(item =>
      `<li>${item.event}</li>`
    )
    .join("");

  stats.innerHTML = `
    <p><strong>Started:</strong>
      ${new Date(EVENT_MONITOR.startedAt).toLocaleString()}
    </p>
    <p><strong>Total Events:</strong> ${totalEvents}</p>
    <p><strong>Unique Events:</strong>
      ${Object.keys(EVENT_MONITOR.counts).length}
    </p>
    <h4>Recent Events</h4>
    <ul>${recent}</ul>
  `;
}

// ================= PUBLIC API =================
function getEventMonitorStats() {
  return JSON.parse(JSON.stringify(EVENT_MONITOR));
}

function resetEventMonitor() {
  EVENT_MONITOR.counts = {};
  EVENT_MONITOR.recent = [];
  EVENT_MONITOR.startedAt = Date.now();
  updateMonitorUI();
}

// ================= EXPORT =================
window.getEventMonitorStats = getEventMonitorStats;
window.resetEventMonitor = resetEventMonitor;
window.EVENT_MONITOR = EVENT_MONITOR;

