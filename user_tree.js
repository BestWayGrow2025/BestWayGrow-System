/*
========================================
USER TREE JS (INTRODUCER TREE ONLY)
FINAL LOCKED VERSION
========================================
✔ Uses ONLY introducer tree (visible tree)
✔ Sponsor tree completely ignored in UI
✔ Safe recursion + cycle protection
✔ Works with tree_system.js V13
========================================
*/

// ================= STATE =================
let session = null;
let currentUser = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  renderPage();
});

// ================= CORE INIT =================
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

// ================= RENDER ENTRY =================
function renderPage() {
  const container = document.getElementById("tree");
  if (!container || !currentUser) return;

  container.innerHTML = "";

  const tree = renderIntroducerTree(currentUser.userId);

  if (tree) {
    container.appendChild(tree);
  }
}

// ================= INTRODUCER TREE NODE =================
function createNodeByIntroducer(user, depth = 0, visited = new Set()) {
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

  const rightWrap = document.createElement("div");
  rightWrap.className = "mlm-right";

  // ================= INTRODUCER-BASED CHILDREN =================
  // IMPORTANT: ONLY introducerId is used here

  const users = (typeof getUsers === "function") ? getUsers() : [];

  const leftChild = users.find(
    u => u.introducerId === user.userId && u.position === "L"
  );

  const rightChild = users.find(
    u => u.introducerId === user.userId && u.position === "R"
  );

  if (leftChild) {
    const leftNode = createNodeByIntroducer(leftChild, depth + 1, visited);
    if (leftNode) leftWrap.appendChild(leftNode);
  }

  if (rightChild) {
    const rightNode = createNodeByIntroducer(rightChild, depth + 1, visited);
    if (rightNode) rightWrap.appendChild(rightNode);
  }

  children.appendChild(leftWrap);
  children.appendChild(rightWrap);

  node.appendChild(children);

  return node;
}

// ================= MAIN RENDER =================
function renderIntroducerTree(rootUserId) {
  const rootUser = getUserById(rootUserId);
  if (!rootUser) return null;

  const root = document.createElement("div");
  root.className = "mlm-tree";

  root.appendChild(createNodeByIntroducer(rootUser));

  return root;
}
