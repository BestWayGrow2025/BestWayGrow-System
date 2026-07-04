let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  authPage();
  bindEvents();
  loadPage();
});

// ================= AUTH =================
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

  if ((currentUser.status || "active") !== "active") {
    window.location.replace("admin_auth.html");
    throw new Error("AUTH FAILED");
  }
}

// ================= EVENTS =================
function bindEvents() {

  const backBtn = document.getElementById("backBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  if (backBtn) backBtn.addEventListener("click", goBack);
  if (refreshBtn) refreshBtn.addEventListener("click", loadKYC);
}

function loadPage() {
  loadKYC();
}

function goBack() {
  window.location.replace("admin_dashboard.html");
}

// ================= STORAGE =================
function getKYC() {
  return Array.isArray(
    JSON.parse(localStorage.getItem("kycRequests") || "[]")
  )
    ? JSON.parse(localStorage.getItem("kycRequests") || "[]")
    : [];
}

function saveKYC(data) {
  localStorage.setItem("kycRequests", JSON.stringify(data));
}

// ================= LOAD =================
function loadKYC() {

  const data = getKYC();
  const container = document.getElementById("kycList");

  if (!container) return;

  if (!data.length) {
    container.innerHTML = "No KYC requests found";
    return;
  }

  let html = "<ul>";

  data.slice().reverse().forEach(k => {
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

// ================= APPROVE =================
function approveKYC(requestId, userId) {

  if (lock) return;
  lock = true;

  try {

    const data = getKYC();
    const users = typeof getUsers === "function" ? getUsers() : [];

    const req = data.find(k => k.requestId === requestId);
    const user = users.find(u => u.userId === userId);

    if (!req || !user) {
      alert(req ? "User not found" : "Request not found");
      return;
    }

    req.status = "APPROVED";
    req.approvedAt = new Date().toISOString();

    user.kycStatus = "VERIFIED";
    user.kycApprovedTime = new Date().toISOString();

    saveKYC(data);

    if (typeof saveUsers === "function") {
      saveUsers(users);
    }

    if (typeof logActivity === "function") {
      logActivity(
        currentUser.userId,
        "admin",
        "KYC approved: " + userId
      );
    }

    alert("✅ KYC Approved");
    loadKYC();

  } finally {
    lock = false;
  }
}

// ================= REJECT =================
function rejectKYC(requestId) {

  if (lock) return;
  lock = true;

  try {

    const data = getKYC();
    const req = data.find(k => k.requestId === requestId);

    if (!req) {
      alert("Request not found");
      return;
    }

    req.status = "REJECTED";
    req.rejectedAt = new Date().toISOString();

    saveKYC(data);

    if (typeof logActivity === "function") {
      logActivity(
        currentUser.userId,
        "admin",
        "KYC rejected: " + requestId
      );
    }

    alert("❌ KYC Rejected");
    loadKYC();

  } finally {
    lock = false;
  }
}

window.loadKYC = loadKYC;
window.approveKYC = approveKYC;
window.rejectKYC = rejectKYC;
