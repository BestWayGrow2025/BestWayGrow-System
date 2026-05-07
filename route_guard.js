/*
========================================
ROUTE GUARD SYSTEM V1.0
FULL URL ACCESS PROTECTION
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
    console.error("Route guard error:", e);
    window.location.href = "user_login.html";
    return false;
  }
}
