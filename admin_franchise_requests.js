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

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInAdmin");
    alert("Account inactive");
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  let refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", loadPage);

  let resetBtn = document.getElementById("resetPasswordBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetUserPassword);
}

function loadPage() {
  loadRequests();
}

function getRequests() {
  return JSON.parse(localStorage.getItem("franchiseRequests") || "[]");
}

function saveRequests(data) {
  localStorage.setItem("franchiseRequests", JSON.stringify(data));
}

function resetUserPassword() {
  let userId = prompt("Enter User ID:");
  if (!userId) return;

  let newPass = prompt("Enter New Password:");
  if (!newPass) return;

  let users = typeof getUsers === "function" ? getUsers() : [];
  let user = users.find(function (u) {
    return u.userId === userId;
  });

  if (!user) {
    alert("User not found");
    return;
  }

  user.password = btoa(newPass);
  saveUsers(users);

  alert("Password reset successful for " + userId);
}

function loadRequests() {
  let requests = getRequests();
  let container = document.getElementById("requestList");

  if (!container) return;

  if (!Array.isArray(requests) || requests.length === 0) {
    container.innerHTML = "No requests found";
    return;
  }

  let html = "";

  let list = requests.slice().reverse();

  list.forEach(function (req) {
    let actions = "✔ Processed";

    if (req.status === "PENDING") {
      actions = `
        <button class="approve-btn" onclick="approveRequest('${req.requestId}', '${req.userId}')">Approve</button>
        <button class="reject-btn" onclick="rejectRequest('${req.requestId}')">Reject</button>
      `;
    }

    html += `
      <div class="request-item">
        <b>ID:</b> ${req.requestId}<br>
        <b>User:</b> ${req.userId}<br>
        <b>Status:</b> ${req.status}<br><br>
        ${actions}
      </div>
    `;
  });

  container.innerHTML = html;
}

function approveRequest(requestId, userId) {
  let requests = getRequests();
  let users = typeof getUsers === "function" ? getUsers() : [];

  let req = requests.find(function (r) {
    return r.requestId === requestId;
  });

  let user = users.find(function (u) {
    return u.userId === userId;
  });

  if (!req) {
    alert("Request not found");
    return;
  }

  if (!user) {
    alert("User not found");
    return;
  }

  req.status = "APPROVED";
  user.role = "franchise";
  user.status = "active";
  user.isActive = true;

  if (typeof initWallet === "function") {
    initWallet(user);
  }

  saveRequests(requests);
  saveUsers(users);

  alert("Approved and user upgraded to Franchise");
  loadRequests();
}

function rejectRequest(requestId) {
  let requests = getRequests();

  let req = requests.find(function (r) {
    return r.requestId === requestId;
  });

  if (!req) {
    alert("Request not found");
    return;
  }

  req.status = "REJECTED";

  saveRequests(requests);

  alert("Request rejected");
  loadRequests();
}
