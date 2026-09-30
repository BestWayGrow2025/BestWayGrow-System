"use strict";

(function () {

/*
========================================
RDI-006 — USER TEAM TREE
========================================
✔ Logged-in user = fixed Root
✔ Introducer-based L1 → L30
✔ Root never changes during inspection
✔ Click member = Inspect only
✔ ID + Name + Mobile
✔ Registration / Upgrade status
✔ L1–L30 hard limit per Root
✔ Fetch/display only
✔ No Sponsor/Placement business logic
========================================
*/

let session = null;
let currentUser = null;

/*
  The logged-in user remains the permanent
  primary Root for this page session.
*/
let primaryRootUserId = null;

/*
  Inspection path is only UI navigation.
  It NEVER replaces primaryRootUserId.
*/
let inspectionPath = [];


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", function () {

  authPage();

  if (!currentUser) return;

  primaryRootUserId = currentUser.userId;

  renderUI();

});


/* ================= AUTH ================= */

function forceLogout() {

  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  window.location.replace("user_auth.html");
}


function authPage() {

  if (typeof getSession !== "function") {
    return forceLogout();
  }

  session = getSession();

  if (!session) {
    return forceLogout();
  }

  if (typeof getCurrentUser !== "function") {
    return forceLogout();
  }

  currentUser = getCurrentUser();

  if (!currentUser) {
    return forceLogout();
  }

  if (typeof hasRole !== "function" || !hasRole("user")) {
    return forceLogout();
  }

  const status =
    currentUser.accountStatus ||
    currentUser.status ||
    "active";

  if (status !== "active") {
    return forceLogout();
  }

}


/* ================= ROOT ================= */

/*
  The logged-in Root NEVER changes.
*/
function getPrimaryRootUserId() {

  return primaryRootUserId || (
    currentUser ? currentUser.userId : null
  );

}


/*
  Current display Root.

  Important:
  This is only the person whose team is being inspected.
  It does NOT change the logged-in Root.
*/
function getDisplayRootUserId() {

  if (inspectionPath.length > 0) {
    return inspectionPath[inspectionPath.length - 1];
  }

  return getPrimaryRootUserId();

}


/* ================= USER LOOKUP ================= */

function findUserById(userId) {

  if (!userId) return null;

  /*
    getUsers() is read-only here.
    No Tree business logic is created.
  */
  if (typeof getUsers !== "function") {
    return null;
  }

  const users = getUsers();

  if (!Array.isArray(users)) {
    return null;
  }

  return users.find(function (u) {
    return String(u.userId) === String(userId);
  }) || null;

}


/* ================= LEVEL FETCH ================= */

/*
  Central Tree API remains authoritative.

  Each Root receives only L1–L30.
*/
function getUsersByLevel(rootUserId, targetLevel) {

  const level = Number(targetLevel);

  if (!rootUserId) return [];

  if (!Number.isInteger(level) || level < 1 || level > 30) {
    return [];
  }

  if (typeof getLevelUsers !== "function") {
    return [];
  }

  return getLevelUsers(rootUserId, level);

}


/* ================= UI ================= */

function renderUI() {

  const container = document.getElementById("tree");

  if (!container || !currentUser) return;

  container.innerHTML = "";

  const displayRootId = getDisplayRootUserId();

  const displayRoot = findUserById(displayRootId);

  if (!displayRoot) {
    container.innerHTML = "Root user not found.";
    return;
  }


  /* ================= TITLE ================= */

  const title = document.createElement("h2");

  if (inspectionPath.length === 0) {
    title.innerText = "My Team Tree (L1 - L30)";
  } else {
    title.innerText =
      "Inspect Team — " +
      (displayRoot.name ||
       displayRoot.username ||
       displayRoot.userId);
  }

  container.appendChild(title);


  /* ================= BREADCRUMB ================= */

  renderBreadcrumb(container);


  /* ================= ACTIONS ================= */

  renderActions(container);


  /* ================= LEVEL SELECT ================= */

  const select = document.createElement("select");

  select.id = "levelSelect";

  select.style.padding = "8px";
  select.style.marginBottom = "15px";

  for (let i = 1; i <= 30; i++) {

    const option = document.createElement("option");

    option.value = i;
    option.innerText = "Level L" + i;

    select.appendChild(option);
  }

  select.addEventListener("change", function () {

    renderLevelTable(Number(this.value));

  });

  container.appendChild(select);


  /* ================= TABLE ================= */

  const table = document.createElement("table");

  table.id = "treeTable";

  table.border = "1";

  table.style.width = "100%";
  table.style.marginTop = "10px";
  table.style.borderCollapse = "collapse";

  container.appendChild(table);


  renderLevelTable(1);

}


/* ================= BREADCRUMB ================= */

function renderBreadcrumb(container) {

  const breadcrumb = document.createElement("div");

  breadcrumb.className = "mlm-breadcrumb";

  const rootText =
    currentUser.name ||
    currentUser.username ||
    currentUser.userId;

  let html = "My Team";

  if (inspectionPath.length > 0) {

    html += " → " + escapeHTML(rootText);

    inspectionPath.forEach(function (userId) {

      const user = findUserById(userId);

      if (!user) return;

      html +=
        " → " +
        escapeHTML(
          user.name ||
          user.username ||
          user.userId
        );

    });

  }

  breadcrumb.innerHTML = html;

  container.appendChild(breadcrumb);

}


/* ================= ACTIONS ================= */

function renderActions(container) {

  const actions = document.createElement("div");

  actions.className = "mlm-actions";


  if (inspectionPath.length > 0) {

    const backButton = document.createElement("button");

    backButton.type = "button";

    backButton.innerText = "← Back";

    backButton.addEventListener("click", function () {

      inspectionPath.pop();

      renderUI();

    });

    actions.appendChild(backButton);


    const myTeamButton = document.createElement("button");

    myTeamButton.type = "button";

    myTeamButton.innerText = "My Team";

    myTeamButton.addEventListener("click", function () {

      inspectionPath = [];

      renderUI();

    });

    actions.appendChild(myTeamButton);

  }


  if (actions.children.length > 0) {
    container.appendChild(actions);
  }

}


/* ================= LEVEL TABLE ================= */

function renderLevelTable(level) {

  const table = document.getElementById("treeTable");

  if (!table) return;

  const rootUserId = getDisplayRootUserId();

  const users = getUsersByLevel(rootUserId, level);


  let html = `
    <tr>
      <th style="padding:8px;">S.No</th>
      <th style="padding:8px;">User ID</th>
      <th style="padding:8px;">Name</th>
      <th style="padding:8px;">Mobile</th>
      <th style="padding:8px;">Registration</th>
      <th style="padding:8px;">Upgrade</th>
    </tr>
  `;


  if (!users || users.length === 0) {

    html += `
      <tr>
        <td colspan="6"
            style="padding:10px; text-align:center;">
          No users found in L${level}
        </td>
      </tr>
    `;

  } else {

    users.forEach(function (u, index) {

      const userId =
        u.userId ||
        "";

      const name =
        u.name ||
        u.username ||
        userId;

      const mobile =
        u.mobile ||
        "-";


      const registrationStatus =
        getRegistrationStatus(u);

      const upgradeStatus =
        getUpgradeStatus(u);


      html += `
        <tr>

          <td style="padding:8px; text-align:center;">
            ${index + 1}
          </td>

          <td style="padding:8px;">
            <button
              type="button"
              class="tree-member-button"
              data-user-id="${escapeAttribute(userId)}"
              style="
                background:none;
                border:none;
                padding:0;
                cursor:pointer;
                font:inherit;
                text-decoration:underline;
              "
            >
              ${escapeHTML(userId)}
            </button>
          </td>

          <td style="padding:8px;">
            ${escapeHTML(name)}
          </td>

          <td style="padding:8px;">
            ${escapeHTML(mobile)}
          </td>

          <td style="padding:8px;">
            ${escapeHTML(registrationStatus)}
          </td>

          <td style="padding:8px;">
            ${escapeHTML(upgradeStatus)}
          </td>

        </tr>
      `;

    });

  }


  table.innerHTML = html;


  /*
    Click = Inspect only.
    primaryRootUserId is NEVER modified.
  */
  table
    .querySelectorAll(".tree-member-button")
    .forEach(function (button) {

      button.addEventListener("click", function () {

        const userId =
          this.getAttribute("data-user-id");

        inspectUser(userId);

      });

    });

}


/* ================= INSPECT ================= */

function inspectUser(userId) {

  if (!userId) return;

  const user = findUserById(userId);

  if (!user) return;

  /*
    Do NOT modify currentUser.
    Do NOT modify primaryRootUserId.

    Only create an inspection path.
  */
  inspectionPath.push(user.userId);

  renderUI();

}


/* ================= STATUS ================= */

function getRegistrationStatus(user) {

  if (!user) return "-";

  /*
    Read existing authoritative registration data.
    No new registration business logic.
  */

  if (
    user.registrationStatus !== undefined &&
    user.registrationStatus !== null
  ) {
    return String(user.registrationStatus);
  }

  if (
    user.registration !== undefined &&
    user.registration !== null
  ) {
    return String(user.registration);
  }

  /*
    Existing active user records are registered.
    This is display-only status.
  */
  if (
    user.createdAt ||
    user.registrationDate
  ) {
    return "Registered";
  }

  return "-";

}


function getUpgradeStatus(user) {

  if (!user) return "-";

  /*
    Upgrade module is not yet authoritative for this Tree.
    Therefore do not invent or fetch upgrade business logic.

    Read an existing stored display field only if present.
  */

  if (
    user.upgradeStatus !== undefined &&
    user.upgradeStatus !== null
  ) {
    return String(user.upgradeStatus);
  }

  if (
    user.upgraded !== undefined &&
    user.upgraded !== null
  ) {
    return user.upgraded ? "Upgraded" : "Not Upgraded";
  }

  return "-";

}


/* ================= SAFE HTML ================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* ================= EXPORT ================= */

window.getUsersByLevel = getUsersByLevel;

window.renderLevelTable = renderLevelTable;

window.inspectUser = inspectUser;

window.getPrimaryRootUserId = getPrimaryRootUserId;

window.getDisplayRootUserId = getDisplayRootUserId;


})();
