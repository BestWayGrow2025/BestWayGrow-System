"use strict";

/*
========================================
NAVIGATION CORE v2.1 FINAL
========================================
✔ Single routing authority
✔ Works with Core Engine
✔ Works with Page Registry
✔ No duplicate listeners
✔ Safe enterprise navigation
✔ Production stable
✔ Runtime-safe active switching
✔ Duplicate DOM binding prevention
========================================
*/

(function () {

  if (window.__NAVIGATION_CORE__) return;

  window.__NAVIGATION_CORE__ = true;

  document.addEventListener(
    "DOMContentLoaded",
    initNavigationCore
  );

})();

/* ================= INIT ================= */

function initNavigationCore() {

  const menu =
    document.querySelector(".menu");

  if (!menu) return;

  // Prevent duplicate binding
  if (menu.__NAV_BOUND__) return;

  menu.__NAV_BOUND__ = true;

  menu.addEventListener(
    "click",
    routeClick
  );

  console.log(
    "[NAV CORE] READY v2.1"
  );
}

/* ================= ROUTE CLICK ================= */

function routeClick(e) {

  const btn =
    e.target.closest(
      "button[data-page]"
    );

  if (!btn) return;

  const page =
    btn.dataset.page;

  if (!page) return;

  navigate(page, btn);
}

/* ================= NAVIGATE ================= */

function navigate(page, btn) {

  try {

    setActive(btn);

    // ================= PRIMARY ENGINE =================
    if (
      window
        .ENTERPRISE_CORE_ENGINE
        ?.run
    ) {

      const result =
        window
          .ENTERPRISE_CORE_ENGINE
          .run(page);

      if (result !== undefined) {

        console.log(
          "[NAV CORE] ENGINE ROUTED:",
          page
        );

        return;
      }
    }

    // ================= MODULE REGISTRY =================
    if (
      window
        .ENTERPRISE_CORE_ENGINE
        ?.modules?.[page]
    ) {

      window
        .ENTERPRISE_CORE_ENGINE
        .modules[page]();

      console.log(
        "[NAV CORE] MODULE ROUTED:",
        page
      );

      return;
    }

    // ================= GLOBAL FALLBACK =================
    if (
      typeof window[page] ===
      "function"
    ) {

      window[page]();

      console.log(
        "[NAV CORE] GLOBAL ROUTED:",
        page
      );

      return;
    }

    console.warn(
      "[NAV CORE] NOT FOUND:",
      page
    );

  } catch (err) {

    console.error(
      "[
