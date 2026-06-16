"use strict";

/*
========================================
SUPER ADMIN DASHBOARD V1.0 FINAL SINGLE PATH
========================================
✔ Super Admin only
✔ One session source
✔ One auth path
✔ No System Admin dependency
✔ No redirect contamination
✔ Production stable
========================================
*/

console.log("[SUPER ADMIN DASHBOARD] LOADED");


let dashboardReady = false;


// ===============================
// START
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    try {

      initSuperAdminDashboard();

    } catch (err) {

      console.error(
        "[SUPER ADMIN DASHBOARD ERROR]",
        err
      );

    }

  }
);


// ===============================
// INIT
// ===============================

function initSuperAdminDashboard() {

  if (dashboardReady) return;

  dashboardReady = true;


  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }


  if (!checkSuperAdminAuth()) {
    return;
  }


  loadProfile();

  bindEvents();

  console.log(
    "[SUPER ADMIN DASHBOARD] READY"
  );
}


// ===============================
// AUTH
// ===============================

function checkSuperAdminAuth() {

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;


  if (!session) {

    window.location.href =
      "super_admin_login.html";

    return false;

  }


  if (session.role !== "super_admin") {

    console.error(
      "[SUPER ADMIN] INVALID ROLE",
      session.role
    );


    window.location.href =
      "super_admin_login.html";

    return false;

  }


  const user =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;


  if (!user) {

    window.location.href =
      "super_admin_login.html";

    return false;

  }


  if (user.role !== "super_admin") {

    window.location.href =
      "super_admin_login.html";

    return false;

  }


  window.__CURRENT_SUPER_ADMIN__ = user;


  return true;

}


// ===============================
// PROFILE
// ===============================

function loadProfile() {


  const user =
    window.__CURRENT_SUPER_ADMIN__;


  const welcome =
    document.getElementById("welcome");


  if (welcome && user) {

    welcome.innerText =
      "Welcome " + user.username;

  }

}


// ===============================
// EVENTS
// ===============================

function bindEvents() {


  const logout =
    document.getElementById("logoutBtn");


  if (
    logout &&
    !logout.dataset.bound
  ) {

    logout.dataset.bound = "true";


    logout.onclick =
      logoutSuperAdmin;

  }



  const back =
    document.getElementById("backBtn");


  if (
    back &&
    !back.dataset.bound
  ) {

    back.dataset.bound = "true";


    back.onclick =
      function () {

        window.history.back();

      };

  }


  document
    .querySelectorAll("[data-page]")
    .forEach(function(button){


      if (button.dataset.bound)
        return;


      button.dataset.bound = "true";


      button.onclick =
        function(){

          openModule(
            button.dataset.page
          );

        };


    });

}


// ===============================
// MODULE OPEN
// ===============================

function openModule(page) {


  console.log(
    "[SUPER ADMIN MODULE]",
    page
  );


  if (
    typeof window.openSystemPage ===
    "function"
  ) {

    window.openSystemPage(page);

    return;

  }


  const box =
    document.getElementById(
      "mainContent"
    );


  if (box) {

    box.innerHTML =
      "<h3>" +
      page.toUpperCase() +
      "</h3>";

  }

}


// ===============================
// LOGOUT
// ===============================

function logoutSuperAdmin(){


  try {


    if (
      typeof logoutSession ===
      "function"
    ) {

      logoutSession();

      return;

    }


  } catch(e){}



  localStorage.removeItem(
    "APP_SESSION"
  );


  window.location.href =
    "super_admin_login.html";

}


// ===============================
// EXPORT
// ===============================

window.SuperAdminDashboard = {

  init:
    initSuperAdminDashboard,

  logout:
    logoutSuperAdmin,

  open:
    openModule

};


window.__SUPER_ADMIN_DASHBOARD__ = true;


console.log(
  "[SUPER ADMIN DASHBOARD] MODULE READY"
);
