"use strict";

/*
========================================
SUPER ADMIN DASHBOARD v4.1 (WIRED SAFE)
========================================
✔ Waits for SYSTEM_READY
✔ No direct boot dependency
✔ CORE-safe navigation
✔ Event-driven UI binding
✔ Prevents undefined crashes
========================================
*/

console.log("[DASHBOARD] LOADING");

// ================= CORE ACCESS =================
function getCore() {
  return window.ENTERPRISE_CORE_ENGINE ||
         window.__ENTERPRISE_CORE_ENGINE__;
}

// ================= NAVIGATION =================
function navigate(page) {

  const CORE = getCore();

  console.log("[DASHBOARD] NAV:", page);

  if (CORE && typeof CORE.run === "function") {
    try {
      CORE.run(page);
    } catch (err) {
      console.error("[DASHBOARD ERROR]", err);
    }
  } else {
    console.warn("[DASHBOARD] CORE NOT READY");
  }
}

// ================= BUTTON BINDING =================
function bindMenuButtons() {

  document.querySelectorAll(".menu button").forEach(btn => {

    btn.addEventListener("click", () => {

      const page = btn.dataset.page;

      if (!page) return;

      navigate(page);

    });

  });

  console.log("[DASHBOARD] MENU WIRED");
}

// ================= LOGOUT =================
function bindLogout() {

  const btn = document.getElementById("logoutBtn");

  if (!btn) return;

  btn.addEventListener("click", () => {

    console.log("[DASHBOARD] LOGOUT");

    if (window.SYSTEM_EVENTS) {
      window.SYSTEM_EVENTS.emit("LOGOUT_REQUESTED", {
        time: Date.now()
      });
    }

  });
}

// ================= INIT =================
function initDashboard() {

  console.log("[DASHBOARD] INIT");

  bindMenuButtons();
  bindLogout();

  console.log("[DASHBOARD] ACTIVE");
}

// ================= SAFE BOOT =================
function waitForSystem() {

  if (window.__SYSTEM_BOOT__ && window.__SYSTEM_BOOT__.ready) {
    initDashboard();
  } else if (window.SYSTEM_EVENTS) {
    window.SYSTEM_EVENTS.on("SYSTEM_READY", initDashboard);
  } else {
    setTimeout(waitForSystem, 200);
  }
}

// ================= START =================
waitForSystem();

window.__DASHBOARD_LOADED__ = true;
