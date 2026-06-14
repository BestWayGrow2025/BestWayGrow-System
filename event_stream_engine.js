"use strict";

/*
========================================
EVENT STREAM ENGINE V1.0 (REAL-TIME CORE)
========================================
✔ Emits financial events in real-time
✔ Connects Income, Ledger, Wallet layers
✔ Enables monitoring + audit streaming
✔ Prevents silent system failure
========================================
*/

const EVENT_STREAM_KEY = "EVENT_STREAM_LOG";

// ================= EVENT BUS =================
function emitEvent(event) {
  try {
    if (!event || !event.type) return false;

    const stream = getEventStream();

    const eventId = "EVT_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    stream[eventId] = {
      ...event,
      eventId,
      timestamp: Date.now()
    };

    saveEventStream(stream);

    // live hook (UI / admin dashboards)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("FINANCIAL_EVENT", {
          detail: stream[eventId]
        })
      );
    }

    return true;

  } catch (err) {
    if (typeof logCritical === "function") {
      logCritical("EVENT_EMIT_FAILED: " + err.message);
    }
    return false;
  }
}

// ================= STORAGE =================
function getEventStream() {
  try {
    return JSON.parse(localStorage.getItem(EVENT_STREAM_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveEventStream(data) {
  try {

    // ✅ ADD THIS BLOCK HERE (BEFORE STORAGE SAVE)
    const keys = Object.keys(data || {});

    if (keys.length > 500) {

      const sorted = Object.values(data)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 500);

      const trimmed = {};

      sorted.forEach(ev => {
        trimmed[ev.eventId] = ev;
      });

      data = trimmed;
    }

    // ORIGINAL SAVE (UNCHANGED)
    localStorage.setItem(
      EVENT_STREAM_KEY,
      JSON.stringify(data || {})
    );

  } catch (e) {
    if (typeof logCritical === "function") {
      logCritical("EVENT_SAVE_FAILED: " + e.message);
    }
  }
}

// ================= STREAM READER =================
function getRecentEvents(limit = 50) {
  const stream = getEventStream();

  return Object.values(stream)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

// ================= EXPORT =================
window.emitEvent = emitEvent;
window.getRecentEvents = getRecentEvents;

window.__EVENT_STREAM_ACTIVE__ = true;

