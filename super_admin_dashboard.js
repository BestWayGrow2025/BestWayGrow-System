"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.2 (FINAL STABLE)
========================================
✔ Safe CORE execution layer
✔ Button click ALWAYS works
✔ Event-safe navigation
✔ Pending route queue support
✔ SYSTEM_READY compatible
✔ Duplicate initialization protection
✔ Logout handling
✔ Production hardened
========================================
*/

(function () {

  // ========================================
  // SINGLE INITIALIZATION LOCK
  // ========================================
  if (window.__SUPER_ADMIN_DASHBOARD__) {
    console.log("[DASHBOARD] Already Loaded");
    return;
  }

  window.__SUPER_ADMIN_DASHBOARD__ = {
    loaded: true,
    initialized: false,
    version: "4.2"
  };

  console.log("[DASHBOARD] LOADING");

  /* ================= SAFE CORE ACCESS ================= */

  function getCore() {
    return (
      window.ENTERPRISE_CORE_ENGINE ||
      window.__ENTERPRISE_CORE_ENGINE__ ||
      null
    );
  }

  /* ================= SAFE EXECUTOR ================= */

  function safeRun(page) {

    if (!page) return false;

    const CORE = getCore();

    try {

      // Preferred execution through CORE
      if (CORE && typeof CORE.run === "function") {
        CORE.run(page);
        console.log("[DASHBOARD] ROUTED VIA CORE:", page);
        return true;
      }

      // Secondary fallback
      if (typeof window.safeCoreRun === "function") {
        window.safeCoreRun(page);
        console.log("[DASHBOARD] ROUTED VIA safeCoreRun:", page);
        return true;
      }

      // Queue route if CORE not ready yet
      console.warn("[DASHBOARD] CORE NOT READY - QUEUED:", page);

      window.__PENDING_ROUTE__ = window.__PENDING_ROUTE__ || [];
      window.__PENDING_ROUTE__.push(page);

      return false;

    } catch (err) {
      console.error("[DASHBOARD ERROR]", page, err);
      return false;
    }
  }

  /* ================= PAGE ROUTER ================= */

  function handleNavigation(page) {
    return safeRun(page);
  }

  /* ================= BUTTON BINDING ================= */

  function bindButtons() {

    const buttons = document.querySelectorAll(".menu button");

    buttons.forEach(btn => {

      // Prevent duplicate binding
      if (btn.__dashboardBound__) return;
      btn.__dashboardBound__ = true;

      btn.addEventListener("click", function () {

        const page = this.dataset.page;

        if (!page) return;

        // Visual active state
        document
          .querySelectorAll(".menu button.active")
          .forEach(b => b.classList.remove("active"));

        this.classList.add("active");

        handleNavigation(page);
      });
    });

    console.log("[DASHBOARD] BUTTONS WIRED:", buttons.length);
  }

  /* ================= LOGOUT ================= */

  function bindLogout() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    // Prevent duplicate binding
    if (logoutBtn.__dashboardBound__) return;
    logoutBtn.__dashboardBound__ = true;

    logoutBtn.addEventListener("click", function () {

      console.log("[DASHBOARD] LOGOUT CLICKED");

      try {

        // Notify system
        if (window.SYSTEM_EVENTS &&
            typeof window.SYSTEM_EVENTS.emit === "function") {

          window.SYSTEM_EVENTS.emit("LOGOUT_REQUESTED", {
            time: Date.now()
          });
        }

        // Route via CORE if available
        const CORE = getCore();

        if (CORE && typeof CORE.run === "function") {
          CORE.run("logout");
          return;
        }

        // Fallback to session manager
        if (typeof window.logout === "function") {
          window.logout();
          return;
        }

        // Final fallback
        window.location.href = "index.html";

      } catch (err) {
        console.error("[DASHBOARD] LOGOUT ERROR", err);
      }
    });
  }

  /* ================= PENDING ROUTE FLUSH ================= */

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

  /* ================= WELCOME SECTION ================= */

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

  /* ================= DEFAULT PAGE ================= */

  function loadDefaultPage() {

    // If page already loaded elsewhere, do nothing
    const content = document.getElementById("mainContent");

    if (content && content.innerHTML.trim() !== "") {
      return;
    }

    // Load home page by default
    safeRun("home");

    // Highlight Home button
    const homeBtn =
      document.querySelector('.menu button[data-page="home"]');

    if (homeBtn) {
      homeBtn.classList.add("active");
    }
  }

  /* ================= INIT ================= */

  function initDashboard() {

    // Prevent duplicate initialization
    if (window.__SUPER_ADMIN_DASHBOARD__.initialized) {
      console.log("[DASHBOARD] Already Initialized");
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

  /* ================= BOOT HOOK ================= */

  function bootWhenReady() {

    // Boot manager already completed
    if (window.__SYSTEM_BOOT__ &&
        window.__SYSTEM_BOOT__.ready) {

      initDashboard();
      return;
    }

    // Preferred event-driven startup
    if (window.SYSTEM_EVENTS &&
        typeof window.SYSTEM_EVENTS.on === "function") {

      window.SYSTEM_EVENTS.on("SYSTEM_READY", initDashboard);
      return;
    }

    // DOM fallback
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        initDashboard
      );
    } else {
      setTimeout(initDashboard, 1000);
    }
  }

  /* ================= GLOBAL EXPORT ================= */

  window.initDashboard = initDashboard;
  window.handleNavigation = handleNavigation;
  window.safeDashboardRun = safeRun;

  /* ================= START ================= */

  bootWhenReady();

  /* ================= DEBUG FLAGS ================= */

  window.__DASHBOARD_LOADED__ = true;

  console.log("[DASHBOARD] READY");

})();
