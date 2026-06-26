"use strict";

/*
========================================
REGISTRATION APPROVAL DASHBOARD v1.0
========================================
✔ Admin-controlled queue approval
✔ Safe integration with registration_queue.js
✔ Approve / Reject workflow
✔ Live refresh
✔ Safe dependency checks
✔ Production-ready
========================================
*/

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  loadQueue();
});

// ================= INIT =================
function initPage() {

  if (typeof getSession !== "function") {
    alert("Session system missing");
    return;
  }

  const session = getSession();

  if (!session || session.role !== "admin") {
    alert("Access Denied");

    // Replace with platform router if applicable
    window.location.href = "admin_login.html";
    return;
  }
}

// ================= LOAD QUEUE =================
function loadQueue() {

  const tbody = document.getElementById("list");
  if (!tbody) return;

  if (typeof getRegQueue !== "function") {
    tbody.innerHTML =
      '<tr><td colspan="6">Registration queue system missing.</td></tr>';
    return;
  }

  const queue = getRegQueue() || [];

  tbody.innerHTML = "";

  queue.forEach(function (item, index) {

    if (item.status !== "PENDING") return;

    tbody.innerHTML += `
      <tr>
        <td>${item.mobile}</td>
        <td>${item.username}</td>
        <td>${item.email}</td>
        <td>${item.position}</td>
        <td>${item.status}</td>
        <td>
          <button class="approve" onclick="approve(${index})">
            Approve
          </button>

          <button class="reject" onclick="reject(${index})">
            Reject
          </button>
        </td>
      </tr>
    `;
  });

  if (tbody.innerHTML === "") {
    tbody.innerHTML =
      '<tr><td colspan="6">No pending registrations.</td></tr>';
  }
}

// ================= APPROVE =================
function approve(index) {

  if (
    typeof getRegQueue !== "function" ||
    typeof saveRegQueue !== "function"
  ) {
    alert("Registration queue system missing.");
    return;
  }

  const queue = getRegQueue();

  if (!queue[index]) return;

  queue[index].status = "APPROVED";
  queue[index].approvedAt = Date.now();

  saveRegQueue(queue);

  alert("Approved");

  loadQueue();
}

// ================= REJECT =================
function reject(index) {

  if (
    typeof getRegQueue !== "function" ||
    typeof saveRegQueue !== "function"
  ) {
    alert("Registration queue system missing.");
    return;
  }

  const queue = getRegQueue();

  if (!queue[index]) return;

  queue[index].status = "FAILED";
  queue[index].error = "Rejected by admin";

  saveRegQueue(queue);

  alert("Rejected");

  loadQueue();
}

// ================= EXPORT =================
window.loadQueue = loadQueue;
window.approve = approve;
window.reject = reject;
