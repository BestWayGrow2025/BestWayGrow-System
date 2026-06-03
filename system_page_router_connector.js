"use strict";

/*
========================================
SYSTEM PAGE ROUTER CONNECTOR V3.0
ENTERPRISE GUARANTEE LAYER (FIXED FINAL)
========================================
✔ Role Security
✔ UI Reset
✔ Navigation Audit
✔ UI State Manager
✔ Module Verification
✔ Fallback Recovery
✔ Safe Global Routing
✔ No DOM dependency on .menu
✔ Production Stable
========================================
*/

(function () {

  // ================= GUARD =================
  if (window.SYSTEM_PAGE_ROUTER) {
    console.log("[PAGE ROUTER] Already Loaded");
    return;
  }

  window.SYSTEM_PAGE_ROUTER = true;
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

  // ================= ROLE CHECK =================
  function checkAccess(page) {
    if (!window.PIN_ROLE_ACCESS?.requireAccess) {
      console.warn("[PAGE ROUTER] ROLE SYSTEM NOT LOADED");
      return true;
    }

    return window.PIN_ROLE_ACCESS.requireAccess(page);
  }

  // ================= MODULE VERIFY =================
  function verifyModule(page) {
    setTimeout(function () {

      const result = window.SYSTEM_MODULE_VERIFIER?.verify(page);

      if (!result) return;

      if (result.success) {
        window.SYSTEM_NAVIGATION_AUDIT?.navigationLoaded(page);
      } else {
        window.SYSTEM_NAVIGATION_AUDIT?.navigationFailed(page);

        window.SYSTEM_FALLBACK_RECOVERY?.show(
          page,
          result.reason || "MODULE_VERIFICATION_FAILED"
        );
      }

    }, 100);
  }

  // ================= OPEN PAGE =================
  function openSystemPage(page) {

    try {

      if (!page) return false;

      // ================= AUDIT =================
      window.SYSTEM_NAVIGATION_AUDIT?.navigationRequested(page);

      // ================= ROLE SECURITY =================
      if (!checkAccess(page)) {
        window.SYSTEM_NAVIGATION_AUDIT?.navigationFailed(page);
        return false;
      }

      // ================= PREVENT DOUBLE LOAD =================
      if (window.__CURRENT_PAGE__ === page) {
        console.log("[PAGE ROUTER] Already on page:", page);
        return false;
      }

      window.__CURRENT_PAGE__ = page;

      // ================= UI STATE =================
      window.SYSTEM_UI_STATE?.update({
        page,
        module: page
      });

      // ================= RESET UI =================
      clearMainContent();

      // ================= MAIN LOADER =================
      if (typeof window.connectSystemModule === "function") {

        window.connectSystemModule(page);
        verifyModule(page);

        console.log("[PAGE ROUTER] CONNECTED:", page);
        return true;
      }

      // ================= FALLBACK LOADER =================
      if (typeof window.loadSystemModule === "function") {

        window.loadSystemModule(page);
        verifyModule(page);

        console.log("[PAGE ROUTER] LOADED:", page);
        return true;
      }

      // ================= FINAL FALLBACK UI =================
      const main = document.getElementById("mainContent");

      if (main) {
        main.innerHTML = `
          <div style="padding:20px">
            <h3>⚠ Module Loader Missing</h3>
            <p>Page: <b>${page}</b></p>
          </div>
        `;
      }

      window.SYSTEM_NAVIGATION_AUDIT?.navigationFailed(page);

      return false;

    } catch (err) {

      console.error("[PAGE ROUTER ERROR]", err);

      window.SYSTEM_FALLBACK_RECOVERY?.show(
        page,
        err?.message || "ROUTER_EXCEPTION"
      );

      return false;
    }
  }

  // ================= CLICK BIND (FIXED GLOBAL SAFE) =================
  function bindNavigation() {

    if (document.__routerBound__) return;
    document.__routerBound__ = true;

    document.addEventListener("click", function (e) {

      const btn = e.target.closest("[data-page]");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const page = btn.getAttribute("data-page");
      if (!page) return;

      openSystemPage(page);
    });

    console.log("[PAGE ROUTER] CLICK BIND READY");
  }

  // ================= INIT =================
  function initSystemPageRouter() {
    bindNavigation();
    console.log("[PAGE ROUTER] READY");
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
