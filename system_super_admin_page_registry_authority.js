"use strict";

/*
========================================
SUPER ADMIN PAGE REGISTRY v2.1 FINAL
========================================
✔ Single-path initialization rule compliant
✔ Core Engine dependency only
✔ Strict module registration layer
✔ No fallback rendering logic branching
✔ No UI/business logic leakage
✔ Enterprise-safe routing registry
✔ FULL COMPLETE VERSION (UNCUT)
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__SUPER_ADMIN_PAGE_REGISTRY__) return;

  window.__SUPER_ADMIN_PAGE_REGISTRY__ = true;

  console.log("[SUPER ADMIN PAGE REGISTRY] INIT");

  // ================= CORE WAIT =================
  function waitForCore(callback) {

    const timer = setInterval(() => {

      if (
        window.ENTERPRISE_CORE_ENGINE &&
        typeof window.ENTERPRISE_CORE_ENGINE.register === "function"
      ) {
        clearInterval(timer);
        callback();
      }

    }, 100);
  }

  // ================= REGISTER PAGE =================
  function registerPage(page) {

    window.ENTERPRISE_CORE_ENGINE.register(page, function () {

      // SINGLE PATH EXECUTION ONLY (NO BRANCHES)
      window.executeSuperAdminModule(page);

    });
  }

  // ================= INIT REGISTRY =================
  function initRegistry() {

    const pages = [
      "home",
      "create",
      "users",
      "system",

      "pinmaster",
      "productmaster",
      "rankmaster",
      "incomecontrol",

      "audit",
      "health",
      "backup",
      "aigovernor",

      "escrow",

      "controlroom",
      "businessintelligence",
      "strategicai",

      "auditblockchain",
      "realtime",
      "payments",
      "orchestrator",
      "healthmonitor",

      "eventmonitor",
      "eventstream",

      "reports",
      "tree",
      "reset"
    ];

    for (let i = 0; i < pages.length; i++) {
      registerPage(pages[i]);
    }

    console.log("[SUPER ADMIN PAGE REGISTRY] READY");
  }

  // ================= START =================
  waitForCore(initRegistry);

})();
