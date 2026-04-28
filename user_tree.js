// ========================================
// USER TREE FINAL LOCK
// Status: FINAL
// ========================================

// ================= STATE =================
let session = null;
let currentUser = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  loadPage();
});

// ================= INIT PAGE =================
function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

// ================= AUTH =================
function authPage() {
  try {
    session = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch (err) {
    session = null;
  }

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  if (typeof getUserById !== "function") {
    alert("System error");
    window.location.href = "user_login.html";
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser) {
    alert("User not found");
    localStorage.removeItem("loggedInUser");
    window.location.href = "user_login.html";
    return;
  }
}

// ================= LOAD PAGE =================
function loadPage() {
  loadTree();
}

// ================= SAFE TEXT =================
function safeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ================= CREATE NODE =================
function createNode(user, visited = new Set(), depth = 0) {
  if (!user || depth > 10) return null;

  if (visited.has(user.userId)) {
    return null;
  }

  visited.add(user.userId);

  let wrapper = document.createElement("div");
  wrapper.className = "node-wrap";

  let node = document.createElement("div");
  node.className = "node";

  let idEl = document.createElement("b");
  idEl.textContent = user.userId || "N/A";

  let nameEl = document.createElement("div");
  nameEl.textContent = user.username || user.fullName || "N/A";

  let mobileEl = document.createElement("div");
  mobileEl.textContent = user.mobile || "";

  node.appendChild(idEl);
  node.appendChild(document.createElement("br"));
  node.appendChild(nameEl);
  node.appendChild(mobileEl);

  wrapper.appendChild(node);

  let children = document.createElement("div");
  children.className = "children";

  let hasChild = false;

  if (typeof getUserById === "function" && user.leftChild) {
    let leftUser = getUserById(user.leftChild);

    if (leftUser) {
      let leftNode = createNode(leftUser, new Set(visited), depth + 1);
      if (leftNode) {
        children.appendChild(leftNode);
        hasChild = true;
      }
    }
  }

  if (typeof getUserById === "function" && user.rightChild) {
    let rightUser = getUserById(user.rightChild);

    if (rightUser) {
      let rightNode = createNode(rightUser, new Set(visited), depth + 1);
      if (rightNode) {
        children.appendChild(rightNode);
        hasChild = true;
      }
    }
  }

  if (hasChild) {
    let line = document.createElement("div");
    line.className = "line";
    wrapper.appendChild(line);
    wrapper.appendChild(children);
  }

  return wrapper;
}

// ================= LOAD TREE =================
function loadTree() {
  let container = document.getElementById("tree");

  if (!container || !currentUser) return;

  container.innerHTML = "";

  let tree = document.createElement("div");
  tree.className = "tree";

  let rootNode = createNode(currentUser);

  if (!rootNode) {
    let emptyNode = document.createElement("div");
    emptyNode.className = "node";
    emptyNode.textContent = "Tree unavailable";
    container.appendChild(emptyNode);
    return;
  }

  tree.appendChild(rootNode);
  container.appendChild(tree);
}
