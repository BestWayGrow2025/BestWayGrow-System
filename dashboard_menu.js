/*
========================================
DASHBOARD MENU SAFETY WRAPPER (FIXED V2)
========================================
✔ No crash even if module missing
✔ Works with late-loaded scripts
✔ Stable window binding
========================================
*/

// ================= SAFE CALL =================
function safePage(name) {
  return function () {
    const main = document.getElementById("mainContent");

    if (main) {
      main.innerHTML = `
        <div class="info-box">
          <h3>${name}</h3>
          <p>Module not loaded or not implemented yet.</p>
        </div>
      `;
    }
  };
}

// ================= CORE MENU BINDING =================
function bindMenu() {
  const map = {
    loadHome: "Home",
    loadPinSection: "Pin Section",
    loadTree: "Tree",
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

  Object.keys(map).forEach(fn => {
    if (typeof window[fn] !== "function") {
      window[fn] = safePage(map[fn]);
    }
  });
}

// Run after load
document.addEventListener("DOMContentLoaded", bindMenu);

