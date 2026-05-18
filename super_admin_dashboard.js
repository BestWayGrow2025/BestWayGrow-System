"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.1 (STABLE FIX)
========================================
✔ Safe CORE execution layer
✔ Button click ALWAYS works
✔ Event-safe navigation
✔ No dependency timing crash
✔ SYSTEM_READY compatible
========================================
*/

console.log("[DASHBOARD] LOADING");

/* ================= SAFE CORE ACCESS ================= */

function getCore() {
  return window.ENTERPRISE_CORE_ENGINE ||
         window.__ENTERPRISE_CORE_ENGINE__;
}

/* ================= SAFE EXECUTOR ================= */

function safeRun(page) {

  const CORE = getCore();

  try {

    if (CORE && typeof CORE.run === "function") {
      CORE.run(page);
      console.log("[DASHBOARD] ROUTED VIA CORE:", page);
      return;
    }

    // fallback (IMPORTANT FIX)
    console.warn("[DASHBOARD] CORE NOT READY - QUEUED:", page);

    window.__PENDING_ROUTE__ = window.__PENDING_ROUTE__ || [];
    window.__PENDING_ROUTE__.push(page);

  } catch (err) {
    console.error("[DASHBOARD ERROR]", err);
  }
}

/* ================= BUTTON ROUTER ================= */

function handleNavigation(page) {
  safeRun(page);
}

/* ================= BUTTON BINDING ================= */

function bindButtons() {

  const buttons = document.querySelectorAll(".menu button");

  buttons.forEach(btn => {

    btn.addEventListener("click", function () {

      const page = this.dataset.page;

      if (!page) return;

      handleNavigation(page);

    });

  });

  console.log("[DASHBOARD] BUTTONS WIRED:", buttons.length);
}

/* ================= LOGOUT ================= */

function bindLogout() {

  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {

    console.log("[DASHBOARD] LOGOUT CLICKED");

    const CORE = getCore();

    if (window.SYSTEM_EVENTS) {
      window.SYSTEM_EVENTS.emit("LOGOUT_REQUESTED", {
        time: Date.now()
      });
    }

    if (CORE && typeof CORE.run === "function") {
      CORE.run("logout");
    }

  });
}

/* ================= SYSTEM READY SYNC ================= */

function flushPendingRoutes() {

  const CORE = getCore();

  if (!CORE || typeof CORE.run !== "function") return;

  const pending = window.__PENDING_ROUTE__ || [];

  if (pending.length === 0) return;

  console.log("[DASHBOARD] FLUSHING PENDING ROUTES:", pending.length);

  pending.forEach(page => {
    try {
      CORE.run(page);
    } catch (e) {
      console.error("[FLUSH ERROR]", page, e);
    }
  });

  window.__PENDING_ROUTE__ = [];
}

/* ================= INIT ================= */

function initDashboard() {

  console.log("[DASHBOARD] INIT START");

  bindButtons();
  bindLogout();

  flushPendingRoutes();

  console.log("[DASHBOARD] ACTIVE");
}

/* ================= BOOT HOOK (FIXED) ================= */

function bootWhenReady() {

  if (window.__SYSTEM_BOOT__ && window.__SYSTEM_BOOT__.ready) {
    initDashboard();
  } else {

    if (window.SYSTEM_EVENTS && window.SYSTEM_EVENTS.on) {
      window.SYSTEM_EVENTS.on("SYSTEM_READY", initDashboard);
    } else {
      setTimeout(initDashboard, 1000);
    }
  }
}

/* ================= START ================= */

bootWhenReady();

/* ================= DEBUG ================= */

window.__DASHBOARD_LOADED__ = true;

console.log("[DASHBOARD] READY");
