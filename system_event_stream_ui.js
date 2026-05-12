"use strict";

/*
========================================
SYSTEM EVENT STREAM UI V1.0 (LIVE OPS CONSOLE)
========================================
✔ Real-time event log viewer
✔ Live SYSTEM_EVENTS feed
✔ Debug + audit stream wall
✔ Admin monitoring console
✔ Safe read-only visual layer
========================================
*/

// ================= GUARD =================
(function () {

  if (window.__SYSTEM_EVENT_STREAM_UI__) return;

  window.__SYSTEM_EVENT_STREAM_UI__ = true;

  document.addEventListener("DOMContentLoaded", initEventStreamUI);

})();

// ================= INIT =================
function initEventStreamUI() {

  const el = document.getElementById("systemEventStreamPanel");

  if (!el) return;

  renderUI(el);
  bindEvents();
}

// ================= UI =================
function renderUI(el) {

  el.innerHTML = `
    <div style="padding:15px;">
      <h3>📡 LIVE EVENT STREAM</h3>
      <div id="eventStreamLog"
           style="height:300px;overflow:auto;background:#000;color:#0f0;padding:10px;font-family:monospace;">
      </div>
    </div>
  `;
}

// ================= EVENT BIND =================
function bindEvents() {

  const hub = window.SYSTEM_EVENTS;
  if (!hub) return;

  const logBox = document.getElementById("eventStreamLog");

  hub.on("PIN_REQUEST_EVENT", e => pushLog("PIN_REQUEST", e));
  hub.on("PAYOUT_EVENT", e => pushLog("PAYOUT", e));
  hub.on("BANK_UPDATE", e => pushLog("BANK_UPDATE", e));
  hub.on("SYSTEM_ALERT", e => pushLog("ALERT", e));
  hub.on("CONTROL_SNAPSHOT", e => pushLog("SNAPSHOT", e));
}

// ================= LOG ENGINE =================
function pushLog(type, data) {

  const box = document.getElementById("eventStreamLog");
  if (!box) return;

  const line = document.createElement("div");

  line.textContent = `[${new Date().toLocaleTimeString()}] ${type} -> ${JSON.stringify(data)}`;

  box.appendChild(line);

  box.scrollTop = box.scrollHeight;
}

// ================= GLOBAL =================
window.pushSystemEventLog = pushLog;
