"use strict";

/*
========================================
SUPER ADMIN CREATE SYSTEM ADMIN v5.0 FINAL
========================================
✔ PIN Registry Connected
✔ Super Admin Auth Only
✔ Create System Admin
✔ Save User Data
✔ Auto Refresh Admin List
✔ Clean Production Flow
========================================
*/

let session = null;
let currentUser = null;
let lock = false;

console.log("[SUPER ADMIN CREATE SYSTEM ADMIN] INIT");


/* ================= AUTH CHECK ================= */

function checkAuth() {

  session =
    typeof window.getSession === "function"
      ? window.getSession()
      : null;


  if (!session) return false;

  if (!session.userId) return false;

  if (session.role !== "super_admin")
    return false;


  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;


  if (!currentUser) return false;

  if (currentUser.role !== "super_admin")
    return false;


  return true;
}


/* ================= MESSAGE ================= */

function showMsg(text) {

  const el =
    document.getElementById("msg");

  if (el) {

    el.innerText = text;

  }

}


/* ================= PASSWORD ================= */

function encodePassword(p) {

  try {

    return btoa(p);

  } catch(e) {

    return p;

  }

}


/* ================= CREATE SYSTEM ADMIN ================= */

function createSystemAdmin() {


  const id =
    document.getElementById("sysId")
    ?.value
    ?.trim();


  const name =
    document.getElementById("sysName")
    ?.value
    ?.trim();


  const pass =
    document.getElementById("sysPass")
    ?.value
    ?.trim();



  if (!id || !name || !pass) {

    showMsg("❌ Fill all fields");

    return;

  }



  const users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];



  const exists =
    users.find(
      u =>
      (u.userId || "").toLowerCase()
      === id.toLowerCase()
    );



  if (exists) {

    showMsg("⚠️ ID already exists");

    return;

  }



  const newAdmin = {

    userId:id,

    username:name,

    password:
      encodePassword(pass),

    role:"system_admin",

    status:"active",

    createdBy:
      currentUser?.userId || "SYSTEM",

    createdAt:
      Date.now()

  };



  users.push(newAdmin);



  if (typeof saveUsers === "function") {

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



  document.getElementById("sysId").value="";
  document.getElementById("sysName").value="";
  document.getElementById("sysPass").value="";



  loadSystemAdminList();



  console.log(
    "[SUPER ADMIN] CREATED:",
    id
  );

}



/* ================= SYSTEM ADMIN LIST ================= */


function loadSystemAdminList() {


  const box =
    document.getElementById(
      "systemAdminList"
    );


  if (!box) return;



  const users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];



  const admins =
    users.filter(
      u =>
      u.role === "system_admin"
    );



  if (!admins.length) {


    box.innerHTML =
      "<p>No System Admin Found</p>";


    return;

  }



  box.innerHTML =

    admins.map(
      admin => `

      <div class="admin-card">

        <h4>
        ${admin.username}
        </h4>

        <p>
        ID: ${admin.userId}
        </p>

        <p>
        Role: ${admin.role}
        </p>

        <p>
        Status: ${admin.status}
        </p>

        <p>
        Created By: ${admin.createdBy}
        </p>

      </div>

      `
    ).join("");

}



/* ================= SAFE CLICK ================= */

function safeClick(fn) {

  if (lock) return;

  lock = true;

  try {

    fn();

  } catch (e) {

    console.error("[SUPER ADMIN ERROR]", e);

    showMsg("❌ System Error");

  } finally {

    setTimeout(() => {
      lock = false;
    }, 300);

  }

}


/* ================= EVENTS ================= */

function bindEvents() {

  const btn = document.getElementById("createBtn");

  if (!btn) {

    console.error("[CREATE ADMIN] BUTTON NOT FOUND");

    return;

  }

  btn.onclick = null;

 btn.onclick = function () {

  console.log("[CREATE BUTTON CLICKED]");

  safeClick(createSystemAdmin);

};

  console.log("[CREATE ADMIN] BUTTON CONNECTED");

}


/* ================= START ================= */


function startModule() {


  if (!checkAuth()) {

    showMsg(
      "❌ Authentication Failed"
    );

    return;

  }


  setTimeout(() => {

    bindEvents();

    loadSystemAdminList();


    console.log(
      "[SUPER ADMIN CREATE SYSTEM ADMIN] ACTIVE"
    );


  }, 100);


}



/* ================= EXPORT ================= */


window.createSystemAdmin =
  createSystemAdmin;


window.startSuperAdminCreateSystemAdmin =
  startModule;


window.showMsg =
  showMsg;



/* ================= MODULE FLAG ================= */


window.__SUPER_ADMIN_MODULE__ = {

  loaded:true,

  name:
  "super_admin_create_system_admin",

  time:
  Date.now()

};



/* ================= PIN REGISTRY ================= */


if (window.PIN) {

  PIN.register(
    "create",
    startSuperAdminCreateSystemAdmin
  );

}


/* ================= CREATE MODULE LOADER ================= */

window.loadCreateSystemAdminRealModule = function(){

  try {

    if (
      typeof window.renderCreateAdmin === "function"
    ) {

      const box =
        document.getElementById("mainContent");


      if (box) {

        box.innerHTML =
          window.renderCreateAdmin();


        if (
          typeof window.startSuperAdminCreateSystemAdmin === "function"
        ) {

          window.startSuperAdminCreateSystemAdmin();

        }


        console.log(
          "[CREATE MODULE] RENDER SUCCESS"
        );


        return true;

      }

    }


    console.error(
      "[CREATE ADMIN] RENDER FUNCTION NOT FOUND"
    );


    return false;


  } catch(e) {


    console.error(
      "[CREATE MODULE ERROR]",
      e
    );


    return false;

  }

};



console.log(
 "[SUPER ADMIN CREATE SYSTEM ADMIN] READY"
);



// startModule(); 
// Disabled: module starts after renderer injection
