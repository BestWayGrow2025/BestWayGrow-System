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
      department: "report"
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
  document.getElementById("ctorBtn").addEventListener("click", runCTOR);
}

function loadPage() {
  loadUsers();
  loadPins();
  loadIncome();
  loadHold();
  loadCTOR();
  loadTransactions();
  loadPinLogs();
  loadWithdrawals();
}

function goBack() {
  window.location.href = "admin_dashboard.html";
}

function loadUsers() {
  let users = getUsers() || [];
  document.getElementById("users").innerText = "Total Users: " + users.length;
}

function loadPins() {
  let pins = JSON.parse(localStorage.getItem("pins") || "[]");
  let totalStock = 0;
  let totalUsed = 0;

  pins.forEach(function (p) {
    totalStock += Number(p.stock || 0);
    totalUsed += Number(p.used || 0);
  });

  document.getElementById("pins").innerHTML =
    "Total Stock: " + totalStock + "<br>Total Used: " + totalUsed;
}

function loadIncome() {
  let txns = JSON.parse(localStorage.getItem("transactions") || "[]");
  let total = 0;

  txns.forEach(function (t) {
    total += Number(t.amount || 0);
  });

  document.getElementById("income").innerText =
    "Total Distributed: ₹ " + total;
}

function loadHold() {
  let holds = JSON.parse(localStorage.getItem("holdIncome") || "[]");
  let total = 0;

  holds.forEach(function (h) {
    if (h.status === "HOLD") {
      total += Number(h.amount || 0);
    }
  });

  document.getElementById("hold").innerText =
    "Hold Amount: ₹ " + total;
}

function loadCTOR() {
  let pool = JSON.parse(localStorage.getItem("ctorPool") || "0");
  document.getElementById("ctor").innerText = "CTOR Pool: ₹ " + pool;
}

function runCTOR() {
  if (lock) return;
  lock = true;

  if (typeof runCTORDistribution === "function") {
    runCTORDistribution();
    alert("✅ CTOR Distributed");
    loadCTOR();
    loadTransactions();
  } else {
    alert("CTOR engine not loaded");
  }

  lock = false;
}

function loadTransactions() {
  let txns = JSON.parse(localStorage.getItem("transactions") || "[]");

  if (!txns.length) {
    document.getElementById("transactions").innerHTML = "No transactions";
    return;
  }

  let html = "<ul>";

  txns.slice().reverse().forEach(function (t) {
    html += `
      <li>
        ${t.userId} → ₹${t.amount} (${t.reason || "-"}) <br>
        <small>${t.time || "-"}</small>
      </li><br>
    `;
  });

  html += "</ul>";
  document.getElementById("transactions").innerHTML = html;
}

function loadPinLogs() {
  let logs = JSON.parse(localStorage.getItem("pinTransactions") || "[]");

  if (!logs.length) {
    document.getElementById("pinLogs").innerHTML = "No logs";
    return;
  }

  let html = "<ul>";

  logs.slice().reverse().forEach(function (l) {
    html += `
      <li>
        ${l.userId} used ${l.pinId} (${l.type}) <br>
        BV: ${l.bv} | ₹${l.amount} <br>
        <small>${l.time || "-"}</small>
      </li><br>
    `;
  });

  html += "</ul>";
  document.getElementById("pinLogs").innerHTML = html;
}

function loadWithdrawals() {
  let data = JSON.parse(localStorage.getItem("withdrawals") || "[]");

  if (!data.length) {
    document.getElementById("withdrawals").innerHTML = "No requests";
    return;
  }

  let html = "<ul>";

  data.slice().reverse().forEach(function (w) {
    html += `
      <li>
        ${w.requestId} | ${w.userId} | ₹${w.amount} | ${w.status}
      </li><br>
    `;
  });

  html += "</ul>";
  document.getElementById("withdrawals").innerHTML = html;
}
