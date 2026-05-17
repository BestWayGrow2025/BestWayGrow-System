"use strict";

/*
========================================
STRATEGIC AI ADVISOR V1.0
========================================
✔ Executive recommendations
✔ Growth analysis
✔ Risk detection
✔ Financial monitoring
✔ PIN usage intelligence
✔ Compliance alerts
✔ Strategic suggestions
========================================
*/

console.log("[STRATEGIC AI ADVISOR] LOADED");

function loadStrategicAIAdvisor() {

  const main = document.getElementById("mainContent");
  if (!main) return;

  /* ================= DATA SOURCES ================= */

  const users =
    typeof getUsers === "function"
      ? (getUsers() || [])
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

  /* ================= METRICS ================= */

  const totalUsers =
    users.filter(u => u.role === "user").length;

  const totalPins = pins.length;

  const usedPins =
    pins.filter(p => p.status === "used").length;

  const pendingEscrows =
    escrows.filter(e =>
      ["pending", "submitted", "under_review"]
        .includes(String(e.status || "").toLowerCase())
    ).length;

  const verifiedPayments =
    payments.filter(p => p.status === "verified");

  const totalRevenue =
    verifiedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

  const auditValid =
    typeof verifyAuditChain === "function"
      ? verifyAuditChain().valid !== false
      : true;

  const pinUsageRate =
    totalPins > 0
      ? (usedPins / totalPins) * 100
      : 0;

  /* ================= AI ANALYSIS ================= */

  const recommendations = [];
  const alerts = [];

  // Growth
  if (totalUsers < 100) {
    recommendations.push(
      "Focus on user acquisition to reach the first 100 active users."
    );
  } else if (totalUsers < 1000) {
    recommendations.push(
      "Strengthen onboarding and retention to scale toward 1,000 users."
    );
  } else {
    recommendations.push(
      "Optimize automation and infrastructure for large-scale growth."
    );
  }

  // PIN efficiency
  if (pinUsageRate < 30) {
    recommendations.push(
      "PIN utilization is low. Review pricing, stock, and distribution."
    );
  } else if (pinUsageRate > 80) {
    recommendations.push(
      "PIN utilization is very high. Consider increasing inventory."
    );
  }

  // Escrow workload
  if (pendingEscrows > 20) {
    alerts.push(
      "High pending escrow volume detected. Additional review capacity may be needed."
    );
  }

  // Revenue
  if (totalRevenue > 1000000) {
    recommendations.push(
      "Revenue has crossed a major milestone. Evaluate tax and treasury planning."
    );
  }

  // Compliance
  if (!auditValid) {
    alerts.push(
      "Audit blockchain integrity check failed. Immediate investigation required."
    );
  }

  // Default recommendation
  if (recommendations.length === 0) {
    recommendations.push(
      "Operations appear stable. Continue monitoring KPIs and growth trends."
    );
  }

  /* ================= RENDER ================= */

  main.innerHTML = `
    <h3>🧠 STRATEGIC AI ADVISOR</h3>

    <h4>📊 Executive Summary</h4>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Users</td><td>${totalUsers}</td></tr>
      <tr><td>Total Revenue</td><td>${totalRevenue}</td></tr>
      <tr><td>PIN Usage Rate</td><td>${pinUsageRate.toFixed(2)}%</td></tr>
      <tr><td>Pending Escrows</td><td>${pendingEscrows}</td></tr>
      <tr><td>Audit Integrity</td><td>${auditValid ? "VALID" : "INVALID"}</td></tr>
    </table>

    <h4>🚨 Strategic Alerts</h4>
    ${
      alerts.length
        ? `<ul>${alerts.map(a => `<li>${a}</li>`).join("")}</ul>`
        : "<p>No critical alerts detected.</p>"
    }

    <h4>💡 AI Recommendations</h4>
    <ol>
      ${recommendations.map(r => `<li>${r}</li>`).join("")}
    </ol>
  `;
}

/* ================= EXPORT ================= */

window.loadStrategicAIAdvisor =
  loadStrategicAIAdvisor;
