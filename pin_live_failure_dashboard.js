"use strict";

/*
========================================
PIN LIVE FAILURE DASHBOARD v1.0
========================================
✔ Real-time failure tracking
✔ Debug console stream
✔ Retry execution system
✔ Connected to PIN_ENGINE_RESULT bus
✔ Production-safe UI renderer
========================================
*/

(function () {

  if (window.__PIN_LIVE_FAILURE_DASHBOARD__) return;

  window.__PIN_LIVE_FAILURE_DASHBOARD__ = true;

  const state = {
    logs: [],
    maxLogs: 200
  };

  // ================= UI CONTAINER =================
  function createPanel() {

    let panel = document.getElementById("pinFailureDashboard");

    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "pinFailureDashboard";
    panel.style.cssText = `
      position: fixed;
      right: 0;
      bottom: 0;
      width: 380px;
      height: 420px;
      background: #0f172a;
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 999999;
      border-left: 2px solid #334155;
      border-top: 2px solid #334155;
      display: flex;
      flex-direction: column;
    `;

    panel.innerHTML = `
      <div style="padding:8px;background:#111827;font-weight:bold;">
        🔴 PIN FAILURE DASHBOARD
      </div>

      <div id="pinLogContainer" style="flex:1;overflow:auto;padding:6px;"></div>

      <div style="padding:6px;background:#111827;">
        <button onclick="window.clearPinLogs()" style="width:100%;">
          Clear Logs
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    return panel;
  }

  // ================= RENDER LOG =================
  function renderLogs() {

    const container = document.getElementById("pinLogContainer");
    if (!container) return;

    container.innerHTML = "";

    state.logs.slice().reverse().forEach((log, index) => {

      const row = document.createElement("div");

      row.style.cssText = `
        padding:6px;
        margin-bottom:4px;
        border:1px solid #334155;
        background:${log.success ? "#064e3b" : "#450a0a"};
      `;

      row.innerHTML = `
        <div><b>${log.action}</b></div>
        <div>status: ${log.success ? "SUCCESS" : "FAILED"}</div>
        <div>time: ${new Date(log.timestamp).toLocaleTimeString()}</div>
        <button onclick="window.retryPinAction(${index})">
          RETRY
        </button>
      `;

      container.appendChild(row);
    });
  }

  // ================= LOG HANDLER =================
  function addLog(data) {

    state.logs.push(data);

    if (state.logs.length > state.maxLogs) {
      state.logs.shift();
    }

    renderLogs();
  }

  // ================= RETRY ENGINE =================
  window.retryPinAction = function (index) {

    const log = state.logs[state.logs.length - 1 - index];

    if (!log) return;

    console.log("[PIN RETRY]", log);

    if (typeof window.dispatchPinAction === "function") {

      window.dispatchPinAction(
        log.action,
        log.payload || {},
        log.context || {}
      );
    }
  };

  // ================= CLEAR LOGS =================
  window.clearPinLogs = function () {
    state.logs = [];
    renderLogs();
  };

  // ================= EVENT LISTENER =================
  function listen() {

    if (!window.broadcastPinEvent) {
      console.warn("[PIN DASHBOARD] Event bus missing");
      return;
    }

    const original = window.broadcastPinEvent;

    window.broadcastPinEvent = function (event, data) {

      if (event === "PIN_ENGINE_RESULT") {

        addLog({
          action: data.action,
          success: data.success,
          error: data.error || null,
          timestamp: data.timestamp,
          payload: data.payload || null,
          context: data.context || null
        });
      }

      return original(event, data);
    };
  }

  // ================= INIT =================
  function init() {
    createPanel();
    listen();
    console.log("[PIN LIVE DASHBOARD] READY ✔");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
