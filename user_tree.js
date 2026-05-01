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
  try {
    session = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch {
    session = null;
  }

  if (!session || !session.userId) {
    window.location.href = "user_login.html";
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser) {
    localStorage.removeItem("loggedInUser");
    window.location.href = "user_login.html";
    return;
  }
}

// ================= RENDER UI =================
function renderUI() {
  const container = document.getElementById("tree");
  if (!container) return;

  container.innerHTML = "";

  // HEADER
  const title = document.createElement("h2");
  title.innerText = "My Team Tree";
  container.appendChild(title);

  // LEVEL SELECTOR
  const select = document.createElement("select");
  select.id = "levelSelect";

  for (let i = 1; i <= 30; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.innerText = "L" + i;
    select.appendChild(opt);
  }

  select.addEventListener("change", function () {
    renderLevelTable(parseInt(this.value));
  });

  container.appendChild(select);

  // TABLE WRAPPER
  const table = document.createElement("table");
  table.id = "treeTable";
  table.border = "1";
  table.style.width = "100%";
  table.style.marginTop = "15px";

  container.appendChild(table);

  // DEFAULT LOAD L1
  renderLevelTable(1);
}

// ================= GET LEVEL USERS =================
function getUsersByLevel(rootUserId, targetLevel) {
  const users = typeof getUsers === "function" ? getUsers() : [];
  const result = [];

  let queue = [{ id: rootUserId, level: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.level === targetLevel) {
      const user = users.find(u => u.userId === current.id);
      if (user) result.push(user);
    }

    if (current.level < targetLevel) {
      const user = users.find(u => u.userId === current.id);
      if (!user) continue;

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
  if (!table) return;

  const users = getUsersByLevel(currentUser.userId, level);

  let html = `
    <tr>
      <th>S.No</th>
      <th>User Name</th>
      <th>Mobile</th>
    </tr>
  `;

  users.forEach((u, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${u.username || u.name || u.userId}</td>
        <td>${u.mobile || "-"}</td>
      </tr>
    `;
  });

  if (users.length === 0) {
    html += `
      <tr>
        <td colspan="3">No users found in L${level}</td>
      </tr>
    `;
  }

  table.innerHTML = html;
}

