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
    localStorage.removeItem("loggedInFranchise");
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
  let backBtn = document.getElementById("backBtn");
  let submitBtn = document.getElementById("submitBtn");

  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", submitRequest);
  }
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

  let quantityInput = document.getElementById("quantity");
  if (!quantityInput) return;

  let qty = parseInt(quantityInput.value, 10);

  if (!qty || qty <= 0) {
    alert("Enter valid quantity");
    return;
  }

  lock = true;

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

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "franchise", "Created PIN Request", "FRANCHISE");
  }

  alert("✅ PIN Request Submitted");

  quantityInput.value = "";
  loadRequests();

  lock = false;
}

function loadRequests() {
  let table = document.getElementById("requestTable");
  if (!table) return;

  let requests = getRequests();

  let myRequests = requests.filter(function (request) {
    return request.userId === currentUser.userId;
  });

  table.innerHTML = "";

  if (!myRequests.length) {
    table.innerHTML = "<tr><td colspan='4'>No requests</td></tr>";
    return;
  }

  myRequests
    .slice()
    .reverse()
    .forEach(function (request) {
      let row = document.createElement("tr");

      row.innerHTML =
        "<td>" + (request.requestId || "-") + "</td>" +
        "<td>" + (request.quantity || 0) + "</td>" +
        "<td>" + (request.status || "-") + "</td>" +
        "<td>" + (request.createdAt ? new Date(request.createdAt).toLocaleString() : "-") + "</td>";

      table.appendChild(row);
    });
}

function goBack() {
  window.location.href = "franchise_dashboard.html";
}
