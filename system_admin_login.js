let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initCoreSystem();
  bindEvents();
  loadPage();
});

// ================= LOGIN =================
function login() {
  if (lock) return;
  lock = true;

  let userId = document.getElementById("userId").value.trim().toUpperCase();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showMsg("⚠️ Enter ID & Password");
    lock = false;
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];

  let user = users.find(u =>
    (u.userId || "").toUpperCase() === userId &&
    u.role === "system_admin"
  );

  if (!user) {
    showMsg("❌ Invalid ID");
    lock = false;
    return;
  }

  if ((user.status || "active") !== "active") {
    showMsg("🚫 Account inactive");
    lock = false;
    return;
  }

  let storedPass = safeDecode(user.password || "");

  if (storedPass !== password) {
    showMsg("❌ Wrong Password");
    lock = false;
    return;
  }

  // ================= UNIFIED SESSION =================
  if (typeof setSession === "function") {
    setSession({
      userId: user.userId,
      role: user.role
    });
  }

  // Activity log (safe)
  if (typeof logActivity === "function") {
    try {
      logActivity(user.userId, "SYSTEM_ADMIN", "Login", "ADMIN");
    } catch (e) {}
  }

  showMsg("✅ Login successful");

  setTimeout(() => {
    window.location.href = "system_admin_dashboard.html";
  }, 400);

  setTimeout(() => {
    lock = false;
  }, 600);
}

// ================= MESSAGE =================
function showMsg(msg) {
  let el = document.getElementById("msg");
  if (el) el.innerText = msg;
}

// ================= SAFE DECODE =================
function safeDecode(val) {
  try {
    return atob(val || "");
  } catch {
    return val || "";
  }
}

// ================= EVENTS =================
function bindEvents() {
  document.getElementById("loginBtn").addEventListener("click", login);
}

// ================= AUTO REDIRECT =================
function loadPage() {
  let session = typeof getSession === "function" ? getSession() : null;

  if (session && session.role === "system_admin") {
    window.location.href = "system_admin_dashboard.html";
  }
}




