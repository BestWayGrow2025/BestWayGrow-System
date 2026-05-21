"use strict";

/*
========================================
PIN SYSTEM BOOTSTRAP CONNECTOR V1.0
========================================
✔ Central activation bridge
✔ Connects login → system admin → UI unlock
✔ Controls dashboard access flow
✔ Enables UI launcher binding
✔ No business logic
✔ No data logic
✔ Production LOCKED FLOW CONTROLLER
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_SYSTEM_BOOTSTRAP__) return;

  window.__PIN_SYSTEM_BOOTSTRAP__ = true;

  console.log("[PIN BOOTSTRAP] READY ✔");

})();

// ================= MAIN ENTRY =================
function bootPinSystem(userId) {

  try {

    if (!userId) {
      throw new Error("Missing userId");
    }

    // ================= STEP 1: SYSTEM ADMIN CHECK =================
    if (typeof isSystemAdminActive !== "function") {
      throw new Error("System Admin Connector missing");
    }

    const isAdmin = isSystemAdminActive(userId);

    if (!isAdmin) {
      throw new Error("System Admin NOT active");
    }

    // ================= STEP 2: ENABLE DASHBOARD =================
    unlockSystemDashboard(userId);

    // ================= STEP 3: ENABLE UI LAUNCHER =================
    enablePinUILauncher();

    // ================= STEP 4: ENABLE ROUTE SYSTEM =================
    enableRouteSystem();

    // ================= STEP 5: BROADCAST SYSTEM READY =================
    if (typeof broadcastPinEvent === "function") {
      broadcastPinEvent("PIN_SYSTEM_READY", {
        userId: userId,
        role: "system_admin"
      });
    }

    console.log("[PIN BOOTSTRAP] SYSTEM FULLY ACTIVE ✔");

    return true;

  } catch (err) {

    console.error("[PIN BOOTSTRAP ERROR]", err);

    return false;
  }
}

// ================= DASHBOARD UNLOCK =================
function unlockSystemDashboard(userId) {

  try {

    if (typeof window.canOpenSystemAdminDashboard === "function") {

      const allowed = window.canOpenSystemAdminDashboard(userId);

      if (!allowed) return false;
    }

    window.__SYSTEM_DASHBOARD_ENABLED__ = true;

    const el = document.querySelector("[data-page='system']");

    if (el) {
      el.disabled = false;
      el.style.opacity = "1";
    }

    console.log("[BOOTSTRAP] Dashboard unlocked ✔");

    return true;

  } catch (_) {
    return false;
  }
}

// ================= UI LAUNCHER ENABLE =================
function enablePinUILauncher() {

  window.__PIN_UI_ENABLED__ = true;

  if (typeof window.openPinRequestPanel === "function") {
    window.openPinRequestPanel.__enabled = true;
  }

  if (typeof window.openApprovePanel === "function") {
    window.openApprovePanel.__enabled = true;
  }

  if (typeof window.openAssignPinPanel === "function") {
    window.openAssignPinPanel.__enabled = true;
  }

  console.log("[BOOTSTRAP] UI Launcher enabled ✔");
}

// ================= ROUTE SYSTEM ENABLE =================
function enableRouteSystem() {

  window.__PIN_ROUTE_ENABLED__ = true;

  console.log("[BOOTSTRAP] Route system enabled ✔");
}

// ================= EXPORT =================
window.bootPinSystem = bootPinSystem;
