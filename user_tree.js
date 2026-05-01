/*
========================================
USER TREE JS (STANDARD 2 - BINANCE STYLE)
========================================
✔ Logic only (NO CSS)
✔ Safe recursion + cycle protection
✔ Works with tree_system.js V13
========================================
*/

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  renderPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

let session = null;
let currentUser = null;

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

function renderPage() {
  renderUserTree(currentUser.userId);
}

function createTreeNode(user, depth = 0, visited = new Set()) {
  if (!user || depth > 12) return null;

  if (visited.has(user.userId)) return null;
  visited.add(user.userId);

  const node = document.createElement("div");
  node.className = "mlm-node";

  node.innerHTML = `
    <div class="mlm-card">
      <div class="uid">👤 ${user.userId}</div>
      <div class="name">${user.username || user.fullName || "N/A"}</div>
      <div class="mobile">${user.mobile || ""}</div>
    </div>
  `;

  const children = document.createElement("div");
  children.className = "mlm-children";

  const leftWrap = document.createElement("div");
  leftWrap.className = "mlm-left";

  if (user.leftChild) {
    const leftUser = getUserById(user.leftChild);
    if (leftUser) {
      const leftNode = createTreeNode(leftUser, depth + 1, visited);
      if (leftNode) leftWrap.appendChild(leftNode);
    }
  }

  const rightWrap = document.createElement("div");
  rightWrap.className = "mlm-right";

  if (user.rightChild) {
    const rightUser = getUserById(user.rightChild);
    if (rightUser) {
      const rightNode = createTreeNode(rightUser, depth + 1, visited);
      if (rightNode) rightWrap.appendChild(rightNode);
    }
  }

  children.appendChild(leftWrap);
  children.appendChild(rightWrap);

  node.appendChild(children);

  return node;
}

function renderUserTree(rootUserId) {
  const container = document.getElementById("tree");
  if (!container) return;

  const rootUser = getUserById(rootUserId);

  if (!rootUser) {
    container.innerHTML = "<div class='mlm-card'>Tree not found</div>";
    return;
  }

  container.innerHTML = "";

  const root = document.createElement("div");
  root.className = "mlm-tree";

  root.appendChild(createTreeNode(rootUser));

  container.appendChild(root);
}

