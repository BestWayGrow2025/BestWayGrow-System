/*
========================================
DASHBOARD MENU SAFETY WRAPPER (FIX V1)
========================================
✔ Prevents "function not defined" errors
✔ Safe fallback for missing modules
✔ UI never breaks even if file missing
========================================
*/

// ================= SAFE CALL =================
function safeCall(fnName) {
  return function () {
    if (typeof window[fnName] === "function") {
      window[fnName]();
    } else {
      console.warn(fnName + " not available");
      const main = document.getElementById("mainContent");
      if (main) {
        main.innerHTML =
          "<div class='info-box'>Module not loaded: " + fnName + "</div>";
      }
    }
  };
}

// ================= MENU BINDINGS =================
window.loadHome = window.loadHome || safeCall("loadHome");
window.loadPinSection = window.loadPinSection || safeCall("loadPinSection");
window.loadTree = window.loadTree || safeCall("loadTree");
window.loadWallet = window.loadWallet || safeCall("loadWallet");
window.loadWalletHistory = window.loadWalletHistory || safeCall("loadWalletHistory");
window.loadDirectTeam = window.loadDirectTeam || safeCall("loadDirectTeam");
window.loadProfile = window.loadProfile || safeCall("loadProfile");
window.loadIncomeHistory = window.loadIncomeHistory || safeCall("loadIncomeHistory");
window.loadWithdrawSection = window.loadWithdrawSection || safeCall("loadWithdrawSection");
window.loadWithdrawHistory = window.loadWithdrawHistory || safeCall("loadWithdrawHistory");
window.loadNotifications = window.loadNotifications || safeCall("loadNotifications");
window.loadSupportTickets = window.loadSupportTickets || safeCall("loadSupportTickets");
window.loadEditProfile = window.loadEditProfile || safeCall("loadEditProfile");
window.loadChangePassword = window.loadChangePassword || safeCall("loadChangePassword");
window.loadActivityLogs = window.loadActivityLogs || safeCall("loadActivityLogs");
window.loadLoginHistory = window.loadLoginHistory || safeCall("loadLoginHistory");
window.loadKYCSection = window.loadKYCSection || safeCall("loadKYCSection");
window.loadRankReward = window.loadRankReward || safeCall("loadRankReward");
window.loadReferralLink = window.loadReferralLink || safeCall("loadReferralLink");
