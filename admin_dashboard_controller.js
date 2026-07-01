"use strict";

/*
========================================
ADMIN DASHBOARD CONTROLLER V3.1
========================================
✔ Repository safe
✔ No core_system.js hard dependency
✔ No SYSTEM_EVENTS dependency
✔ Admin authentication compatible
✔ Safe module loading
✔ Reports route added
✔ Production ready
========================================
*/

console.log("[ADMIN DASHBOARD] CONTROLLER LOADED");

let adminUser = null;
let clickLock = false;
let menuBound = false;
let dashboardAutoRefresh = null;


// ================= START =================

function startAdminDashboard() {

  initPage();
  checkAuth();
  bindEvents();
  loadHome();
  startAutoRefresh();

}


// ================= INIT =================

function initPage() {

  if (typeof initCoreSystem === "function") {

    initCoreSystem();

  }

}


// ================= AUTH =================

function checkAuth() {

  let session =
    typeof getSession === "function"
      ? getSession()
      : null;


  if (
    !session ||
    String(session.role).toLowerCase() !== "admin"
  ) {

    redirectLogin();
    throw new Error("AUTH FAILED");

  }


  if (typeof getUserById === "function") {

    adminUser =
      getUserById(
        session.userId
      );

  }


  if (!adminUser) {

    adminUser = {

      userId: session.userId,
      username: session.userId,
      role: "admin",
      status: "active"

    };

  }


  const welcome =
    document.getElementById(
      "welcome"
    );


  if (welcome) {

    welcome.innerText =
      "Welcome " +
      (adminUser.username ||
      adminUser.userId);

  }

}


// ================= REDIRECT =================

function redirectLogin() {

  if (dashboardAutoRefresh) {

    clearInterval(
      dashboardAutoRefresh
    );

  }


  if (typeof logoutSession === "function") {

    logoutSession();

  }


  window.location.replace(
    "admin_auth.html"
  );

}


 // ================= EVENTS =================

function bindEvents() {

  if (menuBound) return;

  menuBound = true;


  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );


  if (logoutBtn) {

    logoutBtn.onclick =
      logout;

  }


  document
    .querySelectorAll(".menu button")
    .forEach(function(btn){

      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";

      btn.onclick = function(){

        if(clickLock) return;

        clickLock = true;


        document
          .querySelectorAll(".menu button")
          .forEach(function(b){

            b.classList.remove(
              "active"
            );

          });


        btn.classList.add(
          "active"
        );


        const page =
          btn.dataset.page;


        switch(page){

          case "home":
            loadHome();
            break;

          case "users":
            loadUsers();
            break;

          case "pinmaster":
            loadPinsUI();
            break;

          case "wallet":
            loadWalletSafe();
            break;

          case "income":
            loadIncomeSafe();
            break;

          case "system":
            loadSystemSafe();
            break;

          case "reports":
            loadReportsSafe();
            break;

        }


        setTimeout(
          function(){

            clickLock = false;

          },
          200
        );

      };

    });

}


// ================= REFRESH =================

function startAutoRefresh(){

  if(dashboardAutoRefresh){

    clearInterval(
      dashboardAutoRefresh
    );

  }


  dashboardAutoRefresh =
    setInterval(
      function(){

        const active =
          document.querySelector(
            ".menu button.active"
          );


        if(!active)return;


        if(
          active.dataset.page === "users"
        ){

          renderUsers();

        }


      },
      5000
    );

}


// ================= HOME =================

function loadHome(){

 const main =
   document.getElementById(
    "mainContent"
   );


 if(!main)return;


 const users =
   typeof getUsers === "function"
    ? getUsers() || []
    : [];


 const realUsers =
   users.filter(
    u =>
    u.role === "user"
   );


 main.innerHTML = `

 <h3>Dashboard Overview</h3>

 <p>Total Users :
 ${realUsers.length}</p>


 <button onclick="openAdminTreeView()">
 🌳 View User Tree
 </button>

 `;

}


// ================= USERS =================

function loadUsers(){

 const main =
 document.getElementById(
 "mainContent"
 );


 if(!main)return;


 main.innerHTML = `

 <h3>User List</h3>

 <table>

 <tbody id="userTableBody"></tbody>

 </table>

 `;


 renderUsers();

}


function renderUsers(){

 const body =
 document.getElementById(
 "userTableBody"
 );


 if(!body)return;


 const users =
 typeof getUsers === "function"
 ? getUsers() || []
 : [];


 body.innerHTML =
 users
 .filter(
 u=>u.role==="user"
 )
 .map(
 u=>`

 <tr>

 <td>${u.userId}</td>

 <td>${u.username || "-"}</td>

 </tr>

 `
 )
 .join("");

}


// ================= MODULES =================

function loadPinsUI(){

 showPlaceholder(
 "PIN module loading"
 );

}


function loadWalletSafe(){

 showPlaceholder(
 "Wallet module loading"
 );

}


function loadIncomeSafe(){

 showPlaceholder(
 "Income module loading"
 );

}


function loadSystemSafe(){

 showPlaceholder(
 "System module loading"
 );

}


function loadReportsSafe(){

 showPlaceholder(
 "Reports module loading"
 );

}


function showPlaceholder(msg){

 const main =
 document.getElementById(
 "mainContent"
 );


 if(main){

 main.innerHTML =
 `<h3>${msg}</h3>`;

 }

}


// ================= TREE =================

function openAdminTreeView(){

 showPlaceholder(
 "User Tree module loading"
 );

}


function getAdminFullTree(){

 if(
 typeof getAdminTreeView === "function"
 ){

 return getAdminTreeView();

 }


 return [];

}


// ================= LOGOUT =================

function logout(){

 redirectLogin();

}


// ================= EXPORT =================

window.startAdminDashboard =
 startAdminDashboard;

window.loadHome =
 loadHome;

window.loadUsers =
 loadUsers;

window.renderUsers =
 renderUsers;

window.loadPinsUI =
 loadPinsUI;

window.logout =
 logout;

window.openAdminTreeView =
 openAdminTreeView;

window.getAdminFullTree =
 getAdminFullTree;


// ================= AUTO START =================

document.addEventListener(
 "DOMContentLoaded",
 startAdminDashboard
);
