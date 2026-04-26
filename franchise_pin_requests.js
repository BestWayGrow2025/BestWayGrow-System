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
  session = JSON.parse(localStorage.getItem("loggedInFranchise") || "null");

  if (!session || !session.userId) {
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }

  if (typeof getUserById !== "function") {
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }

  currentUser = getUserById(session.userId);

  if (!currentUser || currentUser.role !== "franchise") {
    localStorage.removeItem("loggedInFranchise");
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }

  if ((currentUser.status || "active") !== "active") {
    localStorage.removeItem("loggedInFranchise");
    alert("Account inactive");
    window.location.href = "franchise_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("submitBtn").addEventListener("click", submitRequest);
}

function loadPage() {
  loadRequests();
}

function getRequests() {
  return JSON.parse(localStorage.getItem("pinRequests") || "[]");
}

function saveRequests(data) {
  localStorage.setItem("pinRequests", JSON.stringify(data));
}

function submitRequest() {
  if (lock) return;
  lock = true;

  let qty = parseInt(document.getElementById("quantity").value, 10);

  if (!qty || qty <= 0) {
    alert("Enter valid quantity");
    lock = false;
    return;
  }

  let requests = getRequests();

  let newRequest = {
    requestId: "REQ" + Date.now(),
    userId: currentUser.userId,
    quantity: qty,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };

  requests.push(newRequest);
  saveRequests(requests);

  alert("✅ PIN Request Submitted");

  document.getElementById("quantity").value = "";
  loadRequests();

  lock = false;
}

function loadRequests() {
  let requests = getRequests();
  let table = document.getElementById("requestTable");

  table.innerHTML = "";

  let myRequests = requests.filter(r => r.userId === currentUser.userId);

  if (!myRequests.length) {
    table.innerHTML = "<tr><td colspan='4'>No requests</td></tr>";
    return;
  }

  myRequests
    .slice()
    .reverse()
    .forEach(r => {
      let row = document.createElement("tr");

      row.innerHTML = `
        <td>${r.requestId || "-"}</td>
        <td>${r.quantity || 0}</td>
        <td>${r.status || "-"}</td>
        <td>${r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
      `;

      table.appendChild(row);
    });
}

function goBack() {
  window.location.href = "franchise_dashboard.html";
}
