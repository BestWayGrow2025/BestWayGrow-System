"use strict";

/*
========================================
PIN LIVE FAILURE DASHBOARD v1.2 FINAL
REAL-TIME OBSERVABILITY + SAFE RETRY
========================================
✔ Stable UI overlay
✔ Tracks FAIL + SUCCESS
✔ Safe event wrapping
✔ Retry system
✔ Dashboard Rule Compliant
========================================
*/

(function () {

  if (window.__PIN_LIVE_FAILURE_DASHBOARD__) return;

  window.__PIN_LIVE_FAILURE_DASHBOARD__ = true;

  const state = {
    logs: [],
    listenersBound: false
  };

  // ================= UI CREATE =================
  function createUI() {

    if (document.getElementById("pinFailureDashboard")) return;

    const target =
      document.getElementById("mainContent");

    if (!target) {

      console.warn(
        "[PIN DASHBOARD] mainContent not found"
      );

      return;
    }

    const box = document.createElement("div");

    box.id = "pinFailureDashboard";

    box.style.cssText = `
      width:100%;
      max-height:420px;
      overflow:auto;
      background:#0f0f0f;
      color:#fff;
      font-size:12px;
      padding:10px;
      border:1px solid #333;
      border-radius:8px;
      margin-top:10px;
    `;

    box.innerHTML = `
      <div style="font-weight:bold;margin-bottom:8px;">
        ⚠ PIN ENGINE LIVE DASHBOARD
      </div>
      <div id="pinFailureList"></div>
    `;

    target.appendChild(box);
  }

  // ================= RENDER =================
  function render() {

    const list =
      document.getElementById("pinFailureList");

    if (!list) return;

    list.innerHTML = state.logs
      .slice(-100)
      .reverse()
      .map((log, i) => `
        <div style="
          border-bottom:1px solid #222;
          padding:6px;
          margin-bottom:6px;
        ">
          <b>${log.action}</b><br/>

          <span style="
            color:${log.success ? "lime" : "red"}
          ">
            ${log.success ? "SUCCESS" : "FAIL"}
          </span><br/>

          ${
            log.error
              ? `<span style="color:#ff6666">${log.error}</span><br/>`
              : ""
          }

          <button
            data-retry-index="${i}"
            style="margin-top:4px;"
          >
            RETRY
          </button>
        </div>
      `)
      .join("");
  }

  // ================= ADD LOG =================
  function addLog(data) {

    state.logs.push({
      ...data,
      time: Date.now()
    });

    if (state.logs.length > 500) {
      state.logs.shift();
    }

    render();
  }

  // ================= EVENT STREAM =================
  function attachEventStream() {

    const original =
      window.broadcastPinEvent;

    window.broadcastPinEvent = function (
      eventName,
      data
    ) {

      if (typeof original === "function") {
        original(eventName, data);
      }

      if (
        eventName ===
        "PIN_ENGINE_RESULT"
      ) {

        addLog({
          action: data.action,
          success: data.success,
          error: data.error || null,
          payload: data.payload || null
        });
      }
    };
  }

  // ================= RETRY =================
  function bindRetry() {

    document.addEventListener(
      "click",
      function (e) {

        const btn =
          e.target.closest(
            "[data-retry-index]"
          );

        if (!btn) return;

        const index =
          parseInt(
            btn.getAttribute(
              "data-retry-index"
            ),
            10
          );

        const log =
          state.logs[
            state.logs.length - 1 - index
          ];

        if (!log) return;

        console.log(
          "[PIN DASHBOARD RETRY]",
          log
        );

        if (
          typeof window.dispatchPinAction ===
          "function"
        ) {

          window.dispatchPinAction(
            log.action,
            log.payload || {},
            {
              userId:
                window.getCurrentUser?.()
                  ?.id || "SYSTEM"
            }
          );
        }
      }
    );
  }

  // ================= INIT =================
  function init() {

    createUI();

    if (!state.listenersBound) {

      state.listenersBound = true;

      attachEventStream();

      bindRetry();
    }

    console.log(
      "[PIN LIVE FAILURE DASHBOARD] READY ✔"
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
