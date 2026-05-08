/*
========================================
DASHBOARD PROTECTION MODULE V1.1
SAFE ACCESS LAYER (STABILIZED)
========================================
*/

function requireAuth(allowedRoles = []) {

  try {

    const session = typeof getSession === "function"
      ? getSession()
      : null;

    window.__DASHBOARD_AUTH_FAILED__ = false;

    // ❌ no session
    if (!session || !session.userId) {

      window.__DASHBOARD_AUTH_FAILED__ = true;

      window.location.replace("user_login.html");
      return false;
    }

    // ❌ role mismatch
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.role)
    ) {

      window.__DASHBOARD_AUTH_FAILED__ = true;

      alert("Access Denied");

      // FIX: align with route_guard behavior
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

    return true;

  } catch (e) {

    console.error("Auth error:", e);

    window.__DASHBOARD_AUTH_FAILED__ = true;

    window.location.replace("user_login.html");

    return false;
  }
}
