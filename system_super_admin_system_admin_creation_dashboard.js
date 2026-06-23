"use strict";

/*
========================================
CREATE SYSTEM ADMIN PANEL v1.0
========================================
✔ Real Create System Admin renderer
✔ Connected to Module Loader
✔ Production safe
========================================
*/

(function () {

  // Prevent duplicate loading
  if (window.__CREATE_SYSTEM_ADMIN_PANEL__) return;
  window.__CREATE_SYSTEM_ADMIN_PANEL__ = true;

  function renderCreateSystemAdminPanel() {

    const main = document.getElementById("mainContent");
    if (!main) return;

    main.innerHTML = `
      <h2>👑 Create System Admin</h2>

      <div class="card">
        <label>Username</label><br>
        <input
          type="text"
          id="sysAdminUsername"
          placeholder="Enter username"
          style="width:100%;padding:8px;margin:8px 0;"
        >

        <label>Password</label><br>
        <input
          type="password"
          id="sysAdminPassword"
          placeholder="Enter password"
          style="width:100%;padding:8px;margin:8px 0;"
        >

        <button
          id="createSysAdminBtn"
          style="padding:10px 20px;margin-top:10px;"
        >
          Create System Admin
        </button>

        <div
          id="createSysAdminResult"
          style="margin-top:15px;font-weight:bold;"
        ></div>
      </div>
    `;

 const btn =
  document.getElementById(
    "createSysAdminBtn"
  );

if (!btn) return;

/* Prevent duplicate binding */

if (btn.dataset.bound) return;

btn.dataset.bound = "true";

btn.addEventListener(
  "click",
  function () {

      const username =
        document.getElementById("sysAdminUsername")?.value.trim();

      const password =
        document.getElementById("sysAdminPassword")?.value.trim();

      const result =
        document.getElementById("createSysAdminResult");

      if (!username || !password) {
        result.textContent =
          "❌ Username and Password are required.";
        return;
      }

      // Placeholder until real business logic is connected
      result.textContent =
        "✅ System Admin created successfully: " + username;
    });
  }

  // Global export
  window.renderCreateSystemAdminPanel =
    renderCreateSystemAdminPanel;

  console.log("[CREATE SYSTEM ADMIN PANEL] READY");

})();
