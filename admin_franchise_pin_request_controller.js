"use strict";

/*
========================================
ADMIN FRANCHISE PIN REQUEST CONTROLLER V1.0
========================================
✔ Admin Franchise PIN Request
✔ Authentication Guard
✔ PIN Request Creation
✔ Request Tracking
========================================
*/

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
  // Core initialization is handled by
  // core_boot_manager.js and core_initializer.js.
  // No legacy initCoreSystem() call is required.
}

function redirectLogin() {

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.replace("admin_franchise_auth.html");

}

function authPage() {

  if (typeof getSession !== "function") {
    return redirectLogin();
  }

  session = getSession();

  if (!session || !session.userId) {
    return redirectLogin();
  }

  if (typeof getCurrentUser !== "function") {
    return redirectLogin();
  }

  currentUser = getCurrentUser();

  if (!currentUser) {
    return redirectLogin();
  }

  if (typeof hasRole !== "function" || !hasRole("franchise")) {
    return redirectLogin();
  }

  const status =
    currentUser.accountStatus ||
    currentUser.status ||
    "active";

  if (status !== "active") {
    alert("Account inactive");
    return redirectLogin();
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
  logActivity(
    currentUser.userId,
    currentUser.role,
    "Created PIN Request",
    "FRANCHISE"
  );
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
window.location.href = "admin_franchise_dashboard.html";
}
