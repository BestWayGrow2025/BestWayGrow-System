"use strict";

/*
========================================
PIN EXECUTION REPLAY ENGINE v1.1
========================================
✔ Stores execution history
✔ Replays failed actions
✔ Debug support
✔ Recovery support
✔ Memory protection
✔ Production safe
========================================
*/

(function () {

  if (window.__PIN_REPLAY_ENGINE__) return;

  window.__PIN_REPLAY_ENGINE__ = true;

  // ================= CONFIG =================
  const MAX_HISTORY = 500;

  // ================= STORAGE =================
  const history = [];

  // ================= LOGGER =================
  function logExecution(
    action,
    payload,
    result
  ) {

    history.push({

      action,
      payload,
      result,

      time: Date.now()

    });

    // Memory Protection
    if (history.length > MAX_HISTORY) {

      history.shift();

    }

    return true;
  }

  // ================= REPLAY =================
  function replay(index) {

    const item = history[index];

    if (!item) {

      console.warn(
        "[PIN REPLAY] Invalid index:",
        index
      );

      return false;
    }

    console.log(
      "[PIN REPLAY]",
      item
    );

    if (
      typeof window.dispatchPinAction !==
      "function"
    ) {

      console.warn(
        "[PIN REPLAY] Dispatcher Missing"
      );

      return false;
    }

    try {

      return window.dispatchPinAction(

        item.action,

        item.payload || {},

        {}

      );

    } catch (err) {

      console.error(
        "[PIN REPLAY ERROR]",
        err
      );

      return false;
    }
  }

  // ================= CLEAR =================
  function clearHistory() {

    history.length = 0;

    console.log(
      "[PIN REPLAY] History Cleared"
    );

    return true;
  }

  // ================= GETTERS =================
  function getHistory() {

    return [...history];
  }

  function getHistoryCount() {

    return history.length;
  }

  // ================= GLOBAL EXPORTS =================
  function bindGlobal() {

    window.__PIN_REPLAY_EXECUTION__ =
      replay;

    window.__PIN_EXEC_HISTORY__ =
      history;

    window.pinReplayExecution =
      replay;

    window.pinLogExecution =
      logExecution;

    window.pinClearExecutionHistory =
      clearHistory;

    window.pinGetExecutionHistory =
      getHistory;

    window.pinGetExecutionHistoryCount =
      getHistoryCount;
  }

  // ================= INIT =================
  function init() {

    bindGlobal();

    console.log(
      "[PIN REPLAY ENGINE] READY ✔"
    );
  }

  init();

})();
