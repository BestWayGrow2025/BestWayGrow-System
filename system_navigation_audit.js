"use strict";

/*
========================================
SYSTEM NAVIGATION AUDIT v1.1 ENTERPRISE
========================================
✔ Tracks all page navigation
✔ Records user role
✔ Records requested page
✔ Records loaded page
✔ Stores audit history
✔ Super Admin diagnostics
✔ Clean guard architecture
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__SYSTEM_NAVIGATION_AUDIT__) return;
  window.__SYSTEM_NAVIGATION_AUDIT__ = true;

  const MAX_LOGS = 500;

  // ================= STATE =================
  const STATE = {
    logs: []
  };

  // ================= ROLE =================
  function getRole() {

    return (
      window.PIN_ROLE_ACCESS?.getCurrentRole?.() ||
      "USER"
    );
  }

  // ================= RECORD =================
  function record(action, page, status) {

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

      window.broadcastPinEvent(
        "SYSTEM_NAVIGATION_AUDIT",
        entry
      );
    }

    console.log(
      "[NAV AUDIT]",
      action,
      page,
      status
    );
  }

  // ================= REQUEST =================
  function navigationRequested(page) {

    record(
      "REQUESTED",
      page,
      "PENDING"
    );
  }

  // ================= SUCCESS =================
  function navigationLoaded(page) {

    record(
      "LOADED",
      page,
      "SUCCESS"
    );
  }

  // ================= FAILURE =================
  function navigationFailed(page) {

    record(
      "FAILED",
      page,
      "FAILED"
    );
  }

  // ================= GET LOGS =================
  function getLogs() {

    return [...STATE.logs];
  }

  // ================= CLEAR =================
  function clearLogs() {

    STATE.logs.length = 0;
  }

  // ================= EXPORT =================
  window.SYSTEM_NAVIGATION_AUDIT = {
    navigationRequested,
    navigationLoaded,
    navigationFailed,
    getLogs,
    clearLogs
  };

  console.log(
    "[SYSTEM NAVIGATION AUDIT] READY ✔"
  );

})();
