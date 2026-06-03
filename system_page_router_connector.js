"use strict";

/*
========================================
SYSTEM PAGE ROUTER CONNECTOR V2.2 FINAL
+ ROLE SECURITY INTEGRATION (STEP 4)
+ UI RESET HARDENED
+ SINGLE SOURCE OF TRUTH FLOW
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.__SYSTEM_PAGE_ROUTER__) {
    console.log("[PAGE ROUTER] Already Loaded");
    return;
  }

  window.__SYSTEM_PAGE_ROUTER__ = true;

  console.log("[PAGE ROUTER] Initializing");

  // ================= UI RESET =================
  function clearMainContent() {

    const main = document.getElementById("mainContent");

    if (!main) {
      console.warn("[ROUTER] mainContent missing");
      return;
    }

    main.innerHTML = "";
    main.removeAttribute("data-loaded-module");
  }

  // ================= ROLE CHECK WRAPPER =================
  function checkAccess(page) {

    if (!window.PIN_ROLE_ACCESS?.requireAccess) {
      console.warn("[PAGE ROUTER] ROLE SYSTEM NOT LOADED");
      return true; // fail-safe mode
    }

    return window.PIN_ROLE_ACCESS.requireAccess(page);
  }

  // ================= INIT =================
  function initSystemPageRouter() {

    const menu = document.querySelector(".menu");

    if (!menu) {
      console.warn("[PAGE ROUTER] Menu Missing");
      return;
    }

    if (menu.__PAGE_ROUTER_BOUND__) return;

    menu.__PAGE_ROUTER_BOUND__ = true;

    menu.addEventListener("click", handlePageNavigation);

    console.log("[PAGE ROUTER] READY");
  }

  // ================= NAVIGATION HANDLER =================
  function handlePageNavigation(e) {

    const btn = e.target.closest("[data-page]");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const page = btn.getAttribute("data-page");
    if (!page) return;

    openSystemPage(page);
  }

  // ================= MAIN ROUTER EXECUTION =================
  function openSystemPage(page) {

    try {

      if (!page) return false;

      // ================= ROLE SECURITY GATE (STEP 4) =================
      if (!checkAccess(page)) {
        console.warn("[PAGE ROUTER] ACCESS DENIED:", page);
        return false;
      }

      // ================= PREVENT RELOAD =================
      if (window.__CURRENT_PAGE__ === page) {
        console.log("[PAGE ROUTER] Already on page:", page);
        return false;
      }

      window.__CURRENT_PAGE__ = page;

      // ================= UI RESET =================
      clearMainContent();

      // ================= PRIMARY CONNECTOR =================
      if (typeof window.connectSystemModule === "function") {

        window.connectSystemModule(page);
        console.log("[PAGE ROUTER] MODULE CONNECTED:", page);
        return true;
      }

      // ================= FALLBACK LOADER =================
      if (typeof window.loadSystemModule === "function") {

        window.loadSystemModule(page);
        console.log("[PAGE ROUTER] MODULE LOADED:", page);
        return true;
      }

      // ================= SAFE FALLBACK UI =================
      const main = document.getElementById("mainContent");

      if (!main) {
        console.warn("[PAGE ROUTER] mainContent Missing");
        return false;
      }

      main.innerHTML = `
        <div class="page-router-fallback">
          <h3>⚠ Module Loader Missing</h3>
          <p>Unable to load page: <b>${page}</b></p>
        </div>
      `;

      console.warn("[PAGE ROUTER] Loader Missing For:", page);

      return false;

    } catch (err) {

      console.error("[PAGE ROUTER ERROR]", err);
      return false;
    }
  }

  // ================= AUTO INIT =================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSystemPageRouter);
  } else {
    initSystemPageRouter();
  }

  // ================= EXPORT =================
  window.openSystemPage = openSystemPage;

})();
