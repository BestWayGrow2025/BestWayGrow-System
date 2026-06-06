"use strict";

/*
========================================
SYSTEM FALLBACK RECOVERY v1.1 ENTERPRISE
========================================
✔ Prevents blank screens
✔ Controlled fallback UI
✔ Retry support
✔ Failure logging
✔ Router compatible
✔ Enterprise safe recovery
✔ Clean guard architecture
========================================
*/

(function () {

  // ================= GUARD =================
if (
  window.__SYSTEM_FALLBACK_RECOVERY__ &&
  window.__SYSTEM_FALLBACK_RECOVERY__.initialized
) {
  return;
}

window.__SYSTEM_FALLBACK_RECOVERY__ = {
  initialized: true,
  ready: false,
  timestamp: Date.now()
};

  let lastFailedPage = null;

  // ================= SHOW FALLBACK =================
  function show(page, reason) {

    lastFailedPage = page;

    const main =
      document.getElementById("mainContent");

    if (!main) {

      console.error(
        "[FALLBACK RECOVERY] mainContent missing"
      );

      return false;
    }

    main.innerHTML = `
      <div class="system-fallback-ui"
           style="
             padding:20px;
             border:1px solid #ccc;
             border-radius:8px;
           ">
        <h3>⚠ Module Load Failed</h3>

        <p>
          Module:
          <b>${page || "UNKNOWN"}</b>
        </p>

        <p>
          Reason:
          <b>${reason || "UNKNOWN_ERROR"}</b>
        </p>

        <button id="retryFailedModuleBtn">
          Retry Module
        </button>
      </div>
    `;

    emitFailure(page, reason);

    return true;
  }

  // ================= RETRY =================
  function retry() {

    if (!lastFailedPage) {
      return false;
    }

    console.log(
      "[FALLBACK RECOVERY] RETRY:",
      lastFailedPage
    );

    if (typeof window.openSystemPage === "function") {

      return window.openSystemPage(
        lastFailedPage
      );
    }

    return false;
  }

  // ================= BIND =================
  function bindRetry() {

    const btn =
      document.getElementById(
        "retryFailedModuleBtn"
      );

    if (!btn) return;

    btn.onclick = retry;
  }

  // ================= EVENT =================
  function emitFailure(page, reason) {

    if (typeof window.broadcastPinEvent === "function") {

      window.broadcastPinEvent(
        "SYSTEM_MODULE_FAILURE",
        {
          page,
          reason,
          timestamp: Date.now()
        }
      );
    }
  }

  // ================= STATE =================
  function getLastFailedPage() {

    return lastFailedPage;
  }

 // ================= EXPORT =================
window.SYSTEM_FALLBACK_RECOVERY = {
  show,
  retry,
  bindRetry,
  getLastFailedPage
};

window.initSystemFallbackRecovery =
  bindRetry;

})();
