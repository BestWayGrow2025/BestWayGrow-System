"use strict";

/*
========================================
SUPER ADMIN LOGIN V4.1 FINAL STABLE
========================================
✔ Enterprise Core compatible
✔ Session verification fixed
✔ Dashboard auth fixed
✔ No BOOT recursion
✔ Production stable
========================================
*/

console.log(
  "[SUPER ADMIN LOGIN] FILE EXECUTION STARTED"
);

let lock = false;

/* ================= MODULE REGISTRATION ================= */

if (
  window.ENTERPRISE_CORE_ENGINE &&
  typeof window.ENTERPRISE_CORE_ENGINE.register ===
    "function"
) {

  window.ENTERPRISE_CORE_ENGINE.register(
    "super_admin_login",
    function () {

      initPage();

      bindEvents();

      loadPage();
    }
  );
}

/* ================= FALLBACK ================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initPage();

    bindEvents();

    loadPage();
  }
);

/* ================= INIT ================= */

function initPage() {

  console.log(
    "[SUPER ADMIN LOGIN] INIT"
  );
}

/* ================= EVENTS ================= */

function bindEvents() {

  const btn =
    document.getElementById(
      "loginBtn"
    );

  if (
    btn &&
    !btn.dataset.bound
  ) {

    btn.dataset.bound = "true";

    btn.addEventListener(
      "click",
      function () {

        safeClick(login);
      }
    );
  }

  const password =
    document.getElementById(
      "password"
    );

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
    typeof getSession ===
    "function"

      ? getSession()

      : null;

  if (
    session &&
    session.role ===
      "super_admin"
  ) {

    window.location.href =
      "super_admin_dashboard.html";
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
      "[SUPER ADMIN LOGIN ERROR]",
      err
    );

    showMsg(
      "❌ System Error"
    );
  }

  setTimeout(
    function () {

      lock = false;

    },
    500
  );
}

/* ================= SAFE DECODE ================= */

function safeDecode(value) {

  try {

    return atob(
      value || ""
    );

  } catch (e) {

    return value || "";
  }
}

/* ================= USERS ================= */

function getSafeUsers() {

  try {

    return typeof getUsers ===
      "function"

      ? (
          getUsers() || []
        )

      : [];

  } catch (e) {

    return [];
  }
}

/* ================= LOGIN ================= */

function login() {

  const userId =
    document.getElementById(
      "userId"
    ).value.trim();

  const password =
    document.getElementById(
      "password"
    ).value.trim();

  if (
    !userId ||
    !password
  ) {

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
        ).toUpperCase() ===
        userId.toUpperCase()
      );
    });

  if (!user) {

    showMsg(
      "❌ Invalid ID"
    );

    return;
  }

  if (
    user.role !==
    "super_admin"
  ) {

    showMsg(
      "🚫 Access Denied"
    );

    return;
  }

  if (
    (
      user.status ||
      "active"
    ) !== "active"
  ) {

    showMsg(
      "🚫 Account inactive"
    );

    return;
  }

  const storedPass =
    safeDecode(
      user.password
    );

  if (
    storedPass !== password
  ) {

    showMsg(
      "❌ Wrong Password"
    );

    return;
  }

 /* ================= SESSION ================= */

if (
  typeof setSession !==
  "function"
) {

  alert(
    "Session system missing"
  );

  return;
}

/*
========================================
IMPORTANT FIX
========================================
Send FULL USER OBJECT
NOT partial session object
because session_manager.js
creates token from full user
========================================
*/

const sessionCreated =
  setSession(user);

console.log(
  "[SUPER ADMIN LOGIN] SESSION RESULT:",
  sessionCreated
);

console.log(
  "[SUPER ADMIN LOGIN] SESSION CHECK:",
  getSession()
);

if (!sessionCreated) {

  showMsg(
    "❌ Session Creation Failed"
  );

  return;
}

/* ================= ACTIVITY LOG ================= */

if (
  typeof logActivity ===
  "function"
) {

  try {

    logActivity(
      user.userId,
      "super_admin",
      "LOGIN",
      "ADMIN"
    );

  } catch (e) {}
}

showMsg(
  "✅ Login successful"
);

setTimeout(
  function () {

    window.location.href =
      "super_admin_dashboard.html";

  },
  500
);
}

/* ================= MESSAGE ================= */

function showMsg(text) {

  const msg =
    document.getElementById(
      "msg"
    );

  if (msg) {

    msg.innerText = text;

  } else {

    alert(text);
  }
}

/* ================= EXPORT ================= */

window.SuperAdminLogin = {

  login: login,

  showMsg: showMsg
};

/* ================= FLAGS ================= */

window.__SUPER_ADMIN_LOGIN__ =
  true;

window.__SUPER_ADMIN_LOGIN_MODULE__ = {

  loaded: true,

  name:
    "super_admin_login",

  time:
    Date.now()
};

console.log(
  "[SUPER ADMIN LOGIN] MODULE LOADED OK"
);

