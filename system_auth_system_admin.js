"use strict";

/*
========================================
SYSTEM ADMIN LOGIN V4.0 FINAL STABLE
========================================
✔ Safe standalone initialization
✔ Unified session_manager.js
✔ Safe login lock
✔ Automatic redirect if already logged in
✔ Strict system_admin role validation
✔ Production stable
✔ No BOOT dependency
========================================
*/

console.log("[SYSTEM ADMIN LOGIN] FILE EXECUTION STARTED");

let lock = false;

/* ================= SAFE STARTUP ================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    try {

      initPage();
      bindEvents();
      loadPage();

      console.log(
        "[SYSTEM ADMIN LOGIN] SAFE INIT COMPLETE"
      );

    } catch (err) {

      console.error(
        "[SYSTEM ADMIN LOGIN INIT ERROR]",
        err
      );
    }
  }
);

/* ================= INIT ================= */

function initPage() {

  if (typeof initCoreSystem !== "function") {

    alert("❌ core_system.js not loaded");

    throw new Error("STOP");
  }

  initCoreSystem();
}

/* ================= EVENTS ================= */

function bindEvents() {

  const btn =
    document.getElementById("loginBtn");

  if (btn && !btn.dataset.bound) {

    btn.dataset.bound = "true";

    btn.addEventListener(
      "click",
      function () {

        safeClick(login);
      }
    );
  }

  const password =
    document.getElementById("password");

  if (
    password &&
    !password.dataset.bound
  ) {

    password.dataset.bound = "true";

    password.addEventListener(
      "keypress",
      function (e) {

        if (e.key === "Enter") {

          safeClick(login);
        }
      }
    );
  }
}

/* ================= AUTO REDIRECT ================= */

function loadPage() {

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (
    session &&
    session.role === "system_admin"
  ) {

    window.location.replace(
      "system_admin_dashboard.html"
    );
  }
}

/* ================= SAFE CLICK ================= */

function safeClick(fn) {

  if (lock) return;

  lock = true;

  try {

    fn();

  } catch (err) {

    console.error(
      "[SYSTEM ADMIN LOGIN ERROR]",
      err
    );

    showMsg("❌ System Error");
  }

  setTimeout(function () {

    lock = false;

  }, 500);
}

/* ================= SAFE DECODE ================= */

function safeDecode(val) {

  try {

    return atob(val || "");

  } catch (e) {

    return val || "";
  }
}

/* ================= USERS ================= */

function getSafeUsers() {

  try {

    return typeof getUsers === "function"
      ? (getUsers() || [])
      : [];

  } catch (e) {

    return [];
  }
}

/* ================= LOGIN ================= */

function login() {

  const userId =
    document
      .getElementById("userId")
      .value
      .trim()
      .toUpperCase();

  const password =
    document
      .getElementById("password")
      .value
      .trim();

  if (!userId || !password) {

    showMsg(
      "⚠️ Enter ID & Password"
    );

    return;
  }

  const users =
    getSafeUsers();

  const user =
    users.find(function (u) {

      return (
        String(
          u.userId || ""
        ).toUpperCase() === userId &&

        String(
          u.role || ""
        ) === "system_admin"
      );
    });

  if (!user) {

    showMsg("❌ Invalid ID");

    return;
  }

  if (
    (user.status || "active") !==
    "active"
  ) {

    showMsg(
      "🚫 Account inactive"
    );

    return;
  }

  const storedPass =
    safeDecode(
      user.password || ""
    );

  if (storedPass !== password) {

    showMsg(
      "❌ Wrong Password"
    );

    return;
  }

  /* Unified session */

  if (
    typeof setSession !==
    "function"
  ) {

    alert(
      "Session system missing"
    );

    return;
  }

  const now = Date.now();

  const success =
    setSession({

      userId: user.userId,

      role: user.role,

      loginTime: now,

      lastActivity: now
    });

  if (success !== true) {

    showMsg(
      "❌ Session creation failed"
    );

    return;
  }

  /* Activity log */

  if (
    typeof logActivity ===
    "function"
  ) {

    try {

      logActivity(
        user.userId,
        "system_admin",
        "LOGIN",
        "ADMIN"
      );

    } catch (e) {}
  }

  showMsg(
    "✅ Login successful"
  );

  setTimeout(function () {

    window.location.replace(
      "system_admin_dashboard.html"
    );

  }, 500);
}

/* ================= MESSAGE ================= */

function showMsg(msg) {

  const el =
    document.getElementById("msg");

  if (el) {

    el.innerText = msg;

  } else {

    alert(msg);
  }
}

/* ================= EXPORT ================= */

window.SystemAdminLogin = {

  login: login,

  showMsg: showMsg
};

/* ================= MODULE FLAGS ================= */

window.SYSTEM_ADMIN_LOGIN = true;

window.SYSTEM_ADMIN_LOGIN_MODULE = {

  loaded: true,

  name: "system_admin_login",

  time: Date.now()
};

console.log(
  "[SYSTEM ADMIN LOGIN] MODULE LOADED OK"
);
