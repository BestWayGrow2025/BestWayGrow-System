"use strict";

/*
========================================
ADMIN ACTIVITY AUDIT CONTROLLER V1.0
========================================
✔ Admin activity audit viewer
✔ Safe admin authentication
✔ Activity log filtering
✔ Read-only audit monitoring
✔ Platform naming aligned
✔ Dashboard compatible
========================================
*/

let adminAuditSession = null;
let adminAuditUser = null;


// ================= INIT =================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initAdminActivityAudit();

  }
);


// ================= CONTROLLER INIT =================

function initAdminActivityAudit() {

  try {

    initAdminAuditPage();

    authenticateAdminAudit();

    if (!adminAuditUser?.userId) {
      return;
    }

    bindAdminAuditEvents();

    loadAdminActivityLogs();


  } catch (err) {

    console.error(
      "[ADMIN ACTIVITY AUDIT ERROR]",
      err
    );

  }

}


// ================= CORE INIT =================

function initAdminAuditPage() {

  if (
    typeof initCoreSystem === "function"
  ) {

    initCoreSystem();

  }

}


// ================= AUTH =================

function authenticateAdminAudit() {

  adminAuditSession =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (
    !adminAuditSession ||
    !adminAuditSession.userId
  ) {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  adminAuditUser =
    typeof getUserById === "function"
      ? getUserById(adminAuditSession.userId)
      : null;

  if (
    !adminAuditUser ||
    String(adminAuditUser.role).toLowerCase() !== "admin"
  ) {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  if (
    (adminAuditUser.status || "active") !== "active"
  ) {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }

}


// ================= EVENTS =================

function bindAdminAuditEvents() {

  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const refreshBtn =
    document.getElementById(
      "refreshBtn"
    );

  const applyBtn =
    document.getElementById(
      "applyBtn"
    );

  const clearBtn =
    document.getElementById(
      "clearBtn"
    );


  if (backBtn) {

    backBtn.onclick =
      goAdminDashboard;

  }


  if (refreshBtn) {

    refreshBtn.onclick =
      loadAdminActivityLogs;

  }


  if (applyBtn) {

    applyBtn.onclick =
      applyAdminAuditFilter;

  }


  if (clearBtn) {

    clearBtn.onclick =
      clearAdminActivityLogs;

  }

}


// ================= NAV =================

function goAdminDashboard() {

 window.location.replace(
  "admin_dashboard.html"
);

}


// ================= ROLE DISPLAY =================

function getAdminAuditRoleClass(role) {

  if (role === "ADMIN")
    return "admin";

  if (role === "SYSTEM_ADMIN")
    return "system";

  if (role === "ERROR")
    return "error";

  return "";

}


// ================= LOAD LOGS =================

function loadAdminActivityLogs(
  customLogs = null
) {

  const container =
    document.getElementById(
      "logs"
    );


  if (!container)
    return;


const logs = Array.isArray(customLogs)
  ? customLogs
  : (
      typeof getActivityLogs === "function" &&
      Array.isArray(getActivityLogs())
    )
      ? getActivityLogs()
      : [];

  if (!Array.isArray(logs) || !logs.length) {

    container.innerHTML =
      "No activity logs found";

    return;

  }


  let html = "";


  logs
  .slice()
  .reverse()
  .forEach(function(log){

    html += `

      <div class="log ${getAdminAuditRoleClass(log.role)}">

        <b>
          ${log.role || "-"}
        </b>

        (${log.userId || "-"})

        →
        ${log.action || "-"}

        <br>

        <small>
        ${
          log.time
          ? new Date(log.time)
              .toLocaleString()
          : "-"
        }
        </small>

      </div>

    `;

  });


  container.innerHTML =
    html;


  if (
    typeof logActivity === "function" &&
    adminAuditUser?.userId
  ) {

    logActivity(
      adminAuditUser.userId,
      "ADMIN",
      "Viewed activity logs"
    );

  }

}


// ================= FILTER =================

function applyAdminAuditFilter() {

  const userId =
    document.getElementById(
      "filterUser"
    )?.value?.trim() || "";


  const role =
    document.getElementById(
      "filterRole"
    )?.value || "";


  const keyword =
    document.getElementById(
      "filterKeyword"
    )?.value?.trim() || "";


  const logs =
    typeof filterLogsAdvanced === "function"
      ? filterLogsAdvanced({
          userId,
          role,
          keyword
        })
      : [];


  loadAdminActivityLogs(logs);

}

window.applyAdminAuditFilter =
  applyAdminAuditFilter;

// ================= CLEAR =================

function clearAdminActivityLogs() {


  if (
    !confirm(
      "Delete all activity logs?"
    )
  ) {

    return;

  }


  if (
    typeof clearActivityLogs === "function"
  ) {

    clearActivityLogs();

  }


  loadAdminActivityLogs();


  alert(
    "Logs cleared"
  );

}

window.clearAdminActivityLogs =
  clearAdminActivityLogs;

// ================= EXPORT =================

window.initAdminActivityAudit =
  initAdminActivityAudit;


window.loadAdminActivityLogs =
  loadAdminActivityLogs;
