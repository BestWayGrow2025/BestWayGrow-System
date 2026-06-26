"use strict";

/*
========================================
ADMIN AUTH V1.1
========================================
✔ Admin login controller
✔ No legacy core_system.js dependency
✔ No session_manager.js dependency
✔ Uses available authority functions if present
✔ Safe session creation
✔ Admin role validation
✔ Production safe
========================================
*/

let ADMIN_LOGIN_LOCK = false;


// ================= INIT =================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    bindAdminLoginEvents();
    checkExistingAdminSession();

  }
);


// ================= EVENTS =================

function bindAdminLoginEvents() {

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
      submitAdminLogin
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

          submitAdminLogin();

        }

      }
    );

  }

}


// ================= EXISTING SESSION =================

function checkExistingAdminSession() {

  if (
    typeof getSession !== "function"
  ) {

    return;

  }


  const session =
    getSession();


  if (
    session &&
    session.userId &&
    String(session.role).toLowerCase() === "admin"
  ) {

    window.location.replace(
      "admin_dashboard.html"
    );

  }

}


// ================= LOGIN =================

function submitAdminLogin() {

  if (ADMIN_LOGIN_LOCK) return;

  ADMIN_LOGIN_LOCK = true;


  const id =
    document
      .getElementById("adminId")
      .value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById("password")
      .value
      .trim();



  if (!id || !password) {

    showAdminMessage(
      "⚠ Enter ID & Password"
    );

    unlockAdminLogin();

    return;

  }



  if (
    typeof getUsers !== "function"
  ) {

    showAdminMessage(
      "❌ User authority unavailable"
    );

    unlockAdminLogin();

    return;

  }



  const users =
    getUsers() || [];



  const admin =
    users.find(
      function (user) {


        return (

          String(
            user.userId || ""
          ).toLowerCase() === id


          &&


          String(
            user.role || ""
          ).toLowerCase() === "admin"


          &&


          verifyPassword(
            user.password,
            password
          )

        );

      }
    );



  if (!admin) {

    showAdminMessage(
      "❌ Invalid login"
    );

    unlockAdminLogin();

    return;

  }



  if (
    String(
      admin.status || "active"
    ).toLowerCase() !== "active"
  ) {

    showAdminMessage(
      "🚫 Account inactive"
    );

    unlockAdminLogin();

    return;

  }



  // SESSION AUTHORITY

  if (
    typeof setSession === "function"
  ) {


    setSession({

      userId:
        admin.userId,

      role:
        admin.role

    });


  }



  if (
    typeof logActivity === "function"
  ) {

    try {

      logActivity(
        admin.userId,
        "ADMIN",
        "Admin Login"
      );

    }
    catch(e){}

  }



  showAdminMessage(
    "✅ Login Successful"
  );


  setTimeout(
    function () {

      window.location.replace(
        "admin_dashboard.html"
      );

    },
    500
  );

}


// ================= PASSWORD =================

function verifyPassword(
  stored,
  entered
) {

  try {

    if (!stored) return false;


    const decoded =
      atob(stored);


    return decoded === entered;


  }
  catch(e) {

    return stored === entered;

  }

}


// ================= MESSAGE =================

function showAdminMessage(
  text
) {

  const box =
    document.getElementById(
      "msg"
    );


  if (box) {

    box.innerText = text;

  }
  else {

    alert(text);

  }

}


// ================= UNLOCK =================

function unlockAdminLogin() {

  ADMIN_LOGIN_LOCK = false;


  const btn =
    document.getElementById(
      "loginBtn"
    );


  if (btn) {

    btn.disabled = false;
    btn.innerText = "Login";

  }

}


// ================= EXPORT =================

window.submitAdminLogin =
  submitAdminLogin;
