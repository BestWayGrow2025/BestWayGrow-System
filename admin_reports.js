let reportAdmin = null;
let reportLock = false;

// ================= INIT =================
window.addEventListener("load", function () {
  initAdminReportsPage();
});

function initAdminReportsPage() {
  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js missing");
    return;
  }

  initCoreSystem();

  let session = null;

  if (typeof getSession === "function") {
    session = getSession();
  } else {
    try {
      session = JSON.parse(localStorage.getItem("loggedInAdmin") || "null");
    } catch {
      session = null;
    }
  }

  if (!session || !session.userId || session.role !== "admin") {
    clearAdminReportsSession();
    window.location.href = "admin_login.html";
    return;
  }

  if (typeof getUserById !== "function") {
    alert("❌ User system missing");
    clearAdminReportsSession();
    window.location.href = "admin_login.html";
    return;
  }

  reportAdmin = getUserById(session.userId);

  if (!reportAdmin || reportAdmin.role !== "admin") {
    clearAdminReportsSession();
    window.location.href = "admin_login.html";
    return;
  }

  if ((reportAdmin.accountStatus || reportAdmin.status || "active") !== "active") {
    clearAdminReportsSession();
    window.location.href = "admin_login.html";
    return;
  }

  bindAdminReportsEvents();
  loadAdminReportsPage();

  if (typeof logActivity === "function") {
    logActivity(reportAdmin.userId, "ADMIN", "Viewed Reports");
  }
}

// ================= EVENTS =================
function bindAdminReportsEvents() {
  let backBtn = document.getElementById("backBtn");
  let ctorBtn = document.getElementById("ctorBtn");

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.location.href = "admin_dashboard.html";
    });
  }

  if (ctorBtn) {
    ctorBtn.addEventListener("click", runAdminReportsCTOR);
  }
}

// ================= PAGE LOAD =================
function loadAdminReportsPage() {
  safeAdminReportsRender(loadAdminReportsUsers);
  safeAdminReportsRender(loadAdminReportsPins);
  safeAdminReportsRender(loadAdminReportsIncome);
  safeAdminReportsRender(loadAdminReportsHold);
  safeAdminReportsRender(loadAdminReportsCTOR);
  safeAdminReportsRender(loadAdminReportsTransactions);
  safeAdminReportsRender(loadAdminReportsPinLogs);
  safeAdminReportsRender(loadAdminReportsWithdrawals);
}

function safeAdminReportsRender(fn) {
  try {
    fn();
  } catch (e) {
    console.error(e);
  }
}

// ================= USERS =================
function loadAdminReportsUsers() {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let totalUsers = users.filter(u => u.role === "user").length;

  document.getElementById("users").innerText =
    "Total Users: " + totalUsers;
}

// ================= PINS =================
function loadAdminReportsPins() {
  let pins = typeof loadPins === "function" ? loadPins() : [];
  let totalStock = pins.length;
  let totalUsed = pins.filter(p => (p.status || "").toUpperCase() === "USED").length;

  document.getElementById("pins").innerHTML =
    "Total Stock: " + totalStock + "<br>Total Used: " + totalUsed;
}

// ================= INCOME =================
function loadAdminReportsIncome() {
  let logs = typeof getIncomeLogs === "function" ? getIncomeLogs() : [];
  let total = logs.reduce((sum, log) => sum + Number(log.amount || 0), 0);

  document.getElementById("income").innerText =
    "Total Distributed: ₹ " + total.toFixed(2);
}

// ================= HOLD =================
function loadAdminReportsHold() {
  let total = 0;

  let users = typeof getUsers === "function" ? getUsers() : [];
  users.forEach(u => {
    total += Number(u.holdIncome || 0);
  });

  document.getElementById("hold").innerText =
    "Hold Amount: ₹ " + total.toFixed(2);
}

// ================= CTOR =================
function loadAdminReportsCTOR() {
  let pool = 0;

  if (typeof getCTORPool === "function") {
    pool = Number(getCTORPool() || 0);
  } else {
    pool = 0;
  }

  document.getElementById("ctor").innerText =
    "CTOR Pool: ₹ " + pool.toFixed(2);
}

function runAdminReportsCTOR() {
  if (reportLock) return;
  reportLock = true;

  try {
    if (typeof runCTORDistribution !== "function") {
      alert("CTOR engine not loaded");
      return;
    }

    runCTORDistribution();
    alert("✅ CTOR Distributed");

    loadAdminReportsCTOR();
    loadAdminReportsTransactions();

  } catch (e) {
    console.error(e);
    alert("CTOR Distribution Failed");
  } finally {
    reportLock = false;
  }
}

// ================= TRANSACTIONS =================
function loadAdminReportsTransactions() {
  let logs = typeof getIncomeLogs === "function" ? getIncomeLogs() : [];
  let box = document.getElementById("transactions");

  if (!logs.length) {
    box.innerHTML = "No transactions";
    return;
  }

  box.innerHTML = `
    <ul>
      ${logs.slice(-50).reverse().map(t => `
        <li>
          ${t.userId || "-"} → ₹${Number(t.amount || 0).toFixed(2)} (${t.type || "-"})<br>
          <small>${t.time || "-"}</small>
        </li>
      `).join("")}
    </ul>
  `;
}

// ================= PIN LOGS =================
function loadAdminReportsPinLogs() {
  let logs = typeof getPinTransactions === "function" ? getPinTransactions() : [];
  let box = document.getElementById("pinLogs");

  if (!logs.length) {
    box.innerHTML = "No logs";
    return;
  }

  box.innerHTML = `
    <ul>
      ${logs.slice(-50).reverse().map(l => `
        <li>
          ${l.userId || "-"} used ${l.pinId || "-"} (${l.type || "-"})<br>
          BV: ${l.bv || 0} | ₹${Number(l.amount || 0).toFixed(2)}<br>
          <small>${l.time || "-"}</small>
        </li>
      `).join("")}
    </ul>
  `;
}

// ================= WITHDRAWALS =================
function loadAdminReportsWithdrawals() {
  let data = typeof getWithdrawals === "function" ? getWithdrawals() : [];
  let box = document.getElementById("withdrawals");

  if (!data.length) {
    box.innerHTML = "No requests";
    return;
  }

  box.innerHTML = `
    <ul>
      ${data.slice(-50).reverse().map(w => `
        <li>
          ${w.requestId || "-"} | ${w.userId || "-"} | ₹${Number(w.amount || 0).toFixed(2)} | ${w.status || "-"}
        </li>
      `).join("")}
    </ul>
  `;
}

// ================= SESSION =================
function clearAdminReportsSession() {
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInSuperAdmin");
}
