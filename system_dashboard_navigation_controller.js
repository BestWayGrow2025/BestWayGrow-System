"use strict";

/*
========================================
MENU SYSTEM SAFE BIND V2.0 (FINAL LOCKED)
========================================
✔ Session-based protection
✔ Non-destructive fallback loader
✔ No duplicate binding
✔ Works with unified session_manager.js
✔ Route guard compatible
✔ Safe for all dashboards
✔ Production LOCKED
========================================
*/

// ================= SAFE PAGE FALLBACK =================
function safePage(name) {

  return function () {

    const session = typeof getSession === "function"
      ? getSession()
      : null;

    const main = document.getElementById("mainContent");

    if (!session || !session.userId) {
      window.location.replace("user_login.html");
      return;
    }

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

  Object.keys(MENU_MAP).forEach(function (fnName) {

    if (typeof window[fnName] !== "function") {
      window[fnName] = safePage(MENU_MAP[fnName]);
    }

  });
}

// ================= INIT CONTROLLER =================
function initMenuBinding() {

  if (
    typeof isAuthBlocked === "function" &&
    isAuthBlocked()
  ) {
    return;
  }

  bindMenuSafe();
}

// ================= GLOBAL EXPORT =================
window.bindMenuSafe = bindMenuSafe;
window.initMenuBinding = initMenuBinding;
