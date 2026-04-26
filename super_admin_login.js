let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("❌ core_system.js not loaded");
    throw new Error("STOP");
  }

  try {
    if (typeof getSession === "function") {
      session = getSession();
    }
  } catch (e) {
    console.error(e);
  }

  if (session && session.role === "super_admin") {
    window.location.href = "super_admin_dashboard.html";
    return;
  }
});

// ================= LOCK SYSTEM =================
function safeClick(fn) {
  if (lock) return;

  lock = true;

  try {
    fn();
  } catch (e) {
    console.error(e);
  }

  setTimeout(() => {
    lock = false;
  }, 500);
}

// ================= LOGOUT ALL =================
function logoutAll() {
  try {
    localStorage.removeItem("loggedInSuperAdmin");
    localStorage.removeItem("loggedInSystemAdmin");
    localStorage.removeItem("loggedInAdmin");
    localStorage.removeItem("loggedInUser");
  } catch (e) {
    console.error(e);
  }
}

// ================= SAFE DECODE =================
function safeDecode(p) {
  try {
    return atob(p);
  } catch {
    return p || "";
  }
}

// ================= SAFE USERS =================
function getSafeUsers() {
  try {
    return getUsers() || [];
  } catch (e) {
    console.error(e);
    showMsg("❌ System Error");
    return [];
  }
}

// ================= SAVE SESSION =================
function saveSession(user) {
  try {
    if (typeof setSession === "function") {
      setSession({
        userId: user.userId,
        role: user.role
      });
      return true;
    }

    let data = JSON.stringify({
      userId: user.userId,
      role: user.role
    });

    localStorage.setItem("loggedInSuperAdmin", data);
    return true;

  } catch (e) {
    console.error(e);
    showMsg("❌ Session Failed");
    return false;
  }
}

// ================= LOGIN =================
function login() {
  let userId = document.getElementById("userId").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    return showMsg("⚠️ Enter ID & Password");
  }

  let users = getSafeUsers();

  let user = users.find(u => {
    let inputId = userId.toLowerCase();

    return (
      inputId === "superadmin" &&
      u.userId === "SUPERADMIN" &&
      u.role === "super_admin"
    );
  });

  if (!user) {
    return showMsg("❌ Invalid ID");
  }

  if (user.status && user.status !== "active") {
    return showMsg("🚫 Account inactive");
  }

  let storedPass = safeDecode(user.password);

  if (storedPass.trim() !== password) {
    return showMsg("❌ Wrong Password");
  }

  logoutAll();

  let ok = saveSession(user);
  if (!ok) return;

  if (typeof logActivity === "function") {
    logActivity(user.userId, "SUPER_ADMIN", "Login");
  }

  showMsg("✅ Login successful");

  setTimeout(() => {
    window.location.href = "super_admin_dashboard.html";
  }, 500);
}

// ================= MESSAGE =================
function showMsg(text) {
  let msg = document.getElementById("msg");
  if (!msg) return;

  msg.innerText = text;
}
