"use strict";

/*
========================================
SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER V1.0
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

console.log("[SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER] INIT");


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

/* ================= CREATE SYSTEM ADMIN ================= */

function createSystemAdmin() {

  console.log("[CREATE SYSTEM ADMIN CALLED]");

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

  console.log("[BIND EVENTS START]");

  const btn =
    document.getElementById("createBtn");

  console.log("[BUTTON FOUND]", btn);

  if (!btn) {

    console.error(
      "[CREATE ADMIN] BUTTON NOT FOUND"
    );

    return;

  }

  btn.style.border = "4px solid red";

  btn.onclick = null;

  btn.onclick = function () {

    console.log(
      "[CREATE BUTTON CLICKED]"
    );

    safeClick(function () {

      createSystemAdmin();

    });

  };

  console.log(
    "[CREATE ADMIN] BUTTON CONNECTED"
  );

}
/* ================= START ================= */

function startModule() {

  console.log("[START MODULE]");

  if (!checkAuth()) {

    showMsg("❌ Authentication Failed");

    return;

  }

  bindEvents();

  console.log("[BIND EVENTS DONE]");

  loadSystemAdminList();

  console.log("[LIST LOADED]");

  console.log(
    "[SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER] ACTIVE"
  );

}



/* ================= EXPORT ================= */


window.createSystemAdmin =
  createSystemAdmin;


window.startSuperAdminCreateSystemAdmin =
  startModule;


window.showMsg =
  showMsg;



/* ================= MODULE FLAG ================= */


window.__SUPER_ADMIN_SYSTEM_ADMIN_CREATION_CONTROLLER__ = {
    loaded: true,
    initialized: true,
    time: Date.now()
};


/* ================= PIN REGISTRY ================= */


if (window.PIN) {

  PIN.register(
    "create",
    startSuperAdminCreateSystemAdmin
  );

}


/* ================= CREATE MODULE LOADER ================= */

function renderCreateAdmin() {

  return `

    <div class="section-title">
      Create System Admin
    </div>

    <div id="msg"></div>

    <div class="info-box">

      <label>User ID</label>
      <input
        id="sysId"
        type="text"
        placeholder="Enter System Admin ID"
      >

      <label>Name</label>
      <input
        id="sysName"
        type="text"
        placeholder="Enter Name"
      >

      <label>Password</label>
      <input
        id="sysPass"
        type="password"
        placeholder="Enter Password"
      >

      <button
        id="createBtn"
        class="action-btn"
      >
        Create System Admin
      </button>

    </div>

    <hr>

    <div id="systemAdminList"></div>

  `;

}
// Module loading is handled by
// core_module_asset_loader.js

console.log(
  "[SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER] LOADER READY"
);
