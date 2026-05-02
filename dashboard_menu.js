/*
========================================
DASHBOARD MENU SAFETY WRAPPER (FIXED V3)
========================================
✔ Force-safe binding for ALL menu buttons
✔ No undefined function crash ever
✔ Consistent fallback UI
========================================
*/

// ================= SAFE PAGE =================
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

// ================= MENU MAP =================
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

// ================= FORCE SAFE BIND =================
function bindMenu() {
  Object.keys(MENU_MAP).forEach(fnName => {
    const label = MENU_MAP[fnName];

    // ALWAYS ensure function exists (override if needed)
    if (typeof window[fnName] !== "function") {
      window[fnName] = safePage(label);
    }
  });
}

// ================= AUTO INIT (SAFE DELAY) =================
setTimeout(bindMenu, 50);
