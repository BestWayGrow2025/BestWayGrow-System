"use strict";

/*
========================================
SYSTEM NAVIGATION AUDIT v1.2 ENTERPRISE FIXED
========================================
✔ Tracks all page navigation
✔ Prevents infinite access_denied loops
✔ Adds system page blocking guard
✔ Stable event emission
✔ Production safe
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__SYSTEM_NAVIGATION_AUDIT__) return;
  window.__SYSTEM_NAVIGATION_AUDIT__ = true;

  const MAX_LOGS = 500;

  // 🔥 CRITICAL FIX: prevent system loop pages from re-auditing
  const BLOCK_AUDIT = ["access_denied"];

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

  // ================= CORE AUDIT FUNCTION (NEW UNIFIED) =================
  function audit(page, status = "PENDING", action = "EVENT") {

    // 🔥 BLOCK LOOPING SYSTEM PAGES
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
      window.broadcastPinEvent(
        "SYSTEM_NAVIGATION_AUDIT",
        entry
      );
    }

    console.log("[NAV AUDIT]", action, page, status);
  }

  // ================= WRAPPERS =================
  function navigationRequested(page) {
    audit(page, "PENDING", "REQUESTED");
  }

  function navigationLoaded(page) {
    audit(page, "SUCCESS", "LOADED");
  }

  function navigationFailed(page) {
    audit(page, "FAILED", "FAILED");
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
    audit,
    navigationRequested,
    navigationLoaded,
    navigationFailed,
    getLogs,
    clearLogs
  };

  console.log("[SYSTEM NAVIGATION AUDIT] READY ✔ FIXED v1.2");

})();
