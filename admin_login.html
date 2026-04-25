
// ================= LOAD ADMIN LOGIN PAGE =================
function loadAdminLoginPage() {
  let btn = document.getElementById("loginBtn");
  if (btn) {
    btn.addEventListener("click", submitAdminLogin);
  }
}

// ================= ADMIN LOGIN =================
function submitAdminLogin() {

  lockBtn();

  let id = document.getElementById("adminId").value.trim().toLowerCase();
  let pass = document.getElementById("password").value.trim();

  if (!id || !pass) {
    showMsg("⚠ Enter ID & Password");
    unlockBtn();
    return;
  }

  if (typeof getUsers !== "function") {
    alert("Core system not loaded");
    unlockBtn();
    return;
  }

  let users = getUsers() || [];

  let user = users.find(u => {
    let storedPass = safeDecode(u.password);

    return (
      (u.userId || "").toLowerCase() === id &&
      u.role === "admin" &&
      storedPass === pass
    );
  });

  if (!user) {
    showMsg("❌ Invalid login");
    unlockBtn();
    return;
  }

  if (user.role !== "admin") {
    showMsg("❌ Invalid login");
    unlockBtn();
    return;
  }

  if (user.status && user.status !== "active") {
    showMsg("🚫 Account inactive");
    unlockBtn();
    return;
  }

  if (typeof getSystemSettings !== "function") {
    alert("System settings missing");
    unlockBtn();
    return;
  }

  let settings = getSystemSettings();

  if (settings.adminAccess === false) {
    showMsg("🚫 Admin access OFF");
    unlockBtn();
    return;
  }

  if (settings.lockMode === true) {
    showMsg("🚫 System locked");
    unlockBtn();
    return;
  }

  logoutAll();

  localStorage.setItem("loggedInAdmin", JSON.stringify({
    userId: user.userId,
    role: user.role
  }));

  if (!localStorage.getItem("loggedInAdmin")) {
    alert("Session failed");
    unlockBtn();
    return;
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "ADMIN", "Login");
  }

  showMsg("✅ Login successful");

  setTimeout(() => {
    window.location.href = "admin_dashboard.html";
  }, 500);
}

// ================= SAFE DECODE =================
function safeDecode(p) {
  try { return atob(p); } catch { return p || ""; }
}

// ================= BUTTON LOCK =================
function lockBtn() {
  let btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.innerText = "Checking...";
}

function unlockBtn() {
  let btn = document.getElementById("loginBtn");
  btn.disabled = false;
  btn.innerText = "Login";
}

// ================= CLEAR OLD SESSION =================
function logoutAll() {
  localStorage.removeItem("loggedInAdmin");
}

// ================= MESSAGE =================
function showMsg(text) {
  document.getElementById("msg").innerText = text;
}

// ================= INIT =================
window.addEventListener("load", function () {

  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js not loaded");
    return;
  }

  initCoreSystem();
  loadAdminLoginPage();
});
