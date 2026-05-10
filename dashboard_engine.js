/*
========================================
DASHBOARD ENGINE V1.0 (READ-ONLY DATA AGGREGATION LAYER)
========================================
✔ Central dashboard data provider
✔ Read-only architecture
✔ User dashboard support
✔ Admin dashboard support
✔ Wallet summary integration
✔ Rank summary integration
✔ Qualification progress integration
✔ CTOR eligibility integration
✔ Recent transaction support
✔ Dependency-safe
✔ Production READY
========================================
*/

"use strict";

// ===================================
// SAFE HELPERS
// ===================================
function safeNumber(value) {

  const num = Number(value);

  if (isNaN(num)) {
    return 0;
  }

  return parseFloat(num.toFixed(2));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getDashboardUser(userId) {

  if (typeof getUserById !== "function") {
    return null;
  }

  return getUserById(userId);
}

// ===================================
// TRANSACTIONS
// ===================================
function getRecentTransactions(userId, limit = 10) {

  if (typeof getUserTransactions !== "function") {
    return [];
  }

  const txns = safeArray(getUserTransactions(userId));

  return txns
    .slice()
    .reverse()
    .slice(0, Number(limit) || 10);
}

// ===================================
// WALLET SUMMARY
// ===================================
function getWalletSummary(user) {

  const wallet =
    (user && typeof user.wallet === "object")
      ? user.wallet
      : {};

  return {
    balance: safeNumber(wallet.balance),
    incomeBalance: safeNumber(wallet.incomeBalance),
    holdIncome: safeNumber(wallet.holdIncome),
    totalCredit: safeNumber(wallet.totalCredit),
    totalDebit: safeNumber(wallet.totalDebit)
  };
}

// ===================================
// RANK SUMMARY
// ===================================
function getRankSummary(user) {

  const currentRankCode =
    user?.currentRank ||
    user?.rankCode ||
    "MEMBER";

  const highestRankCode =
    user?.highestRank ||
    currentRankCode;

  let currentRank = null;
  let highestRank = null;

  if (typeof getRankByCode === "function") {

    currentRank = getRankByCode(currentRankCode);
    highestRank = getRankByCode(highestRankCode);
  }

  return {
    currentRank: currentRankCode,
    highestRank: highestRankCode,
    currentRankName: currentRank?.name || currentRankCode,
    highestRankName: highestRank?.name || highestRankCode,
    ctorEligible:
      typeof isCTORRank === "function"
        ? isCTORRank(highestRankCode)
        : false
  };
}

// ===================================
// QUALIFICATION PROGRESS
// ===================================
function getQualificationProgress(userId) {

  if (typeof getQualificationSummary === "function") {

    const summary = getQualificationSummary(userId);

    if (summary && typeof summary === "object") {
      return summary;
    }
  }

  return {
    qualified: false,
    currentRank: "MEMBER",
    nextRank: null,
    progressPercent: 0
  };
}

// ===================================
// CTOR SUMMARY
// ===================================
function getCTORSummary(user) {

  const rankSummary = getRankSummary(user);

  const activePoints = safeNumber(user?.monthlyPoints);

  return {
    eligibleRank: rankSummary.ctorEligible,
    activePoints,
    monthlyEligible:
      rankSummary.ctorEligible && activePoints >= 1
  };
}

// ===================================
// USER DASHBOARD
// ===================================
function getUserDashboard(userId) {

  const user = getDashboardUser(userId);

  if (!user) return null;

  const wallet = getWalletSummary(user);
  const rank = getRankSummary(user);
  const qualification = getQualificationProgress(userId);
  const ctor = getCTORSummary(user);

  return {
    profile: {
      userId: user.userId,
      username: user.username || "",
      fullName: user.fullName || user.name || "",
      status: user.status || "inactive",
      joinDate: user.joinDate || null
    },

    wallet,
    rank,
    qualification,
    ctor,

    business: {
      monthlyBV: safeNumber(user.monthlyBV),
      monthlyPoints: safeNumber(user.monthlyPoints),
      totalBV: safeNumber(user.totalBV),
      directCount: Number(user.directCount || 0),
      teamCount: Number(user.teamCount || 0)
    },

    recentTransactions: getRecentTransactions(userId, 10),

    generatedAt: new Date().toISOString()
  };
}

// ===================================
// ADMIN DASHBOARD
// ===================================
function getAdminDashboard() {

  if (typeof getUsers !== "function") {
    return null;
  }

  const users = safeArray(getUsers());

  const activeUsers = users.filter(u => u && u.status === "active");

  let totalBalance = 0;
  let totalMonthlyBV = 0;

  users.forEach(user => {

    const wallet = getWalletSummary(user);

    totalBalance += wallet.balance;
    totalMonthlyBV += safeNumber(user?.monthlyBV);
  });

  const ctorPool =
    typeof getCTORPool === "function"
      ? safeNumber(getCTORPool())
      : 0;

  return {
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    inactiveUsers: users.length - activeUsers.length,
    totalWalletBalance: safeNumber(totalBalance),
    totalMonthlyBV: safeNumber(totalMonthlyBV),
    currentCTORPool: ctorPool,
    highestRank:
      typeof getHighestRank === "function"
        ? getHighestRank()
        : null,
    generatedAt: new Date().toISOString()
  };
}

// ===================================
// CURRENT USER DASHBOARD
// ===================================
function getCurrentUserDashboard() {

  if (typeof getCurrentUser !== "function") {
    return null;
  }

  const user = getCurrentUser();

  if (!user?.userId) return null;

  return getUserDashboard(user.userId);
}

// ===================================
// GLOBAL EXPORT
// ===================================
window.getRecentTransactions = getRecentTransactions;
window.getWalletSummary = getWalletSummary;
window.getRankSummary = getRankSummary;
window.getQualificationProgress = getQualificationProgress;
window.getCTORSummary = getCTORSummary;
window.getUserDashboard = getUserDashboard;
window.getAdminDashboard = getAdminDashboard;
window.getCurrentUserDashboard = getCurrentUserDashboard;                         
