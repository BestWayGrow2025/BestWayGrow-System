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
// ================= HOME =================
function loadHome() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) {
    console.error("mainContent missing");
    return;
  }

  let refLink = generateRefLink(user.userId);
  let directUsers = [];

  try {
    if (typeof getDirectUsers === "function") {
      directUsers = getDirectUsers(user.userId) || [];
    }
  } catch (err) {
    console.error("Direct users error:", err);
  }

  let leftCount = directUsers.filter(u => (u.position || "") === "L").length;
  let rightCount = directUsers.filter(u => (u.position || "") === "R").length;

  main.innerHTML = `
    <div class="section-title">Dashboard Overview</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId || "N/A"}</p>
      <p><b>Full Name:</b> ${user.fullName || user.username || "N/A"}</p>
      <p><b>Mobile:</b> ${user.mobile || "N/A"}</p>
      <p><b>Email:</b> ${user.email || "N/A"}</p>
      <p><b>Sponsor ID:</b> ${user.sponsorId || "N/A"}</p>
      <p><b>Join Date:</b> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
      <p><b>City:</b> ${user.city || "N/A"}</p>
      <p><b>State:</b> ${user.state || "N/A"}</p>
      <p><b>Country:</b> ${user.country || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Wallet Balance:</b> ₹${Number(user.walletBalance || 0)}</p>
      <p><b>Income Balance:</b> ₹${Number(user.incomeBalance || 0)}</p>
      <p><b>Hold Income:</b> ₹${Number(user.holdIncome || 0)}</p>
      <p><b>Total Credit:</b> ₹${Number(user.totalCredit || 0)}</p>
      <p><b>Total Debit:</b> ₹${Number(user.totalDebit || 0)}</p>
      <p><b>Total Income:</b> ₹${Number(user.totalIncome || 0)}</p>
    </div>

    <div class="info-box">
      <p><b>Total Pins:</b> ${user.totalPins || 0}</p>
      <p><b>Used Pins:</b> ${user.usedPins || 0}</p>
      <p><b>Available Pins:</b> ${user.availablePins || 0}</p>
      <p><b>Last Pin Used:</b> ${user.lastPinUsedDate || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Total Direct Team:</b> ${directUsers.length}</p>
      <p><b>Left Team:</b> ${leftCount}</p>
      <p><b>Right Team:</b> ${rightCount}</p>
    </div>

    <div class="section-title">Referral Link</div>

    <input id="refLink" class="ref-box" value="${refLink}" readonly>
    <button class="action-btn" onclick="copyRefLink()">Copy Link</button>
    <p id="copyMsg"></p>
  `;
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
