let session = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  session = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (!session || !session.userId) {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  if (typeof getUserById !== "function") {
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "admin") {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.accountStatus || currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("refreshBtn").addEventListener("click", loadQueue);
}

function loadPage() {
  loadQueue();
}

function loadQueue() {
  if (typeof getRegQueue !== "function") {
    alert("Queue system missing");
    return;
  }

  let queue = getRegQueue() || [];
  let container = document.getElementById("queueList");

  if (!queue.length) {
    container.innerHTML = "<p>No requests found</p>";
    return;
  }

  container.innerHTML = queue.map(function (q) {
    return `
      <div class="item">
        <b>${q.username}</b><br>
        Mobile: ${q.mobile}<br>
        Status: ${q.status}<br>
        Request Time: ${q.requestTime ? new Date(q.requestTime).toLocaleString() : "N/A"}<br>
        ${q.error ? `Error: ${q.error}<br>` : ""}
      </div>
    `;
  }).join("");
}
