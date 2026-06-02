"use strict";

/*
========================================
PIN LIVE FAILURE DASHBOARD v1.1
REAL-TIME DEBUG + RETRY SYSTEM
========================================
✔ Live failure stream
✔ Retry failed actions
✔ Debug console overlay
✔ Event-driven updates
========================================
*/

(function () {

  if (window.__PIN_LIVE_FAILURE_DASHBOARD__) return;

  window.__PIN_LIVE_FAILURE_DASHBOARD__ = true;

  const state = {
    failures: [],
    listenersBound: false
  };

  // ================= UI =================
  function createUI() {

    if (document.getElementById("pinFailureDashboard")) return;

    const box = document.createElement("div");
    box.id = "pinFailureDashboard";
    box.style.cssText = `
      position:fixed;
      bottom:10px;
      right:10px;
      width:320px;
      max-height:400px;
      overflow:auto;
      background:#111;
      color:#fff;
      font-size:12px;
      padding:10px;
      z-index:99999;
      border:1px solid #444;
    `;

    box.innerHTML = `
      <h4>⚠ PIN FAILURE DASHBOARD</h4>
      <div id="pinFailureList"></div>
    `;

    document.body.appendChild(box);
  }

  // ================= RENDER =================
  function render() {

    const list = document.getElementById("pinFailureList");
    if (!list) return;

    list.innerHTML = state.failures.map((f, i) => `
      <div style="border-bottom:1px solid #333;margin:5px 0;padding:5px;">
        <b>${f.action}</b><br/>
        <span style="color:red">${f.error || "UNKNOWN"}</span><br/>
        <button onclick="window.__PIN_RETRY(${i})">RETRY</button>
      </div>
    `).join("");
  }

  // ================= RETRY =================
  window.__PIN_RETRY = function (index) {

    const item = state.failures[index];
    if (!item) return;

    console.log("[PIN RETRY]", item);

    if (typeof window.dispatchPinAction === "function") {
      window.dispatchPinAction(
        item.action,
        item.payload,
        item.context
      );
    }
  };

  // ================= LISTENER =================
  function bind() {

    if (state.listenersBound) return;
    state.listenersBound = true;

    window.broadcastPinEvent = window.broadcastPinEvent || function () {};

    const old = window.broadcastPinEvent;

    window.broadcastPinEvent = function (event, data) {

      old(event, data);

      if (event === "PIN_ENGINE_RESULT") {

        if (!data.success) {

          state.failures.push({
            action: data.action,
            error: data.error,
            payload: data.payload || {},
            context: data.context || {}
          });

          render();
        }
      }
    };
  }

  // ================= INIT =================
  function init() {
    createUI();
    bind();
    console.log("[PIN FAILURE DASHBOARD] READY");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
