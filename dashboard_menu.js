/*
========================================
MENU SYSTEM SAFE BIND V1.1
STABILIZED + ROLE SAFE + NON-DESTRUCTIVE
========================================
*/

function safePage(name) {

  return function () {

    const session = typeof getSession === "function"
      ? getSession()
      : null;

    const main = document.getElementById("mainContent");

    // ================= GLOBAL GUARD =================
    if (!session || !session.userId) {
      window.location.replace("user_login.html");
      return;
    }

    // ================= ROLE SAFETY (ADDED) =================
    const role = session.role || "user";

    // optional UI restriction layer (non-breaking)
    const restrictedModules = {
      user: [],
      admin: [],
      system_admin: [],
      super_admin: []
    };

    // NOTE: keeping empty for now (no logic change intent)

    if (!main) return;

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

  const session = typeof getSession === "function"
    ? getSession()
    : null;

  // 🟡 STABILITY: prevent binding if no session
  if (!session || !session.userId) return;

  Object.keys(MENU_MAP).forEach(fnName => {

    if (typeof window[fnName] !== "function") {
      window[fnName] = safePage(MENU_MAP[fnName]);
    }

  });
}

// ================= INIT CONTROLLER =================
function initMenuBinding() {

  bindMenuSafe();

  // 🟡 FIX: remove redundant double binding risk
  // requestAnimationFrame(() => {
  //   bindMenuSafe();
  // });

}

// ================= BOOT =================
document.addEventListener("DOMContentLoaded", initMenuBinding);
