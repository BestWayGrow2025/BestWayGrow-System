"use strict";

/*
========================================
PIN EXECUTION REPLAY ENGINE v1.0
========================================
✔ Stores execution history
✔ Replays failed actions
✔ Debug + recovery support
========================================
*/

(function () {

  if (window.__PIN_REPLAY_ENGINE__) return;
  window.__PIN_REPLAY_ENGINE__ = true;

  const history = [];

  function logExecution(action, payload, result) {
    history.push({
      action,
      payload,
      result,
      time: Date.now()
    });
  }

  function replay(index) {

    const item = history[index];
    if (!item) return;

    console.log("[PIN REPLAY]", item);

    if (typeof window.dispatchPinAction === "function") {
      window.dispatchPinAction(
        item.action,
        item.payload || {},
        {}
      );
    }
  }

  function bindGlobal() {
    window.__PIN_REPLAY_EXECUTION__ = replay;
    window.__PIN_EXEC_HISTORY__ = history;
  }

  function init() {
    bindGlobal();
    console.log("[PIN REPLAY ENGINE] READY");
  }

  init();

})();

