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
  document.getElementById("filterType").addEventListener("change", loadPage);
  document.getElementById("refreshBtn").addEventListener("click", loadPage);
}

function loadPage() {
  loadIncomeLogs();
}

function loadIncomeLogs() {
  let type = document.getElementById("filterType").value;
  let userId = document.getElementById("filterUser").value.trim();

  let logs = [];

  try {
    logs = typeof getIncomeLogs === "function" ? getIncomeLogs() : [];
  } catch {
    logs = [];
  }

  if (type) {
    logs = logs.filter(log => log.type === type);
  }

  if (userId) {
    logs = logs.filter(log => (log.userId || "") === userId);
  }

  let table = document.getElementById("incomeTable");
  table.innerHTML = "";

  let total = 0;

  if (!logs.length) {
    table.innerHTML = "<tr><td colspan='6'>No Data</td></tr>";
  }

  logs.slice().reverse().forEach(function (log) {
    let amount = Number(log.amount) || 0;
    total += amount;

    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${log.time ? new Date(log.time).toLocaleString() : "-"}</td>
      <td>${log.userId || "-"}</td>
      <td>${log.type || "-"}</td>
      <td>₹${amount.toFixed(2)}</td>
      <td>${log.sourceUser || "-"}</td>
      <td>${log.note || ""}</td>
    `;

    table.appendChild(row);
  });

  document.getElementById("totalPayout").innerText = total.toFixed(2);
  document.getElementById("totalRecords").innerText = logs.length;
}
