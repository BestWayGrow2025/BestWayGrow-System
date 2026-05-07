/*
========================================
DASHBOARD PROTECTION MODULE
SAFE ACCESS LAYER (NO BUSINESS LOGIC CHANGE)
========================================
*/

function requireAuth(allowedRoles = []) {

  try {

    const session = typeof getSession === "function"
      ? getSession()
      : null;

    if (!session || !session.userId) {
      window.location.href = "user_login.html";
      return false;
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.role)
    ) {
      alert("Access Denied");
      window.location.href = "index.html";
      return false;
    }

    return true;

  } catch (e) {
    console.error("Auth error:", e);
    window.location.href = "user_login.html";
    return false;
  }
}
