"use strict";

/*
========================================
NAVIGATION CORE v2.0 (CLEAN CREATE)
========================================
✔ Single routing authority
✔ Works with Core Engine
✔ Works with Page Registry
✔ No duplicate listeners
✔ Safe enterprise navigation
✔ Production stable
========================================
*/

(function () {

  document.addEventListener("DOMContentLoaded", initNavigationCore);

})();

/* ================= INIT ================= */

function initNavigationCore() {

  const menu = document.querySelector(".menu");
  if (!menu) return;

  // Prevent duplicate binding (IMPORTANT FIX)
  if (menu.__NAV_BOUND__) return;
  menu.__NAV_BOUND__ = true;

  menu.addEventListener("click", routeClick);

  console.log("[NAV CORE] READY v2.0");
}

/* ================= ROUTE CLICK ================= */

function routeClick(e) {

  const btn = e.target.closest("button[data-page]");
  if (!btn) return;

  const page = btn.dataset.page;

  if (!page) return;

  navigate(page, btn);
}

/* ================= NAVIGATE ================= */

function navigate(page, btn) {

  try {

    setActive(btn);

    // STEP 1 → Core Engine (PRIMARY)
    if (window.ENTERPRISE_CORE_ENGINE?.run) {

      const result = window.ENTERPRISE_CORE_ENGINE.run(page);

      if (result !== undefined) {
        console.log("[NAV CORE] ENGINE ROUTED:", page);
        return;
      }
    }

    // STEP 2 → Page Registry fallback
    if (window.ENTERPRISE_CORE_ENGINE?.modules?.[page]) {
      window.ENTERPRISE_CORE_ENGINE.modules[page]();
      console.log("[NAV CORE] MODULE ROUTED:", page);
      return;
    }

    // STEP 3 → Global fallback
    if (typeof window[page] === "function") {
      window[page]();
      console.log("[NAV CORE] GLOBAL ROUTED:", page);
      return;
    }

    console.warn("[NAV CORE] NOT FOUND:", page);

  } catch (err) {
    console.error("[NAV CORE ERROR]", err);
  }
}

/* ================= ACTIVE UI ================= */

function setActive(btn) {

  document.querySelectorAll(".menu button")
    .forEach(b => b.classList.remove("active"));

  if (btn) btn.classList.add("active");
}

/* ================= GLOBAL ================= */

window.navigateTo = navigate;
