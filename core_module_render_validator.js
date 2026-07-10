"use strict";
/*
========================================
SYSTEM MODULE VERIFIER v1.3 FINAL
========================================
✔ Verifies module render
✔ Detects silent failures
✔ Router compatible
✔ Enterprise safe
✔ Delayed render verification
✔ Async-safe verification
✔ Production stable
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (
    window.SYSTEM_MODULE_VERIFIER &&
    window.SYSTEM_MODULE_VERIFIER.initialized
  ) {
    return;
  }

  window.SYSTEM_MODULE_VERIFIER = {
    initialized: true,
    ready: true,
    timestamp: Date.now()
  };

  // ================= STATE =================
  const STATE = {
    lastModule: null,
    lastCheck: null
  };

  // ================= VERIFY =================
 async function verify(page) {
  return new Promise(function (resolve) {

    setTimeout(function () {

      const main =
        document.getElementById(
          "mainContent"
        );

      const result = {
        page,
        success: false,
        reason: null,
        timestamp: Date.now()
      };

      // ---------- MAIN CONTENT ----------
      if (!main) {

        result.reason =
          "MAIN_CONTENT_MISSING";

emit(result);
resolve(result);
return;
      }

      // ---------- CONTENT ----------
      const content =
        (main.innerHTML || "")
          .trim();

      if (!content) {

        result.reason =
          "EMPTY_RENDER";

emit(result);
resolve(result);
return;
      }

      // ---------- SUCCESS ----------
      result.success = true;

      STATE.lastModule = page;
      STATE.lastCheck =
        result.timestamp;

     emit(result);
resolve(result);
return;

    }, 100);

  }

  // ================= EMIT =================
  function emit(result) {

    if (
      typeof window.broadcastPinEvent ===
      "function"
    ) {

      window.broadcastPinEvent(
        "MODULE_VERIFICATION_RESULT",
        result
      );

    }

    console.log(
      "[MODULE VERIFIER]",
      result.success
        ? "PASS"
        : "FAIL",
      result.page,
      result.reason || ""
    );

  }

  // ================= STATE ACCESS =================
  function getState() {

    return {
      lastModule:
        STATE.lastModule,

      lastCheck:
        STATE.lastCheck
    };

  }

  // ================= EXPORT =================
  window.SYSTEM_MODULE_VERIFIER = {

    initialized: true,

    ready: true,

    verify,

    getState

  };

})();
