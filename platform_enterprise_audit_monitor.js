"use strict";

/*
========================================
PLATFORM ENTERPRISE AUDIT MONITOR V1.0
========================================
✔ Enterprise audit trail dashboard
✔ Displays latest platform actions
✔ Auto-refresh monitoring
✔ Read-only Super Admin tool
✔ Uses platform audit event journal layer
✔ Production safe
========================================
*/

// ================= CONFIG =================

const PLATFORM_AUDIT_REFRESH_INTERVAL = 5000;
let PLATFORM_AUDIT_MONITOR_TIMER = null;


// ================= INIT GUARD =================

(function () {

  if (window.__PLATFORM_ENTERPRISE_AUDIT_MONITOR__) {
    return;
  }

  window.__PLATFORM_ENTERPRISE_AUDIT_MONITOR__ = true;

  document.addEventListener(
    "DOMContentLoaded",
    initPlatformEnterpriseAuditMonitor
  );

})();


// ================= INIT =================

function initPlatformEnterpriseAuditMonitor() {

  const container =
    document.getElementById(
      "platformEnterpriseAuditPanel"
    );

  if (!container) return;

  renderPlatformEnterpriseAuditMonitor();

  startPlatformAuditRefresh();

}


// ================= REFRESH =================

function startPlatformAuditRefresh() {

  if (PLATFORM_AUDIT_MONITOR_TIMER) {

    clearInterval(
      PLATFORM_AUDIT_MONITOR_TIMER
    );

  }


  PLATFORM_AUDIT_MONITOR_TIMER =
    setInterval(
      renderPlatformEnterpriseAuditTable,
      PLATFORM_AUDIT_REFRESH_INTERVAL
    );

}


// ================= PANEL =================

function renderPlatformEnterpriseAuditMonitor() {

  const container =
    document.getElementById(
      "platformEnterpriseAuditPanel"
    );


  if (!container) return;


  container.innerHTML = `

    <h3>
      📜 PLATFORM ENTERPRISE AUDIT MONITOR
    </h3>

    <div id="platformEnterpriseAuditTable"></div>

  `;


  renderPlatformEnterpriseAuditTable();

}


// ================= TABLE =================

function renderPlatformEnterpriseAuditTable() {

  const table =
    document.getElementById(
      "platformEnterpriseAuditTable"
    );


  if (!table) return;


  const logs =
    typeof window.getPlatformAuditLogs === "function"
      ? window.getPlatformAuditLogs()
      : [];


  const recent =
    Array.isArray(logs)
      ? logs.slice(-50).reverse()
      : [];


  if (!recent.length) {

    table.innerHTML = `

      <p style="color:#777;">
        No audit records available.
      </p>

    `;

    return;

  }


  let html = `

    <table
      border="1"
      width="100%"
      style="border-collapse:collapse;">

      <tr>
        <th>Time</th>
        <th>Event</th>
        <th>Details</th>
      </tr>

  `;


  recent.forEach(function (log) {


    const time =
      log.timestamp
        ? new Date(
            log.timestamp
          ).toLocaleString()
        : "-";


    const event =
      escapePlatformAuditHtml(
        log.event || "-"
      );


    const details =
      escapePlatformAuditHtml(
        JSON.stringify(
          log.data || {}
        ).slice(0, 200)
      );


    html += `

      <tr>

        <td>${time}</td>

        <td>${event}</td>

        <td>${details}</td>

      </tr>

    `;

  });


  html += `</table>`;


  table.innerHTML = html;

}


// ================= SAFE HTML =================

function escapePlatformAuditHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    );

}


// ================= EXPORT =================

window.renderPlatformEnterpriseAuditMonitor =
  renderPlatformEnterpriseAuditMonitor;


window.renderPlatformEnterpriseAuditTable =
  renderPlatformEnterpriseAuditTable;
