function safePage(name) {
  return function () {
    const main = document.getElementById("mainContent");

    if (main) {
      main.innerHTML = `
        <div class="info-box">
          <h3>${name}</h3>
          <p>Module not loaded or under development.</p>
        </div>
      `;
    }
  };
}

const MENU_MAP = {
  loadHome: "Home",
  loadPinSection: "Pin Section",
  loadTree: "My Tree",
  loadWallet: "Wallet",
  loadWalletHistory: "Wallet History",
  loadDirectTeam: "Direct Team",
  loadProfile: "Profile",
  loadIncomeHistory: "Income History",
  loadWithdrawSection: "Withdraw",
  loadWithdrawHistory: "Withdraw History",
  loadNotifications: "Notifications",
  loadSupportTickets: "Support Tickets",
  loadEditProfile: "Edit Profile",
  loadChangePassword: "Change Password",
  loadActivityLogs: "Activity Logs",
  loadLoginHistory: "Login History",
  loadKYCSection: "KYC Upload",
  loadRankReward: "Rank / Reward",
  loadReferralLink: "Referral Link"
};

// ================= SAFE BIND (NON-DESTRUCTIVE) =================
function bindMenuSafe() {
  Object.keys(MENU_MAP).forEach(fnName => {

    // ONLY assign fallback if truly missing
    if (typeof window[fnName] !== "function") {
      window[fnName] = safePage(MENU_MAP[fnName]);
    }

  });
}

// ================= STABILITY HOOK =================
function initMenuBinding() {
  bindMenuSafe();

  // second pass after full system load
  setTimeout(bindMenuSafe, 500);
}

// run after DOM ready
document.addEventListener("DOMContentLoaded", initMenuBinding);
