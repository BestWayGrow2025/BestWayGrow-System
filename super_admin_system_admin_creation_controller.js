"use strict";

/*
========================================
SUPER ADMIN SYSTEM ADMIN CREATION
CONTROLLER

CSA007
========================================
✔ Super Admin authentication
✔ Automatic unique System Admin ID
✔ Automatic random initial password
✔ Active account creation
✔ Existing user storage preserved
✔ Existing System Admin list preserved
✔ Duplicate ID protection
✔ Generated credential display
========================================
*/

(() => {

  let session = null;
  let currentUser = null;
  let lock = false;


  console.log(
    "[SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER] INIT"
  );


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

  function encodePassword(password) {

    try {

      return btoa(password);

    } catch (e) {

      return password;

    }

  }


  /* ================= RANDOM STRING ================= */

  function randomString(length) {

    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let result = "";


    if (
      window.crypto &&
      window.crypto.getRandomValues
    ) {

      const values =
        new Uint32Array(length);

      window.crypto.getRandomValues(values);

      for (let i = 0; i < length; i++) {

        result +=
          chars[
            values[i] % chars.length
          ];

      }

      return result;

    }


    for (let i = 0; i < length; i++) {

      result +=
        chars[
          Math.floor(
            Math.random() * chars.length
          )
        ];

    }

    return result;

  }


  /* ================= UNIQUE SYSTEM ADMIN ID ================= */

  function generateSystemAdminId(users) {

    let id = "";

    do {

      id =
        "SYS-" +
        randomString(8);

    } while (

      users.some(
        user =>
          String(user?.userId || "")
            .toLowerCase()
            === id.toLowerCase()
      )

    );

    return id;

  }


  /* ================= RANDOM PASSWORD ================= */

  function generateInitialPassword() {

    return (
      randomString(14) +
      "!"
    );

  }


  /* ================= DISPLAY GENERATED CREDENTIALS ================= */

  function showGeneratedCredentials(
    id,
    password
  ) {

    const box =
      document.getElementById(
        "generatedCredentials"
      );

    const idEl =
      document.getElementById(
        "generatedSysId"
      );

    const passEl =
      document.getElementById(
        "generatedSysPass"
      );


    if (!box || !idEl || !passEl)
      return;


    idEl.textContent = id;

    passEl.textContent = password;

    box.hidden = false;

  }


  /* ================= CREATE SYSTEM ADMIN ================= */

  function createSystemAdmin() {

    console.log(
      "[CREATE SYSTEM ADMIN CALLED]"
    );


    const name =
      document.getElementById("sysName")
        ?.value
        ?.trim();


    if (!name) {

      showMsg(
        "❌ Enter System Admin Name"
      );

      return;

    }


    const users =
      typeof getUsers === "function"
        ? (getUsers() || [])
        : [];


    const id =
      generateSystemAdminId(users);


    const initialPassword =
      generateInitialPassword();


    const newAdmin = {

      userId: id,

      username: name,

      password:
        encodePassword(
          initialPassword
        ),

      role: "system_admin",

      status: "active",

      createdBy:
        currentUser?.userId || "SYSTEM",

      createdByRole:
        "super_admin",

      createdAt:
        Date.now()

    };


    users.push(newAdmin);


    if (
      typeof saveUsers === "function"
    ) {

      saveUsers(users);

    }

    else {

      localStorage.setItem(
        "users",
        JSON.stringify(users)
      );

    }


    showMsg(
      "✅ System Admin Created Successfully"
    );


    showGeneratedCredentials(
      id,
      initialPassword
    );


    const nameInput =
      document.getElementById(
        "sysName"
      );

    if (nameInput) {

      nameInput.value = "";

    }


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
        user =>
          user.role === "system_admin"
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

    }

    catch (e) {

      console.error(
        "[SUPER ADMIN ERROR]",
        e
      );

      showMsg(
        "❌ System Error"
      );

    }

    finally {

      setTimeout(
        () => {
          lock = false;
        },
        300
      );

    }

  }


  /* ================= EVENTS ================= */

  function bindCreateSystemAdminEvents() {

    const btn =
      document.getElementById(
        "createBtn"
      );


    if (!btn) {

      console.error(
        "[CREATE ADMIN] BUTTON NOT FOUND"
      );

      return;

    }


    btn.onclick =
      function () {

        safeClick(
          createSystemAdmin
        );

      };

  }


  /* ================= START ================= */

  function startModule() {

    if (!checkAuth()) {

      showMsg(
        "❌ Authentication Failed"
      );

      return;

    }


    bindCreateSystemAdminEvents();

    loadSystemAdminList();


    console.log(
      "[SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER] ACTIVE"
    );

  }


  /* ================= LEGACY RENDER BRIDGE ================= */

  /*
  Retained internally for compatibility.

  CSA005 does NOT use this renderer.
  The live CSA path loads CSA006 directly.
  */

  function renderCreateAdmin() {

    return `

      <div class="section-title">
        Create System Admin
      </div>

      <div id="msg"></div>

      <div class="info-box">

        <label>Name</label>

        <input
          id="sysName"
          type="text"
          placeholder="Enter Name"
        >

        <button
          id="createBtn"
          class="action-btn"
          type="button"
        >
          Create System Admin
        </button>

      </div>

      <div id="generatedCredentials"></div>

      <hr>

      <div id="systemAdminList"></div>

    `;

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


  console.log(
    "[SUPER ADMIN SYSTEM ADMIN CREATION CONTROLLER] LOADED"
  );


})();
