"use strict";

/*
========================================
PIN ROLE UI FILTER v1.0
========================================
✔ Auto hides forbidden menu items
✔ Syncs UI with role controller
✔ Prevents invalid navigation clicks
========================================
*/

(function () {

  if (window.__PIN_ROLE_UI_FILTER__) return;
  window.__PIN_ROLE_UI_FILTER__ = true;

  function filterMenu() {

    const roleSystem = window.PIN_ROLE_ACCESS;
    if (!roleSystem) return;

    const buttons = document.querySelectorAll(".menu button");

    buttons.forEach(btn => {

      const page = btn.getAttribute("data-page");
      if (!page) return;

      const allowed = roleSystem.hasAccess
        ? roleSystem.hasAccess(page)
        : true;

      if (!allowed) {
        btn.style.display = "none";
        btn.disabled = true;
      }
    });

    console.log("[ROLE UI FILTER] Menu synced");
  }

  function init() {
    filterMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
