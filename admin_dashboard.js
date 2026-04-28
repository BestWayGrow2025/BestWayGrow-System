let adminUser = null;
let clickLock = false;
let queueBtnLock = false;
let currentPage = 1;
const perPage = 10;
let userSortType = "";
let dashboardAutoRefresh = null;

// ================= INIT =================
window.addEventListener("load", function () {
  bootAdminDashboard();
});

function bootAdminDashboard() {
  if (typeof initCoreSystem !== "function") {
    alert("❌ core_system.js missing");
    return;
  }

  initCoreSystem();

  const session = typeof getSession === "function"
    ? getSession()
    : JSON.parse(localStorage.getItem("loggedInAdmin") || "null");

  if (!session || !session.userId || session.role !== "admin") {
    alert("Login Required");
    window.location.href = "admin_login.html";
    return;
  }

  adminUser = typeof getUserById === "function" ? getUserById(session.userId) : null;

  if (!adminUser || adminUser.role !== "admin") {
    clearAdminSession();
    alert("Access Denied");
    window.location.href = "admin_login.html";
    return;
  }

  if ((adminUser.accountStatus || adminUser.status || "active") !== "active") {
    alert("Admin inactive");
    logout();
    return;
  }

  loadAdminDashboardPage();
}

// ================= PAGE LOAD =================
function loadAdminDashboardPage() {
  document.getElementById("welcome").innerText =
    "Welcome " + (adminUser.username || adminUser.userId) +
    " (" + adminUser.userId + ")";

  const firstBtn = document.querySelector(".menu button");
  if (firstBtn) firstBtn.classList.add("active");

  loadHome();

  dashboardAutoRefresh = setInterval(() => {
    const currentBtn = document.querySelector(".menu button.active");
    if (!currentBtn) return;

    const tab = currentBtn.innerText.trim();

    if (tab === "System") loadSystem();
    if (tab === "Users") renderUsers(currentPage);
    if (tab === "PIN") renderPins();
    if (tab === "Income") renderIncomeLogs();
  }, 5000);
}

// ================= SAFE CLICK =================
function safeClick(btn, fn) {
  if (clickLock) return;

  clickLock = true;

  document.querySelectorAll(".menu button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  try {
    fn();
  } catch (err) {
    console.error(err);
    document.getElementById("mainContent").innerHTML =
      `<p class="warn">Section failed to load</p>`;
  }

  setTimeout(() => {
    clickLock = false;
  }, 300);
}

// ================= HOME =================
function loadHome() {
  let users = typeof getUsers === "function" ? getUsers() : [];
  let allUsers = users.filter(u => u.role === "user");
  let activeUsers = allUsers.filter(u => (u.accountStatus || "active") === "active");
  let blockedUsers = allUsers.filter(u => (u.accountStatus || "active") !== "active");

  let totalWallet = allUsers.reduce((sum, u) => sum + Number(u.walletBalance || 0), 0);

  document.getElementById("mainContent").innerHTML = `
    <h3>Dashboard Overview</h3>

    <div class="grid">
      <div class="miniCard"><h4>Total Users</h4><p>${allUsers.length}</p></div>
      <div class="miniCard"><h4>Active Users</h4><p>${activeUsers.length}</p></div>
      <div class="miniCard"><h4>Blocked Users</h4><p>${blockedUsers.length}</p></div>
      <div class="miniCard"><h4>Total Wallet</h4><p>₹${totalWallet.toFixed(2)}</p></div>
    </div>

    <br>

    <p><b>Name:</b> ${adminUser.username || "Admin"}</p>
    <p><b>User ID:</b> ${adminUser.userId}</p>
    <p><b>Role:</b> ${adminUser.role}</p>
    <p><b>Status:</b> ${adminUser.accountStatus || "active"}</p>
  `;
}

// ================= USERS =================
function loadUsers() {
  document.getElementById("mainContent").innerHTML = `
    <h3>User List</h3>
    <input type="text" id="userSearch" placeholder="Search User ID / Name" onkeyup="filterUsers()"
      style="padding:10px;width:100%;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;">
    <table>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th onclick="sortUsers('wallet')" style="cursor:pointer;">Wallet ⬍</th>
        <th onclick="sortUsers('status')" style="cursor:pointer;">Status ⬍</th>
      </tr>
      <tbody id="userTableBody"></tbody>
    </table>
    <div id="pagination" style="margin-top:15px;text-align:center;"></div>
  `;

  renderUsers(1);
}

function renderUsers(page = 1) {
  currentPage = page;

  let users = (typeof getUsers === "function" ? getUsers() : []).filter(u => u.role === "user");

  if (userSortType === "wallet") {
    users.sort((a, b) => Number(b.walletBalance || 0) - Number(a.walletBalance || 0));
  }

  if (userSortType === "status") {
    users.sort((a, b) =>
      (a.accountStatus || "").localeCompare(b.accountStatus || "")
    );
  }

  const input = (document.getElementById("userSearch")?.value || "").toLowerCase();

  users = users.filter(u => {
    const id = (u.userId || "").toLowerCase();
    const name = (u.fullName || u.username || "").toLowerCase();
    return id.includes(input) || name.includes(input);
  });

  const start = (page - 1) * perPage;
  const paginatedUsers = users.slice(start, start + perPage);

  document.getElementById("userTableBody").innerHTML = paginatedUsers.length
    ? paginatedUsers.map(u => `
      <tr>
        <td>${u.userId || "-"}</td>
        <td>${u.fullName || u.username || "-"}</td>
        <td>₹${Number(u.walletBalance || 0).toFixed(2)}</td>
        <td>${u.accountStatus || "active"}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4">No Users Found</td></tr>`;

  let totalPages = Math.ceil(users.length / perPage);
  let pageHtml = "";

  for (let i = 1; i <= totalPages; i++) {
    pageHtml += `
      <button onclick="renderUsers(${i})"
        style="margin:3px;padding:6px 10px;border:none;border-radius:6px;background:${i === page ? "#007bff" : "#ddd"};color:${i === page ? "#fff" : "#000"};cursor:pointer;">
        ${i}
      </button>
    `;
  }

  document.getElementById("pagination").innerHTML = pageHtml;
}

function filterUsers() {
  renderUsers(1);
}

function sortUsers(type) {
  userSortType = type;
  renderUsers(1);
}

// ================= PIN =================
function loadPinsUI() {
  document.getElementById("mainContent").innerHTML = `
    <h3>PIN Control</h3>
    <input type="text" id="pinSearch" placeholder="Search PIN ID / Type" onkeyup="filterPins()"
      style="padding:10px;width:100%;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;">
    <table>
      <tr><th>PIN ID</th><th>Type</th><th>Status</th></tr>
      <tbody id="pinTableBody"></tbody>
    </table>
  `;

  renderPins();
}

function renderPins() {
  let pins = typeof loadPins === "function" ? loadPins() : [];
  const input = (document.getElementById("pinSearch")?.value || "").toLowerCase();

  pins = pins.filter(p =>
    (p.pinId || "").toLowerCase().includes(input) ||
    (p.type || "").toLowerCase().includes(input)
  );

  document.getElementById("pinTableBody").innerHTML = pins.length
    ? pins.slice(-50).reverse().map(p => `
      <tr>
        <td>${p.pinId || "-"}</td>
        <td>${p.type || "-"}</td>
        <td>${p.status || "-"}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="3">No PIN Available</td></tr>`;
}

function filterPins() {
  renderPins();
}

// ================= WALLET =================
function loadWallet() {
  let users = (typeof getUsers === "function" ? getUsers() : []).filter(u => u.role === "user");

  let totalBalance = 0, totalCredit = 0, totalDebit = 0, totalHoldIncome = 0;

  users.forEach(u => {
    totalBalance += Number(u.walletBalance || 0);
    totalCredit += Number(u.totalCredit || 0);
    totalDebit += Number(u.totalDebit || 0);
    totalHoldIncome += Number(u.holdIncome || 0);
  });

  let html = `
    <h3>Wallet Overview</h3>
    <div class="grid">
      <div class="miniCard"><h4>Total Balance</h4><p>₹${totalBalance.toFixed(2)}</p></div>
      <div class="miniCard"><h4>Total Credit</h4><p>₹${totalCredit.toFixed(2)}</p></div>
      <div class="miniCard"><h4>Total Debit</h4><p>₹${totalDebit.toFixed(2)}</p></div>
      <div class="miniCard"><h4>Total Hold Income</h4><p>₹${totalHoldIncome.toFixed(2)}</p></div>
    </div><br>
    <table>
      <tr><th>User ID</th><th>Wallet</th><th>Total Credit</th><th>Total Debit</th><th>Hold Income</th></tr>
  `;

  html += users.length
    ? users.map(u => `
      <tr>
        <td>${u.userId || "-"}</td>
        <td>₹${Number(u.walletBalance || 0).toFixed(2)}</td>
        <td>₹${Number(u.totalCredit || 0).toFixed(2)}</td>
        <td>₹${Number(u.totalDebit || 0).toFixed(2)}</td>
        <td>₹${Number(u.holdIncome || 0).toFixed(2)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5">No Users Found</td></tr>`;

  html += `</table>`;
  document.getElementById("mainContent").innerHTML = html;
}

// ================= INCOME =================
function loadIncome() {
  const incomeSettings = typeof getIncomeSettings === "function" ? getIncomeSettings() : {};

  document.getElementById("mainContent").innerHTML = `
    <h3>Income Logs</h3>
    <div class="grid">
      <div class="miniCard"><h4>Master Income</h4><p>${incomeSettings.incomeEnabled ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>UGLI</h4><p>${incomeSettings.ugli ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>RLI</h4><p>${incomeSettings.rli ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>Binary</h4><p>${incomeSettings.binary ? "ON" : "OFF"}</p></div>
    </div><br>

    <input type="text" id="incomeSearch" placeholder="Search User ID / Income Type" onkeyup="filterIncomeLogs()"
      style="padding:10px;width:100%;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;">

    <table>
      <tr><th>User ID</th><th>Amount</th><th>Type</th></tr>
      <tbody id="incomeTableBody"></tbody>
    </table>
  `;

  renderIncomeLogs();
}

function renderIncomeLogs() {
  let logs = typeof getIncomeLogs === "function" ? getIncomeLogs() : [];
  const input = (document.getElementById("incomeSearch")?.value || "").toLowerCase();

  logs = logs.filter(l =>
    (l.userId || "").toLowerCase().includes(input) ||
    (l.type || "").toLowerCase().includes(input)
  );

  document.getElementById("incomeTableBody").innerHTML = logs.length
    ? logs.slice(-50).reverse().map(l => `
      <tr>
        <td>${l.userId || "-"}</td>
        <td>₹${Number(l.amount || 0).toFixed(2)}</td>
        <td>${l.type || "-"}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="3">No Income Logs</td></tr>`;
}

function filterIncomeLogs() {
  renderIncomeLogs();
}

// ================= SYSTEM =================
function loadSystem() {
  const s = typeof getSystemSettings === "function" ? getSystemSettings() : {};
  const requests = typeof getPinRequests === "function" ? getPinRequests() : [];
  const regQueue = typeof getRegQueue === "function" ? getRegQueue() : [];

  const pendingPins = requests.filter(r => r.status === "PENDING").length;
  const completedPins = requests.filter(r => r.status === "COMPLETED").length;
  const failedPins = requests.filter(r => r.status === "FAILED").length;

  const pendingReg = regQueue.filter(r => r.status === "PENDING").length;
  const doneReg = regQueue.filter(r => r.status === "DONE").length;
  const failedReg = regQueue.filter(r => r.status === "FAILED").length;

  let html = `
    <h3>System Control</h3>

    <div class="grid">
      <div class="miniCard"><h4>Registration</h4><p>${s.registrationOpen ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>Upgrade</h4><p>${s.upgradesOpen ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>Repurchase</h4><p>${s.repurchaseOpen ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>Withdraw</h4><p>${s.withdrawOpen ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>Admin Access</h4><p>${s.adminAccess ? "ON" : "OFF"}</p></div>
      <div class="miniCard"><h4>Lock Mode</h4><p>${s.lockMode ? "ON" : "OFF"}</p></div>
    </div>

    <hr>
    <h3>PIN Queue</h3>
    <p>Status: ${s.pinQueue?.enabled ? "🟢 RUNNING" : "🔴 STOPPED"}</p>
  `;

  html += `
    <button class="on" onclick="toggleQueue(true)">ON</button>
    <button class="off" onclick="toggleQueue(false)">OFF</button>
    <hr>

    <h3>PIN Request Stats</h3>
    <div class="grid">
      <div class="miniCard"><h4>Pending</h4><p>${pendingPins}</p></div>
      <div class="miniCard"><h4>Completed</h4><p>${completedPins}</p></div>
      <div class="miniCard"><h4>Failed</h4><p>${failedPins}</p></div>
    </div>

    <hr>

    <h3>Registration Queue Stats</h3>
    <div class="grid">
      <div class="miniCard"><h4>Pending</h4><p>${pendingReg}</p></div>
      <div class="miniCard"><h4>Done</h4><p>${doneReg}</p></div>
      <div class="miniCard"><h4>Failed</h4><p>${failedReg}</p></div>
    </div>
  `;

  document.getElementById("mainContent").innerHTML = html;
}

function toggleQueue(val) {
  if (queueBtnLock) return;

  queueBtnLock = true;

  let s = typeof getSystemSettings === "function" ? getSystemSettings() : {};
  if (!s.pinQueue) s.pinQueue = {};

  s.pinQueue.enabled = val;
  saveSystemSettingsSafe(s);

  setTimeout(() => {
    queueBtnLock = false;
    loadSystem();
  }, 300);
}

function saveSystemSettingsSafe(settings) {
  if (typeof safeSet === "function") {
    safeSet("systemSettings", settings);
  } else {
    localStorage.setItem("systemSettings", JSON.stringify(settings));
  }
}

// ================= LOGOUT =================
function clearAdminSession() {
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInSuperAdmin");
}

function logout() {
  if (dashboardAutoRefresh) clearInterval(dashboardAutoRefresh);
  clearAdminSession();
  window.location.href = "admin_login.html";
}

// ================= SAFE ERROR =================
window.addEventListener("error", function (e) {
  console.error("Dashboard Error:", e.message);
});
