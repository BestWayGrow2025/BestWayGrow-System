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

  if (typeof protectPage === "function") {
    currentUser = protectPage({
      role: "admin",
      department: "kyc"
    });
  }

  if (!currentUser) {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "admin_login.html";
    throw new Error("STOP");
  }
}

function bindEvents() {
  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("refreshBtn").addEventListener("click", loadKYC);
}

function loadPage() {
  loadKYC();
}

function goBack() {
  window.location.href = "admin_dashboard.html";
}

function getKYC() {
  return JSON.parse(localStorage.getItem("kycRequests") || "[]");
}

function saveKYC(data) {
  localStorage.setItem("kycRequests", JSON.stringify(data));
}

function loadKYC() {
  let data = getKYC();
  let container = document.getElementById("kycList");

  if (!data.length) {
    container.innerHTML = "No KYC requests found";
    return;
  }

  let html = "<ul>";

  data.slice().reverse().forEach(function (k) {
    html += `
      <li>
        <b>User:</b> ${k.userId} <br>
        <b>Status:</b> ${k.status} <br>
        <b>Submitted:</b> ${k.time || "-"} <br><br>

        ${k.status === "PENDING"
          ? `<button onclick="approveKYC('${k.requestId}','${k.userId}')">Approve</button>
             <button onclick="rejectKYC('${k.requestId}')">Reject</button>`
          : "✔ Processed"}

        <hr>
      </li>
    `;
  });

  html += "</ul>";
  container.innerHTML = html;
}

function approveKYC(requestId, userId) {
  if (lock) return;
  lock = true;

  let data = getKYC();
  let users = getUsers();

  let req = data.find(k => k.requestId === requestId);
  let user = users.find(u => u.userId === userId);

  if (!req) {
    lock = false;
    return alert("Request not found");
  }

  if (!user) {
    lock = false;
    return alert("User not found");
  }

  req.status = "APPROVED";
  user.kycStatus = "VERIFIED";
  user.kycApprovedTime = new Date().toISOString();

  saveKYC(data);
  saveUsers(users);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "admin", "KYC approved: " + userId);
  }

  alert("✅ KYC Approved");
  lock = false;
  loadKYC();
}

function rejectKYC(requestId) {
  if (lock) return;
  lock = true;

  let data = getKYC();
  let req = data.find(k => k.requestId === requestId);

  if (!req) {
    lock = false;
    return alert("Request not found");
  }

  req.status = "REJECTED";
  saveKYC(data);

  if (typeof logActivity === "function") {
    logActivity(currentUser.userId, "admin", "KYC rejected: " + requestId);
  }

  alert("❌ KYC Rejected");
  lock = false;
  loadKYC();
}
