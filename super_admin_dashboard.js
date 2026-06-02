"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.5 SYSTEM ALIGNED
========================================
✔ Contract-first enforcement
✔ Dispatcher-based routing only
✔ Event-bus integrated
✔ No legacy engine references
✔ Bootstrap connector compliant
✔ Safe UI state handling
========================================
*/

(function () {

  // ================= INIT GUARD =================
  if (window.__SUPER_ADMIN_DASHBOARD__) return;

  window.__SUPER_ADMIN_DASHBOARD__ = {
    loaded: true,
    initialized: false,
    version: "4.5"
  };

  console.log("[DASHBOARD] LOADING");

  // ================= CONTRACT SAFETY =================
  function ensureContract() {

    if (!window.PIN_GLOBAL_CONTRACT) {
      console.error("[DASHBOARD] CONTRACT MISSING");
      throw new Error("DASHBOARD BLOCKED: NO CONTRACT");
    }
  }

  // ================= SAFE DISPATCH =================
  function dispatch(page) {

    if (!page) return false;

    try {

      // PRIMARY SYSTEM ROUTE
      if (typeof window.dispatchPinAction === "function") {

        window.dispatchPinAction("NAVIGATE", {
          page
        });

        window.broadcastPinEvent?.("DASHBOARD_NAVIGATION", {
          page
        });

        console.log("[DASHBOARD] DISPATCHED:", page);

        return true;
      }

      // FALLBACK EVENT ONLY
      if (typeof window.broadcastPinEvent === "function") {

        window.broadcastPinEvent("NAVIGATE_REQUEST", { page });

        return true;
      }

      console.warn("[DASHBOARD] NO ROUTER AVAILABLE");

      return false;

    } catch (err) {

      console.error("[DASHBOARD ERROR]", err);
      return false;
    }
  }

  // ================= UI STATE =================
  function setActiveButton(btn) {

    document.querySelectorAll(".menu button.active")
      .forEach(b => b.classList.remove("active"));

    if (btn) btn.classList.add("active");
  }

  // ================= BUTTON BIND =================
  function bindButtons() {

    document.querySelectorAll(".menu button").forEach(btn => {

      if (btn.__bound__) return;

      btn.__bound__ = true;

      btn.addEventListener("click", function () {

        const page = this.dataset.page;

        if (!page) return;

        setActiveButton(this);

        dispatch(page);
      });
    });
  }

  // ================= BACK =================
  function bindBack() {

    const back = document.getElementById("backBtn");

    if (!back || back.__bound__) return;

    back.__bound__ = true;

    back.addEventListener("click", function () {

      setActiveButton(null);

      dispatch("home");
    });
  }

  // ================= LOGOUT =================
  function bindLogout() {

    const logout = document.getElementById("logoutBtn");

    if (!logout || logout.__bound__) return;

    logout.__bound__ = true;

    logout.addEventListener("click", function () {

      window.broadcastPinEvent?.("LOGOUT_REQUESTED", {
        time: Date.now()
      });

      if (typeof window.logout === "function") {
        window.logout();
        return;
      }

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "index.html";
    });
  }

  // ================= PENDING ROUTES =================
  function flushPending() {

    const pending = window.__PENDING_ROUTE__ || [];

    if (!Array.isArray(pending) || pending.length === 0) return;

    pending.forEach(p => dispatch(p));

    window.__PENDING_ROUTE__ = [];
  }

  // ================= WELCOME =================
  function updateWelcome() {

    const el = document.getElementById("welcome");

    if (!el) return;

    const user = window.getCurrentUser?.();

    el.textContent =
      user?.username
        ? "Welcome, " + user.username
        : "Welcome, Super Admin";
  }

  // ================= DEFAULT PAGE =================
  function loadDefault() {

    if (window.__DEFAULT_LOADED__) return;

    const content = document.getElementById("mainContent");

    if (content && content.innerHTML.trim()) return;

    window.__DEFAULT_LOADED__ = true;

    dispatch("home");

    const homeBtn =
      document.querySelector('.menu button[data-page="home"]');

    setActiveButton(homeBtn);
  }

  // ================= INIT =================
  function init() {

    try {

      ensureContract();

      bindButtons();
      bindBack();
      bindLogout();

      updateWelcome();

      window.__SUPER_ADMIN_DASHBOARD__.initialized = true;

      flushPending();
      loadDefault();

      console.log("[DASHBOARD] ACTIVE");

    } catch (err) {

      console.error("[DASHBOARD INIT FAILED]", err);
    }
  }

  // ================= BOOT =================
  function boot() {

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      setTimeout(init, 0);
    }
  }

  // ================= EXPORT =================
  window.initDashboard = init;
  window.safeDashboardRun = dispatch;
  window.handleNavigation = dispatch;

  // ================= START =================
  boot();

  window.__DASHBOARD_LOADED__ = true;

  console.log("[DASHBOARD] READY");

})();
