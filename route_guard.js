/*
========================================
ROUTE GUARD SYSTEM V2.1 (STABILITY PATCH)
========================================
*/

"use strict";

// ================= ROUTE PROTECTION =================
function requireAuth(allowedRoles = []) {

  try {

    // 🟡 STABILITY FIX: allow session warm-up
    let session = null;

    if (typeof getSession === "function") {
      session = getSession();
    }

    window.__AUTH_FAILED__ = false;

    // 🟡 FIX: small safety delay handling (prevents false redirect)
    if (!session || !session.userId) {

      window.__AUTH_FAILED__ = true;

      setTimeout(() => {
        window.location.replace("user_login.html");
      }, 50);

      return false;
    }

    // ❌ Role mismatch
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.role)
    ) {

      window.__AUTH_FAILED__ = true;

      alert("Access Denied");

      // keep your original routing logic (unchanged)
      if (session.role === "admin") {
        window.location.replace("admin_login.html");
      } else if (session.role === "system_admin") {
        window.location.replace("system_admin_login.html");
      } else if (session.role === "super_admin") {
        window.location.replace("super_admin_login.html");
      } else {
        window.location.replace("user_login.html");
      }

      return false;
    }

    // ⚠️ FIX: optional safety only (non-breaking fallback)
    if (
      typeof session.status !== "undefined" &&
      session.status !== "active"
    ) {
      window.__AUTH_FAILED__ = true;
      window.location.replace("user_login.html");
      return false;
    }

    return true;

  } catch (e) {

    console.error("Route guard error:", e);

    window.__AUTH_FAILED__ = true;

    window.location.replace("user_login.html");

    return false;
  }
}

// ================= GLOBAL EXECUTION BLOCK =================
function isAuthBlocked() {
  return window.__AUTH_FAILED__ === true;
}
