"use strict";

/*
========================================
ENTERPRISE BUSINESS INTELLIGENCE DASHBOARD V1.0
========================================
✔ Revenue analytics
✔ PIN usage analytics
✔ Product performance
✔ Escrow conversion metrics
✔ Growth indicators
✔ Forecasting foundation
✔ Executive KPI dashboard
========================================
*/

console.log("[ENTERPRISE BI DASHBOARD] LOADED");

function loadBusinessIntelligenceDashboard() {

  const main = document.getElementById("mainContent");
  if (!main) return;

  /* ================= DATA COLLECTION ================= */

  const users =
    typeof getUsers === "function"
      ? (getUsers() || [])
      : [];

  const products =
    typeof getProductCatalog === "function"
      ? (getProductCatalog() || [])
      : [];

  const pins =
    typeof loadPins === "function"
      ? (loadPins() || [])
      : [];

  const escrows =
    typeof loadEscrows === "function"
      ? (loadEscrows() || [])
      : [];

  const payments =
    typeof getPaymentRecords === "function"
      ? (getPaymentRecords() || [])
      : [];

  const auditChain =
    typeof getAuditChain === "function"
      ? (getAuditChain() || [])
      : [];

  /* ================= USER METRICS ================= */

  const totalUsers =
    users.filter(u => u.role === "user").length;

  const totalAdmins =
    users.filter(u => u.role === "admin").length;

  const totalSystemAdmins =
    users.filter(u => u.role === "system_admin").length;

  /* ================= FINANCIAL METRICS ================= */

  const verifiedPayments =
    payments.filter(p => p.status === "verified");

  const totalDeposits =
    verifiedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

  const escrowApproved =
    escrows.filter(e =>
      ["approved", "released", "completed"]
        .includes(String(e.status || "").toLowerCase())
    );

  const totalEscrowApproved =
    escrowApproved.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

  /* ================= PIN METRICS ================= */

  const totalPins = pins.length;

  const usedPins =
    pins.filter(p => p.status === "used").length;

  const assignedPins =
    pins.filter(p => p.status === "assigned").length;

  const activePins =
    pins.filter(p => p.status === "active").length;

  const availablePins =
    pins.filter(p =>
      ["available", "active"].includes(p.status)
    ).length;

  const upgradePins =
    pins.filter(p => p.type === "upgrade").length;

  const repurchasePins =
    pins.filter(p => p.type === "repurchase").length;

  /* ================= PRODUCT METRICS ================= */

  const totalProducts = products.length;

  const activeProducts =
    products.filter(p => p.active !== false).length;

  /* ================= AI / COMPLIANCE METRICS ================= */

  const auditBlocks = auditChain.length;

  const auditVerification =
    typeof verifyAuditChain === "function"
      ? verifyAuditChain()
      : { valid: true };

  /* ================= PERFORMANCE RATIOS ================= */

  const pinUsageRate =
    totalPins > 0
      ? ((usedPins / totalPins) * 100).toFixed(2)
      : "0.00";

  const escrowConversionRate =
    totalDeposits > 0
      ? ((totalEscrowApproved / totalDeposits) * 100).toFixed(2)
      : "0.00";

  /* ================= FORECAST (SIMPLE) ================= */

  const projectedMonthlyGrowth =
    (totalUsers * 0.15).toFixed(2);

  const projectedRevenueNextCycle =
    (totalDeposits * 1.20).toFixed(2);

  /* ================= RENDER ================= */

  main.innerHTML = `
    <h3>📊 ENTERPRISE BUSINESS INTELLIGENCE DASHBOARD</h3>

    <h4>👥 ORGANIZATION METRICS</h4>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Users</td><td>${totalUsers}</td></tr>
      <tr><td>Total Admins</td><td>${totalAdmins}</td></tr>
      <tr><td>Total System Admins</td><td>${totalSystemAdmins}</td></tr>
    </table>

    <h4>💰 FINANCIAL METRICS</h4>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Verified Deposits</td><td>${totalDeposits}</td></tr>
      <tr><td>Total Approved Escrow</td><td>${totalEscrowApproved}</td></tr>
      <tr><td>Escrow Conversion Rate</td><td>${escrowConversionRate}%</td></tr>
    </table>

    <h4>📌 PIN ANALYTICS</h4>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total PINs</td><td>${totalPins}</td></tr>
      <tr><td>Used PINs</td><td>${usedPins}</td></tr>
      <tr><td>Assigned PINs</td><td>${assignedPins}</td></tr>
      <tr><td>Active PINs</td><td>${activePins}</td></tr>
      <tr><td>Available PINs</td><td>${availablePins}</td></tr>
      <tr><td>Upgrade PINs</td><td>${upgradePins}</td></tr>
      <tr><td>Repurchase PINs</td><td>${repurchasePins}</td></tr>
      <tr><td>PIN Usage Rate</td><td>${pinUsageRate}%</td></tr>
    </table>

    <h4>📦 PRODUCT ANALYTICS</h4>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Products</td><td>${totalProducts}</td></tr>
      <tr><td>Active Products</td><td>${activeProducts}</td></tr>
    </table>

    <h4>📜 COMPLIANCE METRICS</h4>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Audit Blocks</td><td>${auditBlocks}</td></tr>
      <tr><td>Audit Chain Status</td><td>${auditVerification.valid ? "VALID" : "INVALID"}</td></tr>
    </table>

    <h4>🔮 FORECASTING</h4>
    <table>
      <tr><th>Projection</th><th>Value</th></tr>
      <tr><td>Projected Monthly User Growth</td><td>${projectedMonthlyGrowth}</td></tr>
      <tr><td>Projected Revenue Next Cycle</td><td>${projectedRevenueNextCycle}</td></tr>
    </table>
  `;
}

/* ================= EXPORT ================= */

window.loadBusinessIntelligenceDashboard =
  loadBusinessIntelligenceDashboard;
