"use strict";

/*
========================================
SYSTEM MODULE VERIFIER v1.1 ENTERPRISE
========================================
✔ Verifies module render
✔ Detects silent failures
✔ Detects blank UI
✔ Reports success/failure events
✔ Router compatible
✔ Dashboard compatible
✔ Clean guard architecture
========================================
*/

(function () {

  // ================= GUARD =================
if (
  window.__SYSTEM_MODULE_VERIFIER__ &&
  window.__SYSTEM_MODULE_VERIFIER__.initialized
) {
  return;
}

window.__SYSTEM_MODULE_VERIFIER__ = {
  initialized: true,
  ready: false,
  timestamp: Date.now()
};

  // ================= STATE =================
  const STATE = {
    lastModule: null,
    lastCheck: null
  };

  // ================= VERIFY =================
  function verify(page) {

    const main =
      document.getElementById("mainContent");

    const result = {
      page,
      success: false,
      reason: null,
      timestamp: Date.now()
    };

    if (!main) {

      result.reason = "MAIN_CONTENT_MISSING";

      emit(result);

      return result;
    }

    const content =
      (main.innerHTML || "").trim();

    if (!content) {

      result.reason = "EMPTY_RENDER";

      emit(result);

      return result;
    }

    result.success = true;

    STATE.lastModule = page;
    STATE.lastCheck = result.timestamp;

    emit(result);

    return result;
  }

  // ================= EVENT =================
  function emit(result) {

    if (typeof window.broadcastPinEvent === "function") {

      window.broadcastPinEvent(
        "MODULE_VERIFICATION_RESULT",
        result
      );
    }

    console.log(
      "[MODULE VERIFIER]",
      result.success ? "PASS" : "FAIL",
      result.page,
      result.reason || ""
    );
  }

  // ================= STATE =================
  function getState() {

    return {
      lastModule: STATE.lastModule,
      lastCheck: STATE.lastCheck
    };
  }

  // ================= EXPORT =================
  window.SYSTEM_MODULE_VERIFIER = {
    verify,
    getState
  };

})();
