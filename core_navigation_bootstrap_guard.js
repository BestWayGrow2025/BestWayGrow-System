 "use strict";

/*
========================================
CORE NAVIGATION BOOTSTRAP GUARD v2.1
========================================
✔ Passive navigation protection
✔ Enterprise-safe
✔ Prevents duplicate initialization
✔ Router delegated to: core_page_router_connector.js
✔ Production stable
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.CORE_NAVIGATION_BOOTSTRAP_GUARD) {
    console.log("[CORE NAVIGATION GUARD] Already Loaded");
    return;
  }

  window.CORE_NAVIGATION_BOOTSTRAP_GUARD = true;

  console.log("[CORE NAVIGATION GUARD] READY");

})();
