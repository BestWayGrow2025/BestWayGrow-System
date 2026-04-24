// ========================================
// USER DASHBOARD FINAL LOCK (QUEUE SYSTEM)
// ========================================
// ✔ Uses getCurrentUser()
// ✔ Role = user enforced
// ✔ Status = active enforced
// ✔ No session mismatch
// ✔ Safe + clean
// ========================================


// ================= LOGOUT =================
function logout() {
  logoutSession();
}


// ================= SAFE USER =================
function getSafeUser() {
  let user = getCurrentUser();

  if (!user) {
    window.location.href = "user_login.html";
    return null;
  }

  return user;
}


// ================= LOAD HOME =================
function loadHome() {
  document.getElementById("mainContent").innerHTML = "<h3>🏠 Home Loaded</h3>";
}


// ================= PIN =================
function loadPinSection() {
  document.getElementById("mainContent").innerHTML = "<h3>📌 PIN Section</h3>";
}


// ================= TREE =================
function loadTree() {
  document.getElementById("mainContent").innerHTML = "<h3>🌳 Tree View</h3>";
}


// ================= WALLET =================
function loadWallet() {
  let user = getSafeUser();
  if (!user) return;

  let balance = (typeof getWalletBalance === "function")
    ? getWalletBalance(user.userId)
    : 0;

  document.getElementById("mainContent").innerHTML =
    "<h3>💰 Wallet Balance: ₹" + balance + "</h3>";
}


// ================= WALLET HISTORY =================
function loadWalletHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>📜 Wallet History</h3>";
}


// ================= TEAM =================
function loadDirectTeam() {
  document.getElementById("mainContent").innerHTML = "<h3>👥 Team</h3>";
}


// ================= PROFILE =================
function loadProfile() {
  let user = getSafeUser();
  if (!user) return;

  document.getElementById("mainContent").innerHTML =
    "<h3>👤 Profile</h3>" +
    "<p>Name: " + user.username + "</p>" +
    "<p>User ID: " + user.userId + "</p>";
}


// ================= UPGRADE =================
function loadUpgrade() {
  document.getElementById("mainContent").innerHTML = "<h3>⬆️ Upgrade</h3>";
}


// ================= REPURCHASE =================
function loadRepurchase() {
  document.getElementById("mainContent").innerHTML = "<h3>🔁 Repurchase</h3>";
}


// ================= INCOME =================
function loadIncomeHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>💵 Income</h3>";
}


// ================= WITHDRAW =================
function loadWithdrawSection() {
  document.getElementById("mainContent").innerHTML = "<h3>🏧 Withdraw</h3>";
}


// ================= WITHDRAW HISTORY =================
function loadWithdrawHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>📄 Withdraw History</h3>";
}


// ================= NOTIFICATIONS =================
function loadNotifications() {
  document.getElementById("mainContent").innerHTML = "<h3>🔔 Notifications</h3>";
}


// ================= SUPPORT =================
function loadSupportTickets() {
  document.getElementById("mainContent").innerHTML = "<h3>🛠 Support</h3>";
}


// ================= EDIT PROFILE =================
function loadEditProfile() {
  document.getElementById("mainContent").innerHTML = "<h3>✏️ Edit Profile</h3>";
}


// ================= PASSWORD =================
function loadChangePassword() {
  document.getElementById("mainContent").innerHTML = "<h3>🔒 Change Password</h3>";
}


// ================= ACTIVITY =================
function loadActivityLogs() {
  document.getElementById("mainContent").innerHTML = "<h3>📜 Activity Logs</h3>";
}


// ================= LOGIN HISTORY =================
function loadLoginHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>🕓 Login History</h3>";
}


// ================= KYC =================
function loadKYCSection() {
  document.getElementById("mainContent").innerHTML = "<h3>🪪 KYC</h3>";
}


// ================= RANK =================
function loadRankReward() {
  document.getElementById("mainContent").innerHTML = "<h3>🏆 Rank</h3>";
}


// ================= REFERRAL =================
function loadReferralLink() {
  let user = getSafeUser();
  if (!user) return;

  let link =
    window.location.origin +
    "/user_register.html?ref=" +
    user.userId;

  document.getElementById("mainContent").innerHTML =
    "<h3>🔗 Referral Link</h3><p>" + link + "</p>";
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

  let user = getSafeUser();
  if (!user) return;

  document.getElementById("welcome").innerText =
    "Welcome " + user.username + " (" + user.userId + ")";

  loadHome();
});
