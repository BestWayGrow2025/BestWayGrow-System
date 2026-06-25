"use strict";

/*
========================================
REGISTRATION APPROVAL DASHBOARD v1.0
========================================
✔ Admin-controlled queue approval
✔ Safe integration with registration_queue.js
✔ Approve / Reject workflow
✔ Live refresh
========================================
*/

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  loadQueue();
});

function initPage() {
  if (typeof getSession !== "function") {
    alert("Session system missing");
    return;
  }

  const session = getSession();

  if (!session || session.role !== "admin") {
    alert("Access Denied");
    window.location.href = "admin_login.html";
  }
}

function loadQueue() {
  const tbody = document.getElementById("list");

  if (!tbody) return;

  const queue =
    typeof getRegQueue === "function"
      ? getRegQueue()
      : [];

  tbody.innerHTML = "";

  queue.forEach(function (item, index) {
    if (item.status !== "PENDING") return;

    const row = `
      <tr>
        <td>${item.mobile}</td>
        <td>${item.username}</td>
        <td>${item.email}</td>
        <td>${item.position}</td>
        <td>${item.status}</td>
        <td>
          <button class="approve" onclick="approve(${index})">Approve</button>
          <button class="reject" onclick="reject(${index})">Reject</button>
        </td>
      </tr>
    `;

    tbody.innerHTML += row;
  });
}

function approve(index) {
  let queue = getRegQueue();

  if (!queue[index]) return;

  queue[index].status = "APPROVED";
  queue[index].approvedAt = Date.now();

  saveRegQueue(queue);

  alert("Approved");

  loadQueue();
}

function reject(index) {
  let queue = getRegQueue();

  if (!queue[index]) return;

  queue[index].status = "FAILED";
  queue[index].error = "Rejected by admin";

  saveRegQueue(queue);

  alert("Rejected");

  loadQueue();
}
