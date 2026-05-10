/*
========================================
REPORT ENGINE V1.0 (CENTRAL REPORT LAYER FIXED)
========================================
✔ Centralized report generation
✔ Read-only architecture (controlled write only)
✔ Monthly closing reports
✔ Income reports
✔ Rank reports
✔ CTOR reports
✔ User reports
✔ Admin summary reports
✔ Dependency-safe
✔ Production READY
========================================
*/

"use strict";

// ===================================
// SAFE HELPERS
// ===================================
function safeReportNumber(value) {

  const num = Number(value);

  if (isNaN(num)) return 0;

  return parseFloat(num.toFixed(2));
}

function safeReportArray(value) {
  return Array.isArray(value) ? value : [];
}

// ===================================
// DATE HELPERS
// ===================================
function getReportMonthKey(date = new Date()) {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;   // ✅ FIXED
}

// ===================================
// USER INCOME REPORT
// ===================================
function generateUserIncomeReport(userId) {

  if (!userId) return null;

  const dashboard = (
    typeof getUserDashboard === "function"
  )
    ? getUserDashboard(userId)
    : null;

  if (!dashboard) return null;

  const transactions = safeReportArray(dashboard.recentTransactions);

  let totalCredit = 0;
  let totalDebit = 0;

  transactions.forEach(txn => {

    const type = String(txn.type || "").toUpperCase();

    if (type === "CREDIT") {
      totalCredit += safeReportNumber(txn.amount);
    }

    if (type === "DEBIT") {
      totalDebit += safeReportNumber(txn.amount);
    }
  });

  return {
    reportType: "USER_INCOME_REPORT",
    userId,
    wallet: dashboard.wallet,
    transactionCount: transactions.length,
    totalCredit: safeReportNumber(totalCredit),
    totalDebit: safeReportNumber(totalDebit),
    netIncome: safeReportNumber(totalCredit - totalDebit),
    generatedAt: new Date().toISOString()
  };
}

// ===================================
// USER RANK REPORT
// ===================================
function generateUserRankReport(userId) {

  if (!userId) return null;

  const dashboard = (
    typeof getUserDashboard === "function"
  )
    ? getUserDashboard(userId)
    : null;

  if (!dashboard) return null;

  return {
    reportType: "USER_RANK_REPORT",
    userId,
    rank: dashboard.rank,
    qualification: dashboard.qualification,
    business: dashboard.business,
    generatedAt: new Date().toISOString()
  };
}

// ===================================
// USER CTOR REPORT
// ===================================
function generateUserCTORReport(userId) {

  if (!userId) return null;

  const dashboard = (
    typeof getUserDashboard === "function"
  )
    ? getUserDashboard(userId)
    : null;

  if (!dashboard) return null;

  return {
    reportType: "USER_CTOR_REPORT",
    userId,
    rank: dashboard.rank,
    ctor: dashboard.ctor,
    generatedAt: new Date().toISOString()
  };
}

// ===================================
// MONTHLY REPORT
// ===================================
function generateMonthlyClosingReport(monthKey = null) {

  monthKey = monthKey || getReportMonthKey();

  const admin = (
    typeof getAdminDashboard === "function"
  )
    ? getAdminDashboard()
    : null;

  return {
    reportType: "MONTHLY_CLOSING_REPORT",
    monthKey,
    adminSummary: admin,
    generatedAt: new Date().toISOString()
  };
}

// ===================================
// ADMIN REPORT
// ===================================
function generateAdminSummaryReport() {

  const admin = (
    typeof getAdminDashboard === "function"
  )
    ? getAdminDashboard()
    : null;

  if (!admin) return null;

  return {
    reportType: "ADMIN_SUMMARY_REPORT",
    ...admin,
    generatedAt: new Date().toISOString()
  };
}

// ===================================
// SAVE REPORT (CONTROLLED WRITE)
// ===================================
function saveReport(report) {

  if (!report || typeof report !== "object") return false;

  const reports = safeReportArray(
    typeof safeGet === "function"
      ? safeGet("system_reports", [])
      : []
  );

  reports.push(report);

  if (typeof safeSet !== "function") return false;

  return safeSet("system_reports", reports.slice(-1000));
}

// ===================================
// MONTHLY GENERATION
// ===================================
function generateMonthlyReports(monthKey = null) {

  monthKey = monthKey || getReportMonthKey();

  const report = generateMonthlyClosingReport(monthKey);

  if (!report) return false;

  return saveReport(report);
}

// ===================================
// GET REPORTS
// ===================================
function getAllReports() {

  if (typeof safeGet !== "function") return [];

  return safeReportArray(
    safeGet("system_reports", [])
  );
}

function getReportsByType(reportType) {

  const type = String(reportType || "").toUpperCase();

  return getAllReports().filter(
    r => String(r.reportType || "").toUpperCase() === type
  );
}

// ===================================
// CURRENT USER REPORTS
// ===================================
function generateCurrentUserReports() {

  if (typeof getCurrentUser !== "function") return null;

  const user = getCurrentUser();

  if (!user || !user.userId) return null;

  return {
    income: generateUserIncomeReport(user.userId),
    rank: generateUserRankReport(user.userId),
    ctor: generateUserCTORReport(user.userId)
  };
}

// ===================================
// EXPORT
// ===================================
window.getReportMonthKey = getReportMonthKey;
window.generateUserIncomeReport = generateUserIncomeReport;
window.generateUserRankReport = generateUserRankReport;
window.generateUserCTORReport = generateUserCTORReport;
window.generateMonthlyClosingReport = generateMonthlyClosingReport;
window.generateAdminSummaryReport = generateAdminSummaryReport;
window.saveReport = saveReport;
window.generateMonthlyReports = generateMonthlyReports;
window.getAllReports = getAllReports;
window.getReportsByType = getReportsByType;
window.generateCurrentUserReports = generateCurrentUserReports;
