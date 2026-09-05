/*
========================================
USER LOGIN FINAL FIXED (PRACTICAL)
========================================
✔ Single login submit lock
✔ Core readiness verification
✔ Session creation verification
✔ No false login success
✔ No redirect loop
✔ Safe session check
✔ Safe password decode
✔ Clean login flow
✔ Dashboard opens once
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

// ================= INIT PAGE =================
function initPage() {

  /*
  Core Boot Manager is responsible for the
  global boot sequence.

  User Login only requires Core + Session
  authority. Do not force the enterprise
  orchestrator/wiring stack here.
  */

  if (
    typeof window.initCoreSystem === "function" &&
    window.__CORE_STATE__ &&
    !window.__CORE_STATE__.initialized
  ) {
    window.initCoreSystem();
  }
}

// ================= AUTH CHECK =================
function authPage() {

  try {
    session =
      typeof getSession === "function"
        ? getSession()
        : null;
  } catch (e) {
    console.warn("[USER AUTH] Session check failed:", e);
    session = null;
  }

  // Passive check only
  if (session && session.role === "user") {

    showMsg("Already Logged In", "green");

    setTimeout(function () {
      window.location.href = "user_dashboard.html";
    }, 300);

    return;
  }

  currentUser = null;
}

// ================= EVENTS =================
function bindEvents() {

  const loginBtn =
    document.getElementById("loginBtn");

  const showPassword =
    document.getElementById("showPassword");

  if (loginBtn) {
    loginBtn.addEventListener(
      "click",
      safeLogin
    );
  }

  if (showPassword) {
    showPassword.addEventListener(
      "change",
      togglePassword
    );
  }
}

// ================= LOAD PAGE =================
function loadPage() {
  showMsg("", "red");
}

// ================= SAFE LOGIN =================
function safeLogin() {

  if (lock) return;

  lock = true;

  const btn =
    document.getElementById("loginBtn");

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Checking...";
  }

  try {

    submitLogin();

  } catch (err) {

    console.error(
      "[USER AUTH] Login error:",
      err
    );

    showMsg("Login Error");
    resetLogin();
  }
}

// ================= SUBMIT LOGIN =================
function submitLogin() {

  /*
  Core must be ready before authentication
  and session creation.
  */

  if (
    !window.__CORE_READY__ ||
    !window.__CORE_STATE__ ||
    !window.__CORE_STATE__.initialized
  ) {

    /*
    One controlled retry allows the Core
    initializer to complete before login.
    */

    if (
      typeof window.initCoreSystem === "function"
    ) {

      const initialized =
        window.initCoreSystem();

      if (
        !initialized ||
        !window.__CORE_READY__
      ) {

        showMsg(
          "System is still initializing. Please try again."
        );

        resetLogin();
        return;
      }

    } else {

      showMsg(
        "Core system is not available."
      );

      resetLogin();
      return;
    }
  }

  const userId =
    document
      .getElementById("userId")
      ?.value
      .trim()
      .toUpperCase();

  const password =
    document
      .getElementById("password")
      ?.value
      .trim();

  if (!userId || !password) {

    showMsg(
      "Enter User ID & Password"
    );

    resetLogin();
    return;
  }

  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  if (!Array.isArray(users)) {

    showMsg(
      "Unable to load users"
    );

    resetLogin();
    return;
  }

  const user =
    users.find(
      u =>
        (u.userId || "")
          .toUpperCase() === userId
    );

  if (!user) {

    showMsg(
      "Invalid User ID"
    );

    resetLogin();
    return;
  }

  if (user.role !== "user") {

    showMsg(
      "Access Denied"
    );

    resetLogin();
    return;
  }

  if (user.status !== "active") {

    showMsg(
      "Account Inactive"
    );

    resetLogin();
    return;
  }

  const storedPassword =
    safeDecode(
      user.password || ""
    );

  if (storedPassword !== password) {

    showMsg(
      "Wrong Password"
    );

    resetLogin();
    return;
  }

  // ================= SESSION SAVE =================

  if (
    typeof setSession !== "function"
  ) {

    showMsg(
      "Session authority unavailable"
    );

    resetLogin();
    return;
  }

  const sessionCreated =
    setSession({
      userId: user.userId,
      role: user.role
    });

  /*
  CRITICAL:
  Never report Login Success unless
  session creation actually succeeded.
  */

  if (!sessionCreated) {

    showMsg(
      "Unable to create login session"
    );

    resetLogin();
    return;
  }

  // ================= SESSION VERIFY =================

  let verifiedSession = null;

  try {

    verifiedSession =
      typeof getSession === "function"
        ? getSession()
        : null;

  } catch (e) {

    console.warn(
      "[USER AUTH] Session verification failed:",
      e
    );
  }

  if (
    !verifiedSession ||
    verifiedSession.userId !== user.userId ||
    verifiedSession.role !== user.role
  ) {

    showMsg(
      "Login session verification failed"
    );

    resetLogin();
    return;
  }

  session = verifiedSession;
  currentUser = user;

  // ================= ACTIVITY LOG =================

  if (
    typeof logActivity === "function"
  ) {

    try {

      logActivity(
        user.userId,
        user.role,
        "Login",
        "USER_LOGIN"
      );

    } catch (e) {

      console.warn(
        "Login log skipped"
      );
    }
  }

  // ================= SUCCESS =================

  showMsg(
    "Login Success",
    "green"
  );

  const btn =
    document.getElementById("loginBtn");

  if (btn) {
    btn.innerText = "Opening...";
  }

  setTimeout(function () {

    window.location.href =
      "user_dashboard.html";

  }, 400);
}

// ================= RESET LOGIN =================
function resetLogin() {

  lock = false;

  const btn =
    document.getElementById("loginBtn");

  if (btn) {

    btn.disabled = false;
    btn.innerText = "Login";
  }
}

// ================= TOGGLE PASSWORD =================
function togglePassword() {

  const pass =
    document.getElementById("password");

  if (!pass) return;

  pass.type =
    pass.type === "password"
      ? "text"
      : "password";
}

// ================= MESSAGE =================
function showMsg(
  text,
  color = "red"
) {

  const msg =
    document.getElementById("msg");

  if (!msg) return;

  msg.style.color = color;
  msg.innerText = text;
}

// ================= SAFE DECODE =================
function safeDecode(value) {

  try {

    return atob(
      value || ""
    );

  } catch {

    return value || "";
  }
}
