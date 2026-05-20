"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.3 (FINAL STABLE)
========================================
✔ Safe CORE execution layer
✔ Button click ALWAYS works
✔ Fixed CORE routing compatibility
✔ Event-safe navigation
✔ Pending route queue support
✔ SYSTEM_READY compatible
✔ Logout fully fixed
✔ Production hardened
========================================
*/

(function () {

  // ========================================
  // SINGLE LOAD PROTECTION
  // ========================================
  if (window.__SUPER_ADMIN_DASHBOARD__) {
    console.log("[DASHBOARD] Already Loaded");
    return;
  }

  window.__SUPER_ADMIN_DASHBOARD__ = {
    loaded: true,
    initialized: false,
    version: "4.3"
  };

  console.log("[DASHBOARD] LOADING");

  /* ========================================
     SAFE CORE ACCESS
  ======================================== */

  function getCore() {
    return (
      window.ENTERPRISE_CORE_ENGINE ||
      window.__ENTERPRISE_CORE_ENGINE__ ||
      null
    );
  }

  /* ========================================
     SAFE PAGE EXECUTION
  ======================================== */

  function safeRun(page) {

    if (!page) return false;

    const CORE = getCore();

    try {

      // Primary router
      if (CORE && typeof CORE.run === "function") {
        CORE.run(page);
        console.log("[DASHBOARD] ROUTED VIA CORE.run:", page);
        return true;
      }

      // Alternate router methods
      if (CORE && typeof CORE.execute === "function") {
        CORE.execute(page);
        console.log("[DASHBOARD] ROUTED VIA CORE.execute:", page);
        return true;
      }

      if (CORE && typeof CORE.route === "function") {
        CORE.route(page);
        console.log("[DASHBOARD] ROUTED VIA CORE.route:", page);
        return true;
      }

      // Legacy fallback
      if (typeof window.safeCoreRun === "function") {
        window.safeCoreRun(page);
        console.log("[DASHBOARD] ROUTED VIA safeCoreRun:", page);
        return true;
      }

      // Queue until system becomes ready
      console.warn("[DASHBOARD] CORE NOT READY - QUEUED:", page);

      window.__PENDING_ROUTE__ = window.__PENDING_ROUTE__ || [];
      window.__PENDING_ROUTE__.push(page);

      return false;

    } catch (err) {
      console.error("[DASHBOARD ERROR]", page, err);
      return false;
    }
  }

  /* ========================================
     NAVIGATION HANDLER
  ======================================== */

  function handleNavigation(page) {
    return safeRun(page);
  }

  /* ========================================
     MENU BUTTONS
  ======================================== */

  function bindButtons() {

    const buttons = document.querySelectorAll(".menu button");

    buttons.forEach(btn => {

      if (btn.__dashboardBound__) return;
      btn.__dashboardBound__ = true;

      btn.addEventListener("click", function () {

        const page = this.dataset.page;
        if (!page) return;

        // Active button highlight
        document
          .querySelectorAll(".menu button.active")
          .forEach(b => b.classList.remove("active"));

        this.classList.add("active");

        handleNavigation(page);
      });
    });

    console.log("[DASHBOARD] BUTTONS WIRED:", buttons.length);
  }

  /* ========================================
     LOGOUT (FULLY FIXED)
  ======================================== */

  function bindLogout() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;
    if (logoutBtn.__dashboardBound__) return;

    logoutBtn.__dashboardBound__ = true;

    logoutBtn.addEventListener("click", function () {

      console.log("[DASHBOARD] LOGOUT CLICKED");

      try {

        // Emit system event
        if (
          window.SYSTEM_EVENTS &&
          typeof window.SYSTEM_EVENTS.emit === "function"
        ) {
          window.SYSTEM_EVENTS.emit("LOGOUT_REQUESTED", {
            time: Date.now()
          });
        }

        // Preferred logout()
        if (typeof window.logout === "function") {
          window.logout();
          return;
        }

        // Secondary clearSession()
        if (typeof window.clearSession === "function") {
          window.clearSession();
        }

        // Clear common storage keys
        try {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("sessionUser");
          localStorage.removeItem("activeUser");
          sessionStorage.clear();
        } catch (storageErr) {
          console.warn("[DASHBOARD] Storage cleanup warning", storageErr);
        }

        // Final redirect
        window.location.href = "index.html";

      } catch (err) {
        console.error("[DASHBOARD LOGOUT ERROR]", err);

        // Emergency redirect
        window.location.href = "index.html";
      }
    });
  }

  /* ========================================
     PENDING ROUTE FLUSH
  ======================================== */

  function flushPendingRoutes() {

    const CORE = getCore();

    if (!CORE || typeof CORE.run !== "function") return;

    const pending = window.__PENDING_ROUTE__ || [];

    if (!Array.isArray(pending) || pending.length === 0) {
      return;
    }

    console.log(
      "[DASHBOARD] FLUSHING PENDING ROUTES:",
      pending.length
    );

    pending.forEach(page => {
      try {
        CORE.run(page);
      } catch (err) {
        console.error("[FLUSH ERROR]", page, err);
      }
    });

    window.__PENDING_ROUTE__ = [];
  }

  /* ========================================
     WELCOME MESSAGE
  ======================================== */

  function updateWelcome() {

    const el = document.getElementById("welcome");
    if (!el) return;

    try {

      if (typeof window.getCurrentUser === "function") {
        const user = window.getCurrentUser();

        if (user && (user.username || user.userId)) {
          el.textContent =
            "Welcome, " +
            (user.username || user.userId);
          return;
        }
      }

      el.textContent = "Welcome, Super Admin";

    } catch (err) {
      el.textContent = "Welcome, Super Admin";
    }
  }

  /* ========================================
     DEFAULT PAGE
  ======================================== */

  function loadDefaultPage() {

    const content = document.getElementById("mainContent");

    if (content && content.innerHTML.trim() !== "") {
      return;
    }

    safeRun("home");

    const homeBtn =
      document.querySelector('.menu button[data-page="home"]');

    if (homeBtn) {
      homeBtn.classList.add("active");
    }
  }

  /* ========================================
     INITIALIZATION
  ======================================== */

  function initDashboard() {

    if (window.__SUPER_ADMIN_DASHBOARD__.initialized) {
      flushPendingRoutes();
      return;
    }

    console.log("[DASHBOARD] INIT START");

    bindButtons();
    bindLogout();
    updateWelcome();

    window.__SUPER_ADMIN_DASHBOARD__.initialized = true;

    flushPendingRoutes();
    loadDefaultPage();

    console.log("[DASHBOARD] ACTIVE");
  }

  /* ========================================
     BOOT WHEN READY
  ======================================== */

  function bootWhenReady() {

    if (
      window.__SYSTEM_BOOT__ &&
      window.__SYSTEM_BOOT__.ready
    ) {
      initDashboard();
      return;
    }

    if (
      window.SYSTEM_EVENTS &&
      typeof window.SYSTEM_EVENTS.on === "function"
    ) {
      window.SYSTEM_EVENTS.on("SYSTEM_READY", initDashboard);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        initDashboard
      );
    } else {
      setTimeout(initDashboard, 1000);
    }
  }

  /* ========================================
     GLOBAL EXPORTS
  ======================================== */

  window.initDashboard = initDashboard;
  window.handleNavigation = handleNavigation;
  window.safeDashboardRun = safeRun;

  /* ========================================
     STARTUP
  ======================================== */

  bootWhenReady();

  window.__DASHBOARD_LOADED__ = true;

  console.log("[DASHBOARD] READY");

})();
