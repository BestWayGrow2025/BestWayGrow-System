let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  bindEvents();
  loadPage();
});

function authPage() {

  session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || !session.userId) {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  currentUser =
    typeof getUserById === "function"
      ? getUserById(session.userId)
      : null;

  if (
    !currentUser ||
    String(currentUser.role).toLowerCase() !== "admin"
  ) {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }

  if (
    (currentUser.status || "active") !== "active"
  ) {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }

}
function bindEvents() {

  const backBtn = document.getElementById("backBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadKYC);
  }

}

function loadPage() {
  loadKYC();
}

function goBack() {
 window.location.replace("admin_dashboard.html");
}

function getKYC() {
  return JSON.parse(localStorage.getItem("kycRequests") || "[]");
}

function saveKYC(data) {
  localStorage.setItem("kycRequests", JSON.stringify(data));
}

function loadKYC() {
  let data = getKYC();

const container =
  document.getElementById("kycList");

if (!container) return;

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
 let users =
  typeof getUsers === "function"
    ? getUsers()
    : [];

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
 if (typeof saveUsers === "function") {
  saveUsers(users);
}

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

window.loadKYC = loadKYC;
window.approveKYC = approveKYC;
window.rejectKYC = rejectKYC;
