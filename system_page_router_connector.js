"use strict";

/*
========================================
SYSTEM PAGE ROUTER CONNECTOR V2.1 FINAL
+ STEP 1 FIX (UI RESET HARDENED)
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

  // ================= UI RESET (FIX ADDED) =================
  function clearMainContent() {

    const main = document.getElementById("mainContent");

    if (!main) {
      console.warn("[ROUTER] mainContent missing");
      return;
    }

    // HARD RESET (prevents stacking dashboards)
    main.innerHTML = "";

    // optional cleanup marker
    main.removeAttribute("data-loaded-module");
  }

  // ================= INIT =================
  function initSystemPageRouter() {

    const menu = document.querySelector(".menu");

    if (!menu) {
      console.warn("[PAGE ROUTER] Menu Missing");
      return;
    }

    // Prevent duplicate binding
    if (menu.__PAGE_ROUTER_BOUND__) return;

    menu.__PAGE_ROUTER_BOUND__ = true;

    menu.addEventListener("click", handlePageNavigation);

    console.log("[PAGE ROUTER] READY");
  }

  // ================= HANDLE NAVIGATION =================
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

  // ================= OPEN PAGE =================
  function openSystemPage(page) {

    try {

      // 🔥 STEP 1 FIX APPLIED HERE (CRITICAL)
      clearMainContent();

      if (!page) return false;

      // prevent reload spam
      if (window.__CURRENT_PAGE__ === page) {
        console.log("[PAGE ROUTER] Already on page:", page);
        return false;
      }

      window.__CURRENT_PAGE__ = page;

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
