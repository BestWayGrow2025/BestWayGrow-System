"use strict";

/*
========================================
SYSTEM NAVIGATION AUDIT v1.1 FINAL
========================================
✔ Safe logging
✔ Block system pages option
========================================
*/

(function () {

  if (window.__SYSTEM_NAVIGATION_AUDIT__) return;
  window.__SYSTEM_NAVIGATION_AUDIT__ = true;

  const MAX_LOGS = 500;

  const BLOCK_AUDIT = ["access_denied"];

  const STATE = { logs: [] };

  function getRole() {
    return window.PIN_ROLE_ACCESS?.getCurrentRole?.() || "USER";
  }

  function record(action, page, status) {

    if (BLOCK_AUDIT.includes(page)) {
      console.warn("[NAV AUDIT] SKIPPED SYSTEM PAGE:", page);
      return;
    }

    const entry = {
      action,
      page,
      status,
      role: getRole(),
      timestamp: Date.now()
    };

    STATE.logs.push(entry);

    if (STATE.logs.length > MAX_LOGS) {
      STATE.logs.shift();
    }

    if (typeof window.broadcastPinEvent === "function") {
      window.broadcastPinEvent("SYSTEM_NAVIGATION_AUDIT", entry);
    }

    console.log("[NAV AUDIT]", action, page, status);
  }

  function navigationRequested(page) {
    record("REQUESTED", page, "PENDING");
  }

  function navigationLoaded(page) {
    record("LOADED", page, "SUCCESS");
  }

  function navigationFailed(page) {
    record("FAILED", page, "FAILED");
  }

  window.SYSTEM_NAVIGATION_AUDIT = {
    navigationRequested,
    navigationLoaded,
    navigationFailed,
    getLogs: () => [...STATE.logs],
    clearLogs: () => (STATE.logs.length = 0)
  };

  console.log("[SYSTEM NAVIGATION AUDIT] READY ✔ FINAL");

})();
