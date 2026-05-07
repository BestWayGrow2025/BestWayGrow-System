/*
========================================
ROUTE GUARD SYSTEM V2.0 (HARDENED)
FULL ACCESS CONTROL + EXECUTION BLOCK
========================================
*/

"use strict";

// ================= ROUTE PROTECTION =================
function requireAuth(allowedRoles = []) {

  try {

    const session = typeof getSession === "function"
      ? getSession()
      : null;

    // GLOBAL FAIL FLAG
    window.__AUTH_FAILED__ = false;

    // ❌ No session
    if (!session || !session.userId) {
      window.__AUTH_FAILED__ = true;
      window.location.replace("user_login.html");
      return false;
    }

    // ❌ Role mismatch
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.role)
    ) {
      window.__AUTH_FAILED__ = true;
      alert("Access Denied");

      // Role-based redirect
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

    // ❌ Account status check
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
