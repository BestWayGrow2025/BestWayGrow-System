"use strict";

/*
========================================
SUPER ADMIN PAGE REGISTRY AUTHORITY V2.1
========================================
✔ Super Admin Page Registry
✔ Super Admin Module Registration
✔ Enterprise Core Registration Layer
✔ Single-path Initialization
✔ Enterprise-safe Routing Registry
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__SUPER_ADMIN_PAGE_REGISTRY__) return;

  window.__SUPER_ADMIN_PAGE_REGISTRY__ = true;

 console.log("[SUPER ADMIN PAGE REGISTRY] READY");

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
