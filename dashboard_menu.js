/*
========================================
DASHBOARD MENU HANDLERS (FIXED)
========================================
✔ Fixes all onclick errors
✔ Safe navigation system
✔ Prevents undefined function crash
========================================
*/

// ================= CORE NAV =================
function showSection(name) {
  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `<div class="info-box">Loading ${name}...</div>`;
}

// ================= MENU FUNCTIONS =================

// Home
function loadHome() {
  if (typeof window.renderHome === "function") {
    return window.renderHome();
  }
  showSection("Home");
}

// Pin Section
function loadPinSection() {
  showSection("Pin Section");
}

// My Tree
function loadTree() {
  showSection("My Tree");
}

// Wallet
function loadWallet() {
  showSection("Wallet");
}

// Wallet History
function loadWalletHistory() {
  showSection("Wallet History");
}

// Direct Team
function loadDirectTeam() {
  showSection("Direct Team");
}

// Profile
function loadProfile() {
  showSection("Profile");
}

// Income History
function loadIncomeHistory() {
  showSection("Income History");
}

// Withdraw
function loadWithdrawSection() {
  showSection("Withdraw");
}

// Withdraw History
function loadWithdrawHistory() {
  showSection("Withdraw History");
}

// Notifications
function loadNotifications() {
  showSection("Notifications");
}

// Support
function loadSupportTickets() {
  showSection("Support Tickets");
}

// Edit Profile
function loadEditProfile() {
  showSection("Edit Profile");
}

// Change Password
function loadChangePassword() {
  showSection("Change Password");
}

// Activity Logs
function loadActivityLogs() {
  showSection("Activity Logs");
}

// Login History
function loadLoginHistory() {
  showSection("Login History");
}

// KYC
function loadKYCSection() {
  showSection("KYC Upload");
}

// Rank / Reward
function loadRankReward() {
  showSection("Rank / Reward");
}

// Referral Link
function loadReferralLink() {
  showSection("Referral Link");
}

// Logout
function logout() {
  if (typeof logoutSession === "function") {
    logoutSession();
  }
  window.location.href = "user_login.html";
}
