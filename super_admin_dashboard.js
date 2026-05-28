"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.4 FINAL
========================================
✔ Safe CORE execution layer
✔ Button click ALWAYS works
✔ Fixed CORE routing compatibility
✔ Event-safe navigation
✔ BACK button fix applied
✔ Pending route cleanup
✔ Production stable
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
    version: "4.4"
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

      // PRIMARY ENGINE
      if (CORE && typeof CORE.run === "function") {
        CORE.run(page);
        console.log("[DASHBOARD] ROUTED VIA CORE.run:", page);
        return true;
      }

      // SECONDARY ENGINE METHODS
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

      // MODULE LOADER FALLBACK
      if (typeof window.executeSuperAdminModule === "function") {
        window.executeSuperAdminModule(page);
        console.log("[DASHBOARD] ROUTED VIA MODULE LOADER:", page);
        return true;
      }

      // CONNECTOR FALLBACK
      if (typeof window.connectSystemModule === "function") {
        window.connectSystemModule(page);
        console.log("[DASHBOARD] ROUTED VIA CONNECTOR:", page);
        return true;
      }

      // QUEUE UNTIL READY
      console.warn("[DASHBOARD] CORE NOT READY - QUEUED:", page);

      window.__PENDING_ROUTE__ =
        window.__PENDING_ROUTE__ || [];

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
     ACTIVE BUTTON UI
  ======================================== */

  function setActiveButton(activeBtn) {

    document.querySelectorAll(".menu button.active")
      .forEach(btn => btn.classList.remove("active"));

    if (activeBtn) {
      activeBtn.classList.add("active");
    }
  }

  /* ========================================
     MENU BUTTONS
  ======================================== */

  function bindButtons() {

    const buttons =
      document.querySelectorAll(".menu button");

    buttons.forEach(btn => {

      if (btn.__dashboardBound__) return;

      btn.__dashboardBound__ = true;

      btn.addEventListener("click", function () {

        const page = this.dataset.page;

        if (!page) return;

        setActiveButton(this);

        handleNavigation(page);
      });
    });

    console.log("[DASHBOARD] BUTTONS WIRED:", buttons.length);
  }

  /* ========================================
     BACK BUTTON FIX (NEW)
  ======================================== */

  function bindBackButton() {

    const backBtn =
      document.getElementById("backBtn");

    if (!backBtn) return;

    if (backBtn.__dashboardBound__) return;

    backBtn.__dashboardBound__ = true;

    backBtn.addEventListener("click", function () {

      console.log("[DASHBOARD] BACK CLICKED");

      try {

        document.querySelectorAll(".menu button")
          .forEach(btn => btn.classList.remove("active"));

        safeRun("home");

        if (window.__PENDING_ROUTE__) {
          window.__PENDING_ROUTE__ = [];
        }

        console.log("[DASHBOARD] RETURNED TO HOME");

      } catch (err) {
        console.error("[BACK BUTTON ERROR]", err);
      }
    });
  }

  /* ========================================
     LOGOUT
  ======================================== */

  function bindLogout() {

    const logoutBtn =
      document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    if (logoutBtn.__dashboardBound__) return;

    logoutBtn.__dashboardBound__ = true;

    logoutBtn.addEventListener("click", function () {

      console.log("[DASHBOARD] LOGOUT CLICKED");

      try {

        if (
          window.SYSTEM_EVENTS &&
          typeof window.SYSTEM_EVENTS.emit === "function"
        ) {
          window.SYSTEM_EVENTS.emit("LOGOUT_REQUESTED", {
            time: Date.now()
          });
        }

        if (typeof window.logout === "function") {
          window.logout();
          return;
        }

        if (typeof window.clearSession === "function") {
          window.clearSession();
        }

        localStorage.removeItem("currentUser");
        localStorage.removeItem("sessionUser");
        localStorage.removeItem("activeUser");
        sessionStorage.clear();

        window.location.href = "index.html";

      } catch (err) {
        console.error("[DASHBOARD LOGOUT ERROR]", err);
        window.location.href = "index.html";
      }
    });
  }

  /* ========================================
     PENDING ROUTE FLUSH
  ======================================== */

  function flushPendingRoutes() {

    const pending = window.__PENDING_ROUTE__ || [];

    if (!Array.isArray(pending) || pending.length === 0) return;

    console.log("[DASHBOARD] FLUSHING:", pending.length);

    pending.forEach(page => {
      try {
        safeRun(page);
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
            "Welcome, " + (user.username || user.userId);
          return;
        }
      }

      el.textContent = "Welcome, Super Admin";

    } catch (err) {
      el.textContent = "Welcome, Super Admin";
    }
  }

/* ======================================== DEFAULT PAGE ======================================== */
function loadDefaultPage() {
// PREVENT FORCE HOME AFTER FIRST LOAD if (window.DEFAULT_HOME_LOADED) { return; }
const content = document.getElementById("mainContent");
// CONTENT ALREADY EXISTS if ( content && content.innerHTML.trim() !== "" ) { return; }
// LOCK DEFAULT HOME window.DEFAULT_HOME_LOADED = true;
// LOAD HOME safeRun("home");
const homeBtn = document.querySelector( '.menu button[data-page="home"]' );
setActiveButton(homeBtn); }

  /* ========================================
     INIT
  ======================================== */

  function initDashboard() {

    if (window.__SUPER_ADMIN_DASHBOARD__.initialized) {
      flushPendingRoutes();
      return;
    }

    console.log("[DASHBOARD] INIT START");

    bindButtons();
    bindLogout();
    bindBackButton();   // ✅ BACK BUTTON FIX ADDED HERE
    updateWelcome();

    window.__SUPER_ADMIN_DASHBOARD__.initialized = true;

    flushPendingRoutes();
    loadDefaultPage();

    console.log("[DASHBOARD] ACTIVE");
  }

  /* ========================================
     BOOT
  ======================================== */

  function bootWhenReady() {

    if (window.__SYSTEM_BOOT__ && window.__SYSTEM_BOOT__.ready) {
      initDashboard();
      return;
    }

    if (window.SYSTEM_EVENTS && typeof window.SYSTEM_EVENTS.on === "function") {
      window.SYSTEM_EVENTS.on("SYSTEM_READY", initDashboard);
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initDashboard);
    } else {
      setTimeout(initDashboard, 500);
    }
  }

  /* ========================================
     EXPORTS
  ======================================== */

  window.initDashboard = initDashboard;
  window.handleNavigation = handleNavigation;
  window.safeDashboardRun = safeRun;

  /* ========================================
     START
  ======================================== */

  bootWhenReady();

  window.__DASHBOARD_LOADED__ = true;

  console.log("[DASHBOARD] READY");

})();
