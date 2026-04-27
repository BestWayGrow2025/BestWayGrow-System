let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  }
}

function authPage() {
  session = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (!session || !session.userId) {
    alert("Login required");
    window.location.href = "user_login.html";
    return;
  }

  if (typeof getUserById !== "function") {
    window.location.href = "user_login.html";
    return;
  }

  currentUser = getUserById(session.userId);

  if (!currentUser) {
    alert("User not found");
    window.location.href = "user_login.html";
  }
}

function bindEvents() {
  // no events required
}

function loadPage() {
  loadTree();
}

function createNode(user) {
  if (!user) return null;

  let wrapper = document.createElement("div");
  wrapper.className = "node-wrap";

  let node = document.createElement("div");
  node.className = "node";
  node.innerHTML = `
    <b>${user.userId}</b><br>
    ${user.username}<br>
    ${user.mobile || ""}
  `;

  wrapper.appendChild(node);

  let children = document.createElement("div");
  children.className = "children";

  let hasChild = false;

  if (user.leftChild) {
    let leftUser = getUserById(user.leftChild);
    if (leftUser) {
      children.appendChild(createNode(leftUser));
      hasChild = true;
    }
  }

  if (user.rightChild) {
    let rightUser = getUserById(user.rightChild);
    if (rightUser) {
      children.appendChild(createNode(rightUser));
      hasChild = true;
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

function loadTree() {
  let container = document.getElementById("tree");

  if (!container || !currentUser) return;

  container.innerHTML = "";

  let tree = document.createElement("div");
  tree.className = "tree";

  let rootNode = createNode(currentUser);

  if (rootNode) {
    tree.appendChild(rootNode);
  }

  container.appendChild(tree);
}
