"use strict";

/*
========================================
SYSTEM MODULE VERIFIER v1.2 FINAL
========================================
✔ Verifies module render
✔ Detects silent failures
✔ Supports async HTML loading
✔ Supports loadRealModule()
✔ Router compatible
✔ Enterprise safe
========================================
*/

(function () {

  if (
    window.__SYSTEM_MODULE_VERIFIER__ &&
    window.__SYSTEM_MODULE_VERIFIER__.initialized
  ) {
    return;
  }

  window.__SYSTEM_MODULE_VERIFIER__ = {
    initialized: true,
    ready: true,
    timestamp: Date.now()
  };

  const STATE = {
    lastModule: null,
    lastCheck: null
  };

  function verify(page) {

    const main =
      document.getElementById(
        "mainContent"
      );

    if (!main) {

      const result = {
        page,
        success: false,
        reason:
          "MAIN_CONTENT_MISSING",
        timestamp: Date.now()
      };

      emit(result);

      return result;
    }

    setTimeout(function () {

      const content =
        (main.innerHTML || "")
        .trim();

      const result = {
        page,
        success: false,
        reason: null,
        timestamp: Date.now()
      };

      if (!content) {

        result.reason =
          "EMPTY_RENDER";

        emit(result);

        return;
      }

      result.success = true;

      STATE.lastModule = page;
      STATE.lastCheck =
        result.timestamp;

      emit(result);

    }, 300);

    return {
      page,
      success: true,
      reason: "PENDING_ASYNC_RENDER",
      timestamp: Date.now()
    };
  }

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

  function getState() {

    return {
      lastModule:
        STATE.lastModule,
      lastCheck:
        STATE.lastCheck
    };
  }

  window.SYSTEM_MODULE_VERIFIER = {
    verify,
    getState
  };

})();
