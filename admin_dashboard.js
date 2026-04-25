// ================= LOAD ADMIN DASHBOARD PAGE =================
function loadAdminDashboardPage() {
  document.getElementById("welcome").innerText =
    "Welcome " + (adminUser.username || adminUser.userId) +
    " (" + adminUser.userId + ")";

  document.querySelector(".menu button").classList.add("active");
  loadHome();

  setInterval(() => {
    let currentBtn = document.querySelector(".menu button.active");

    if (currentBtn && currentBtn.innerText === "System") loadSystem();
    if (currentBtn && currentBtn.innerText === "Users") renderUsers(currentPage);
    if (currentBtn && currentBtn.innerText === "PIN") renderPins();
    if (currentBtn && currentBtn.innerText === "Income") renderIncomeLogs();
  }, 5000);
}

// ================= HOME =================
function loadHome() {

  let users = (typeof getUsers === "function") ? getUsers() : [];
  let allUsers = users.filter(u => u.role === "user");
  let activeUsers = allUsers.filter(u => u.accountStatus === "active");
  let blockedUsers = allUsers.filter(u => u.accountStatus !== "active");

  let totalWallet = users.reduce((sum, u) => {
    return sum + Number(u.walletBalance || 0);
  }, 0);

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

// ================= INIT CORE =================
if (typeof initCoreSystem === "function") {
  initCoreSystem();
} else {
  alert("core_system.js missing");
  throw new Error("STOP");
}

// ================= AUTH =================
let adminSession = JSON.parse(localStorage.getItem("loggedInAdmin"));

if (!adminSession || !adminSession.userId) {
  alert("Login Required");
  window.location.href = "admin_login.html";
  throw new Error("STOP");
}

// ================= ADMIN USER =================
let adminUser = null;

if (typeof getUserById === "function") {
  adminUser = getUserById(adminSession.userId);
}

if (!adminUser) {
  alert("Admin not found");
  localStorage.removeItem("loggedInAdmin");
  window.location.href = "admin_login.html";
  throw new Error("STOP");
}

if ((adminUser.accountStatus || adminUser.status || "active") !== "active") {
  alert("Admin inactive");
  logout();
  throw new Error("STOP");
}

if (adminUser.role !== "admin") {
  alert("Access Denied");
  logout();
  throw new Error("STOP");
}

// ================= BUTTON LOCK =================
let clickLock = false;
let queueBtnLock = false;
let currentPage = 1;
let perPage = 10;
let userSortType = "";

function safeClick(btn, fn) {
  if (clickLock) return;

  clickLock = true;

  document.querySelectorAll(".menu button").forEach(b => {
    b.classList.remove("active");
  });

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

function saveSystemSettingsSafe(settings) {
  if (typeof safeSet === "function") {
    safeSet("systemSettings", settings);
  } else {
    localStorage.setItem("systemSettings", JSON.stringify(settings));
  }
}

function toggleQueue(val) {
  if (queueBtnLock) return;

  queueBtnLock = true;

  let s = getSystemSettings() || {};

  if (!s.pinQueue) s.pinQueue = {};

  s.pinQueue.enabled = val;
  saveSystemSettingsSafe(s);

  setTimeout(() => {
    queueBtnLock = false;
    loadSystem();
  }, 300);
}

function logout() {
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInSystemAdmin");
  localStorage.removeItem("loggedInSuperAdmin");
  window.location.href = "admin_login.html";
}

Block 4
 remaining UI functions
// ================= USERS =================
// paste full: loadUsers(), renderUsers(), filterUsers(), sortUsers()

// ================= PIN =================
// paste full: loadPinsUI(), renderPins(), filterPins()

// ================= WALLET =================
// paste full: loadWallet()

// ================= INCOME =================
// paste full: loadIncome(), renderIncomeLogs(), filterIncomeLogs()

// ================= SYSTEM =================
// paste full: loadSystem()

// ================= INIT =================
window.addEventListener("load", function () {
  loadAdminDashboardPage();
  console.log("Admin Dashboard Loaded Successfully");
});

// ================= SAFE ERROR LOG =================
window.addEventListener("error", function(e) {
  console.error("Dashboard Error:", e.message);
});
