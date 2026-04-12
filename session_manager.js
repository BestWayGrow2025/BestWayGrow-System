function setSession(user) {
  localStorage.setItem("appSession", JSON.stringify({
    userId: user.userId,
    role: user.role
  }));
}

function getSession() {
  return JSON.parse(localStorage.getItem("appSession") || "null");
}

function clearSession() {
  localStorage.removeItem("appSession");
}

function protectPage({ role }) {
  let session = getSession();

  if (!session) {
    alert("Login Required");
    window.location.href = "super_admin_login.html";
    return null;
  }

  if (Array.isArray(role)) {
    if (!role.includes(session.role)) {
      alert("Access Denied");
      window.location.href = "super_admin_login.html";
      return null;
    }
  } else {
    if (session.role !== role) {
      alert("Access Denied");
      window.location.href = "super_admin_login.html";
      return null;
    }
  }

  return session;
}
