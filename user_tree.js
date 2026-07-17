"use strict";

(function () {

/*
========================================
USER TREE FINAL SIMPLE (L1 TO L30)
========================================
✔ Introducer-based level view
✔ Session protected
✔ Uses CENTRAL tree_api.js
✔ Safe API-driven BFS removal
✔ Clean UI separation
✔ Production ready FINAL VERSION
========================================
*/

let session = null;
let currentUser = null;


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  renderUI();
});

/* ================= INIT CORE ================= */

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

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
/* ================= UI ================= */

function renderUI() {

  const container = document.getElementById("tree");

  if (!container || !currentUser) return;

  container.innerHTML = "";

  // TITLE
  const title = document.createElement("h2");
  title.innerText = "My Team Tree (L1 - L30)";
  container.appendChild(title);

  // LEVEL SELECT
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

  // TABLE
  const table = document.createElement("table");
  table.id = "treeTable";
  table.border = "1";
  table.style.width = "100%";
  table.style.marginTop = "10px";
  table.style.borderCollapse = "collapse";

  container.appendChild(table);

  renderLevelTable(1);
}

/* ================= LEVEL FETCH (NOW API DRIVEN) ================= */

function getUsersByLevel(rootUserId, targetLevel) {

  // 🔥 CENTRALIZED TREE API CALL
  if (typeof getLevelUsers === "function") {
    return getLevelUsers(rootUserId, targetLevel);
  }

  return [];
}

/* ================= TABLE RENDER ================= */

function renderLevelTable(level) {

  const table = document.getElementById("treeTable");

  if (!table || !currentUser) return;

  const users = getUsersByLevel(currentUser.userId, level);

  let html = `
    <tr>
      <th style="padding:8px;">S.No</th>
      <th style="padding:8px;">User Name</th>
      <th style="padding:8px;">Mobile</th>
    </tr>
  `;

  if (!users || users.length === 0) {

    html += `
      <tr>
        <td colspan="3" style="padding:10px; text-align:center;">
          No users found in L${level}
        </td>
      </tr>
    `;

  } else {

    users.forEach((u, index) => {

      html += `
        <tr>
          <td style="padding:8px; text-align:center;">${index + 1}</td>
          <td style="padding:8px;">
            ${u.username || u.name || u.userId}
          </td>
          <td style="padding:8px;">
            ${u.mobile || "-"}
          </td>
        </tr>
      `;
    });
  }

  table.innerHTML = html;
}

/* ================= EXPORT ================= */

window.getUsersByLevel = getUsersByLevel;
window.renderLevelTable = renderLevelTable;

})();
