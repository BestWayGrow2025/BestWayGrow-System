"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.2 (FINAL STABLE - FIXED ROUTER)
========================================
✔ Safe CORE execution layer
✔ Button click ALWAYS works
✔ Fixed CORE routing compatibility
✔ Event-safe navigation
✔ Pending route queue support
✔ SYSTEM_READY compatible
✔ Production hardened
========================================
*/

(function () {

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

  /* ================= SAFE EXECUTOR (FIXED) ================= */

  function safeRun(page) {

    if (!page) return false;

    const CORE = getCore();

    try {

      // ✅ FIX: support BOTH run() and fallback execution
      if (CORE && typeof CORE.run === "function") {
        CORE.run(page);
        console.log("[DASHBOARD] ROUTED VIA CORE.run:", page);
        return true;
      }

      // 🔥 NEW FIX: some builds expose execute/route instead
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

      // fallback safeCoreRun
      if (typeof window.safeCoreRun === "function") {
        window.safeCoreRun(page);
        console.log("[DASHBOARD] ROUTED VIA safeCoreRun:", page);
        return true;
      }

      console.warn("[DASHBOARD] CORE NOT READY - QUEUED:", page);

      window.__PENDING_ROUTE__ = window.__PENDING_ROUTE__ || [];
      window.__PENDING_ROUTE__.push(page);

      return false;

    } catch (err) {
      console.error("[DASHBOARD ERROR]", page, err);
      return false;
    }
  }

  /* ================= NAVIGATION ================= */

  function handleNavigation(page) {
    return safeRun(page);
  }

  /* ================= BUTTON BINDING ================= */

  function bindButtons() {

    const buttons = document.querySelectorAll(".menu button");

    buttons.forEach(btn => {

      if (btn.__dashboardBound__) return;
      btn.__dashboardBound__ = true;

      btn.addEventListener("click", function () {

        const page = this.dataset.page;
        if (!page) return;

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
    if (!logoutBtn || logoutBtn.__dashboardBound__) return;

    logoutBtn.__dashboardBound__ = true;

    logoutBtn.addEventListener("click", function () {

      console.log("[DASHBOARD] LOGOUT CLICKED");

      try {

        if (window.SYSTEM_EVENTS?.emit) {
          window.SYSTEM_EVENTS.emit("LOGOUT_REQUESTED", {
            time: Date.now()
          });
        }

        const CORE = getCore();

        if (CORE?.run) {
          CORE.run("logout");
          return;
        }

        window.location.href = "index.html";

      } catch (err) {
        console.error("[DASHBOARD LOGOUT ERROR]", err);
      }
    });
  }

  /* ================= PENDING ROUTES ================= */

  function flushPendingRoutes() {

    const CORE = getCore();
    if (!CORE?.run) return;

    const pending = window.__PENDING_ROUTE__ || [];

    if (!pending.length) return;

    console.log("[DASHBOARD] FLUSHING PENDING ROUTES:", pending.length);

    pending.forEach(page => {
      try {
        CORE.run(page);
      } catch (err) {
        console.error("[FLUSH ERROR]", page, err);
      }
    });

    window.__PENDING_ROUTE__ = [];
  }

  /* ================= WELCOME ================= */

  function updateWelcome() {

    const el = document.getElementById("welcome");
    if (!el) return;

    try {
      const user = window.getCurrentUser?.();

      el.textContent = user?.userId
        ? "Welcome, " + user.userId
        : "Welcome, Super Admin";

    } catch {
      el.textContent = "Welcome, Super Admin";
    }
  }

  /* ================= DEFAULT PAGE ================= */

  function loadDefaultPage() {

    const content = document.getElementById("mainContent");

    if (content && content.innerHTML.trim() !== "") return;

    safeRun("home");

    const homeBtn =
      document.querySelector('.menu button[data-page="home"]');

    homeBtn?.classList.add("active");
  }

  /* ================= INIT ================= */

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

  /* ================= BOOT ================= */

  function bootWhenReady() {

    if (window.__SYSTEM_BOOT__?.ready) {
      initDashboard();
      return;
    }

    window.SYSTEM_EVENTS?.on?.("SYSTEM_READY", initDashboard)
      || document.addEventListener("DOMContentLoaded", initDashboard);
  }

  /* ================= EXPORT ================= */

  window.initDashboard = initDashboard;
  window.handleNavigation = handleNavigation;
  window.safeDashboardRun = safeRun;

  bootWhenReady();

  window.__DASHBOARD_LOADED__ = true;

  console.log("[DASHBOARD] READY");

})();
