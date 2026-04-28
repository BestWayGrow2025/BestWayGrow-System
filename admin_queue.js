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
        Status: ${q.status}<br><br>

        ${q.status === "PENDING"
          ? `<button class="approve" onclick="approveQueue('${q.mobile}')">✅ Approve</button>
             <button class="reject" onclick="rejectQueue('${q.mobile}')">❌ Reject</button>`
          : `<small>${q.status}</small>`}
      </div>
    `;
  }).join("");
}

function approveQueue(mobile) {
  if (lock) return;
  lock = true;

  try {
    if (typeof approveRegistration !== "function") {
      alert("Approve system missing");
      return;
    }

    let ok = approveRegistration(mobile);

    if (ok) {
      alert("✅ Approved");
      loadQueue();
    } else {
      alert("❌ Failed");
    }
  } finally {
    lock = false;
  }
}

function rejectQueue(mobile) {
  if (lock) return;
  lock = true;

  try {
    if (typeof rejectRegistration !== "function") {
      alert("Reject system missing");
      return;
    }

    let ok = rejectRegistration(mobile, "Rejected by admin");

    if (ok) {
      alert("❌ Rejected");
      loadQueue();
    } else {
      alert("Error");
    }
  } finally {
    lock = false;
  }
}
