let session = null;
let currentUser = null;
let lock = false;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadAllIncome();
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
  document.getElementById("filterType").addEventListener("change", loadAllIncome);
  document.getElementById("refreshBtn").addEventListener("click", loadAllIncome);
}

function loadAllIncome() {
  let type = document.getElementById("filterType").value;
  let logs = [];

  try {
    if (typeof getIncomeLogs === "function") {
      logs = getIncomeLogs() || [];
    }
  } catch (err) {
    console.error("Load error:", err);
    logs = [];
  }

  if (type) {
    logs = logs.filter(log => log.type === type);
  }

  renderIncomeTable(logs);
}

function renderIncomeTable(logs) {
  let table = document.getElementById("incomeTable");
  let total = 0;

  table.innerHTML = "";

  if (!logs.length) {
    table.innerHTML = "<tr><td colspan='6'>No Data</td></tr>";
    updateSummary(0, 0);
    return;
  }

  logs.slice().reverse().forEach(log => {
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

  updateSummary(total, logs.length);
}

function updateSummary(total, count) {
  document.getElementById("totalPayout").innerText = total.toFixed(2);
  document.getElementById("totalRecords").innerText = count;
}
