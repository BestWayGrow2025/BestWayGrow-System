
"use strict";

/*
========================================
USER TREE FINAL SIMPLE (L1 TO L30)
========================================
✔ Level-based view only (L1–L30)
✔ Introducer-based traversal
✔ Session protected
✔ Safe fallback handling
✔ UI stable rendering
========================================
*/

let session = null;
let currentUser = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  renderUI();
});

// ================= INIT CORE =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

// ================= AUTH =================
function authPage() {
  session = typeof getSession === "function" ? getSession() : null;

  const container = document.getElementById("tree");

  if (!session || !session.userId) {
    if (container) {
      container.innerHTML = "<div class='info-box'>Login Required</div>";
    }
    return;
  }

  currentUser = typeof getUserById === "function"
    ? getUserById(session.userId)
    : null;

  if (!currentUser && container) {
    container.innerHTML = "<div class='info-box'>User Not Found</div>";
  }
}

// ================= RENDER UI =================
function renderUI() {
  const container = document.getElementById("tree");

  if (!container) return;
  if (!currentUser) return;

  container.innerHTML = "";

  // TITLE
  const title = document.createElement("h2");
  title.innerText = "My Team Tree";
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

  // DEFAULT VIEW
  renderLevelTable(1);
}

// ================= LEVEL FETCH =================
function getUsersByLevel(rootUserId, targetLevel) {

  const users = typeof getUsers === "function" ? getUsers() : [];
  if (!Array.isArray(users)) return [];

  const result = [];

  let queue = [{ id: rootUserId, level: 0 }];
  let visited = new Set();

  while (queue.length > 0) {

    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;

    visited.add(current.id);

    const user = users.find(u => u.userId === current.id);
    if (!user) continue;

    if (current.level === targetLevel) {
      result.push(user);
      continue;
    }

    if (current.level < targetLevel) {

      if (user.leftChild) {
        queue.push({ id: user.leftChild, level: current.level + 1 });
      }

      if (user.rightChild) {
        queue.push({ id: user.rightChild, level: current.level + 1 });
      }
    }
  }

  return result;
}

// ================= RENDER TABLE =================
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
