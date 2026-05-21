"use strict";

/*
========================================
PIN SYSTEM ADMIN CONNECTOR V1.0
========================================
✔ Activates System Admin role state
✔ Unlocks System Admin dashboard
✔ Enables admin UI access flag
✔ One-way activation flow only
✔ No routing logic
✔ No UI rendering logic
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_SYSTEM_ADMIN_CONNECTOR__) return;

  window.__PIN_SYSTEM_ADMIN_CONNECTOR__ = true;

})();

// ================= ACTIVATE SYSTEM ADMIN =================
function activateSystemAdmin(userId) {

  try {

    // ================= VALIDATION =================
    if (!userId) {
      throw new Error("Missing userId");
    }

    // ================= GET USER =================
    let user = null;

    if (typeof getUserById === "function") {
      user = getUserById(userId);
    }

    if (!user) {
      throw new Error("User not found");
    }

    // ================= ROLE SET =================
    user.role = "system_admin";
    user.systemAdminActive = true;
    user.systemAccessEnabled = true;
    user.systemDashboardAccess = true;
    user.systemActivatedAt = Date.now();

    // ================= SAVE USER =================
    if (typeof saveUser === "function") {
      saveUser(user);
    }

    // ================= GLOBAL STATE =================
    window.__SYSTEM_ADMIN_STATE__ = {
      active: true,
      userId: userId,
      role: "system_admin"
    };

    // ================= EVENT BROADCAST =================
    if (typeof broadcastPinEvent === "function") {
      broadcastPinEvent("SYSTEM_ADMIN_ACTIVATED", {
        userId: userId,
        role: "system_admin"
      });
    }

    console.log("[SYSTEM ADMIN CONNECTOR] ACTIVATED ✔");

    return true;

  } catch (err) {

    console.error("[SYSTEM ADMIN CONNECTOR ERROR]", err);

    return false;
  }
}

// ================= CHECK STATUS =================
function isSystemAdminActive(userId) {

  try {

    if (!userId) return false;

    if (typeof getUserById !== "function") return false;

    const user = getUserById(userId);

    return !!(
      user &&
      user.role === "system_admin" &&
      user.systemAdminActive === true
    );

  } catch (_) {

    return false;
  }
}

// ================= DASHBOARD ACCESS CHECK =================
function canOpenSystemAdminDashboard(userId) {

  return isSystemAdminActive(userId);
}

// ================= EXPORT =================
window.activateSystemAdmin = activateSystemAdmin;
window.isSystemAdminActive = isSystemAdminActive;
window.canOpenSystemAdminDashboard = canOpenSystemAdminDashboard;
