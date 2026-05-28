"use strict";

/*
========================================
SUPER ADMIN CREATE SYSTEM ADMIN v4.3
ENTERPRISE MODULE FINAL
========================================
✔ Dashboard injected module safe
✔ No duplicate DOMContentLoaded issue
✔ Event binding stabilized
✔ Dynamic loader compatible
✔ Production ready
✔ Create button fixed
✔ Re-render safe
✔ CORE dependency removed
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

console.log(
  "[SUPER ADMIN] FILE EXECUTION STARTED"
);

/* ================= AUTH CHECK ================= */

function checkAuth() {

  session =
    typeof getSession ===
    "function"

      ? getSession()

      : JSON.parse(
          localStorage.getItem(
            "loggedInSuperAdmin"
          ) || "null"
        );

  // SOFT FAIL ONLY
  if (
    !session ||
    !session.userId
  ) {

    console.warn(
      "[SUPER ADMIN AUTH] Session Missing"
    );

    return false;
  }

  if (
    session.role &&
    session.role !==
      "super_admin"
  ) {

    console.warn(
      "[SUPER ADMIN AUTH] Invalid Role"
    );

    return false;
  }

  currentUser =
    typeof getUserById ===
    "function"

      ? getUserById(
          session.userId
        )

      : null;

  if (
    !currentUser ||
    currentUser.role !==
      "super_admin"
  ) {

    console.warn(
      "[SUPER ADMIN AUTH] User Invalid"
    );

    return false;
  }

  if (
    (
      currentUser.status ||
      "active"
    ) !== "active"
  ) {

    console.warn(
      "[SUPER ADMIN AUTH] User Inactive"
    );

    return false;
  }

  return true;
}

/* ================= MESSAGE ================= */

function showMsg(text) {

  const msg =
    document.getElementById(
      "msg"
    );

  if (msg) {

    msg.innerText = text;
  }
}

/* ================= PASSWORD ================= */

function encodePassword(p) {

  try {

    return btoa(p);

  } catch (e) {

    return p;
  }
}

/* ================= SAFE CLICK ================= */

function safeClick(fn) {

  if (lock) return;

  lock = true;

  try {

    fn();

  } catch (e) {

    console.error(
      "[SUPER ADMIN ERROR]",
      e
    );

    showMsg(
      "❌ System Error"
    );
  }

  setTimeout(
    function () {

      lock = false;

    },
    300
  );
}

/* ================= CREATE SYSTEM ADMIN ================= */

function createSystemAdmin() {

  console.log(
    "[SUPER ADMIN] CREATE CLICKED"
  );

  const id =
    document.getElementById(
      "sysId"
    )?.value?.trim();

  const name =
    document.getElementById(
      "sysName"
    )?.value?.trim();

  const pass =
    document.getElementById(
      "sysPass"
    )?.value?.trim();

  if (
    !id ||
    !name ||
    !pass
  ) {

    showMsg(
      "❌ Fill all fields"
    );

    return;
  }

  const users =
    typeof getUsers ===
    "function"

      ? (
          getUsers() || []
        )

      : [];

  const exists =
    users.find(function (u) {

      return (
        (
          u.userId || ""
        ).toLowerCase() ===
        id.toLowerCase()
      );
    });

  if (exists) {

    showMsg(
      "⚠️ ID already exists"
    );

    return;
  }

  const newAdmin = {

    userId: id,

    username: name,

    password:
      encodePassword(pass),

    role:
      "system_admin",

    status:
      "active",

    createdBy:
      currentUser?.userId ||
      "SYSTEM",

    createdAt:
      Date.now()
  };

  users.push(newAdmin);

  if (
    typeof saveUsers ===
    "function"
  ) {

    saveUsers(users);

  } else {

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );
  }

  showMsg(
    "✅ System Admin Created Successfully"
  );

  document.getElementById(
    "sysId"
  ).value = "";

  document.getElementById(
    "sysName"
  ).value = "";

  document.getElementById(
    "sysPass"
  ).value = "";

  console.log(
    "[SUPER ADMIN] CREATED:",
    id
  );
}

/* ================= EVENTS ================= */

function bindEvents() {

  const btn =
    document.getElementById(
      "createBtn"
    );

  if (!btn) {

    console.warn(
      "[SUPER ADMIN] createBtn missing"
    );

    return;
  }

  btn.onclick = null;

  btn.onclick = function () {

    safeClick(
      createSystemAdmin
    );
  };

  console.log(
    "[SUPER ADMIN] BUTTON BOUND OK"
  );
}

/* ================= MODULE START ================= */

function startModule() {

  try {

const authOK =
  checkAuth();

if (!authOK) {

  showMsg(
    "❌ Authentication Failed"
  );

  return;
}

bindEvents();
    
    console.log(
      "[SUPER ADMIN CREATE SYSTEM ADMIN] ACTIVE"
    );

  } catch (err) {

    console.error(
      "[SUPER ADMIN INIT ERROR]",
      err
    );
  }
}

/* ================= EXPORTS ================= */

window.createSystemAdmin =
  createSystemAdmin;

window.showMsg =
  showMsg;

window.startSuperAdminCreateSystemAdmin =
  startModule;

/* ================= MODULE FLAGS ================= */

window.__SUPER_ADMIN_CREATE_SYSTEM_ADMIN__ =
  true;

window.super_admin_create_system_admin =
  true;

window.__SUPER_ADMIN_MODULE__ = {

  loaded: true,

  name:
    "super_admin_create_system_admin",

  time:
    Date.now()
};

console.log(
  "[SUPER ADMIN CREATE SYSTEM ADMIN] MODULE LOADED OK"
);

/* ================= AUTO START ================= */

startModule();
