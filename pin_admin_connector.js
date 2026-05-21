"use strict";

/*
========================================
PIN ADMIN CONNECTOR V1.0
========================================
✔ SystemAdmin → Admin activation bridge
✔ Admin dashboard unlock controller
✔ Role transition safe layer
✔ Access enable system
✔ One-way flow only
✔ No routing logic
✔ No UI rendering
✔ Production LOCKED
========================================
*/

// ================= INIT GUARD =================
(function () {

  if (window.__PIN_ADMIN_CONNECTOR__) return;

  window.__PIN_ADMIN_CONNECTOR__ = true;

})();

// ================= ACTIVATE ADMIN =================
function activateAdmin(userId) {

  try {

    // ================= VALIDATION =================
    if (!userId) {
      throw new Error("Missing userId");
    }

    // ================= LOAD USER =================
    let user = null;

    if (typeof getUserById === "function") {
      user = getUserById(userId);
    }

    if (!user) {
      throw new Error("User not found");
    }

    // ================= ROLE CHECK =================
    if (user.role !== "system_admin") {
      throw new Error("Only System Admin can become Admin");
    }

    // ================= ROLE TRANSITION =================
    user.role = "admin";
    user.adminActive = true;
    user.adminAccessEnabled = true;
    user.adminDashboardAccess = true;
    user.adminActivatedAt = Date.now();

    // ================= SAVE =================
    if (typeof saveUser === "function") {
      saveUser(user);
    }

    // ================= GLOBAL STATE =================
    window.__ADMIN_STATE__ = {
      active: true,
      userId: userId,
      role: "admin"
    };

    // ================= EVENT BROADCAST =================
    if (typeof broadcastPinEvent === "function") {
      broadcastPinEvent("ADMIN_ACTIVATED", {
        userId: userId,
        role: "admin"
      });
    }

    console.log("[ADMIN CONNECTOR] ACTIVATED ✔");

    return true;

  } catch (err) {

    console.error("[ADMIN CONNECTOR ERROR]", err);

    return false;
  }
}

// ================= CHECK ADMIN STATUS =================
function isAdminActive(userId) {

  try {

    if (!userId) return false;

    if (typeof getUserById !== "function") return false;

    const user = getUserById(userId);

    return !!(
      user &&
      user.role === "admin" &&
      user.adminActive === true
    );

  } catch (_) {

    return false;
  }
}

// ================= ACCESS CHECK =================
function canOpenAdminDashboard(userId) {

  return isAdminActive(userId);
}

// ================= EXPORT =================
window.activateAdmin = activateAdmin;
window.isAdminActive = isAdminActive;
window.canOpenAdminDashboard = canOpenAdminDashboard;

