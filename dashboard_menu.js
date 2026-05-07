/*
========================================
MENU SYSTEM SAFE BIND V1.0
PROTECTED + STABLE + NON-DESTRUCTIVE
========================================
*/

function safePage(name) {

  return function () {

    const session = typeof getSession === "function"
      ? getSession()
      : null;

    const main = document.getElementById("mainContent");

    if (!main) return;

    // ================= SECURITY CHECK =================
    if (!session || !session.userId) {
      window.location.href = "user_login.html";
      return;
    }

    main.innerHTML = `
      <div class="info-box">
        <h3>${name}</h3>
        <p>Module not loaded or under development.</p>
      </div>
    `;
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

// ================= SAFE BIND =================
function bindMenuSafe() {

  Object.keys(MENU_MAP).forEach(fnName => {

    if (typeof window[fnName] !== "function") {
      window[fnName] = safePage(MENU_MAP[fnName]);
    }

  });
}

// ================= INIT CONTROLLER =================
function initMenuBinding() {

  bindMenuSafe();

  // safe second pass (avoids duplicate overwrite)
  requestAnimationFrame(() => {
    bindMenuSafe();
  });
}

// ================= BOOT =================
document.addEventListener("DOMContentLoaded", initMenuBinding);
