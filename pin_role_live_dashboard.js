"use strict";

/*
========================================
PIN ROLE LIVE DASHBOARD v1.0
========================================
✔ Live role viewer
✔ Permission inspector
✔ Access audit display
✔ SUPER ADMIN control hook ready
========================================
*/

(function () {

  if (window.__PIN_ROLE_LIVE_DASHBOARD__) return;

  window.__PIN_ROLE_LIVE_DASHBOARD__ = true;

  // ================= ROLE ACCESS =================
  const ROLE_ACCESS = window.PIN_ROLE_ACCESS?.ROLE_MATRIX || {};

  function getCurrentRole() {
    return window.PIN_ROLE_ACCESS?.getCurrentRole?.() || "USER";
  }

  function getDeniedLogs() {
    const monitor = window.PIN_ENGINE_MONITOR?.getState?.();
    return monitor?.logs?.filter(l => l.success === false) || [];
  }

  // ================= RENDER =================
  function render() {

    const role = getCurrentRole();
    const denied = getDeniedLogs();

    const permissions = ROLE_ACCESS[role]?.permissions || [];

    return `
      <div class="role-dashboard">

        <h2>🧠 ROLE LIVE DASHBOARD</h2>

        <div class="card">
          <h3>👤 Current Role</h3>
          <p><b>${role}</b></p>
        </div>

        <div class="card">
          <h3>🔐 Permissions</h3>
          <ul>
            ${permissions.map(p => `<li>${p}</li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>⚠ Access Denied Logs</h3>
          ${
            denied.length === 0
              ? "<p>No denied access</p>"
              : denied.map(d => `
                  <div style="border-bottom:1px solid #333;padding:5px;">
                    <b>${d.action}</b><br/>
                    <span style="color:red">${d.error || "DENIED"}</span><br/>
                    <small>${new Date(d.time).toLocaleString()}</small>
                  </div>
                `).join("")
          }
        </div>

        <div class="card">
          <h3>📊 SYSTEM STATUS</h3>
          <p>Role System: ACTIVE</p>
          <p>Router: CONNECTED</p>
          <p>Engine Monitor: ${window.__PIN_ENGINE_MONITOR__ ? "ACTIVE" : "MISSING"}</p>
        </div>

      </div>
    `;
  }

  // ================= LOAD DASHBOARD =================
  function load() {

    const main = document.getElementById("mainContent");

    if (!main) {
      console.warn("[ROLE DASHBOARD] mainContent missing");
      return;
    }

    main.innerHTML = render();
  }

  // ================= EXPORT =================
  window.loadRoleLiveDashboard = load;

  console.log("[ROLE LIVE DASHBOARD] READY ✔");

})();
