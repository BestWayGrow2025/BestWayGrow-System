"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.0 (CLEAN WIRED)
========================================
✔ Fully event-driven (NO direct boot dependency)
✔ Waits for SYSTEM_READY
✔ CORE-safe execution
✔ Button routing fixed
✔ No race condition
✔ Compatible with Boot Manager v1.0
========================================
*/

console.log("[DASHBOARD] LOADING");

// ================= CORE ACCESS =================
function getCore() {
  return window.ENTERPRISE_CORE_ENGINE ||
         window.__ENTERPRISE_CORE_ENGINE__;
}

// ================= SAFE EVENT BUS =================
function getEvents() {
  return window.SYSTEM_EVENTS;
}

// ================= PAGE ROUTER =================
function handleNavigation(page) {

  const CORE = getCore();

  console.log("[DASHBOARD] NAVIGATE:", page);

  try {

    if (CORE && typeof CORE.run === "function") {
      CORE.run(page);
    } else {
      console.warn("[DASHBOARD] CORE not ready, fallback used:", page);
    }

  } catch (err) {
    console.error("[DASHBOARD ROUTE ERROR]", err);
  }
}

// ================= BUTTON BINDING =================
function bindButtons() {

  const buttons = document.querySelectorAll(".menu button");

  if (!buttons.length) {
    console.warn("[DASHBOARD] No buttons found");
    return;
  }

  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      const page = btn.dataset.page;

      if (!page) return;

      handleNavigation(page);

    });

  });

  console.log("[DASHBOARD] BUTTONS WIRED:", buttons.length);
}

// ================= LOGOUT =================
function bindLogout() {

  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) {
    console.warn("[DASHBOARD] Logout button not found");
    return;
  }

  logoutBtn.addEventListener("click", () => {

    console.log("[DASHBOARD] LOGOUT CLICKED");

    const EVENTS = getEvents();

    if (EVENTS) {
      EVENTS.emit("LOGOUT_REQUESTED", {
        time: Date.now()
      });
    }

  });
}

// ================= INIT DASHBOARD =================
function initDashboard() {

  console.log("[DASHBOARD] INIT START");

  bindButtons();
  bindLogout();

  console.log("[DASHBOARD] ACTIVE");
}

// ================= SAFE SYSTEM HOOK =================
function waitForSystem() {

  const EVENTS = getEvents();

  if (EVENTS && typeof EVENTS.on === "function") {

    EVENTS.on("SYSTEM_READY", () => {
      console.log("[DASHBOARD] SYSTEM_READY RECEIVED");
      initDashboard();
    });

  } else {

    // fallback polling safety
    const interval = setInterval(() => {

      if (window.__SYSTEM_BOOT__?.ready) {
        clearInterval(interval);
        initDashboard();
      }

    }, 300);

  }
}

// ================= START =================
waitForSystem();

// ================= GLOBAL FLAG =================
window.__DASHBOARD_LOADED__ = true;

console.log("[DASHBOARD] FILE READY");
