"use strict";

/*
========================================
STRATEGIC AI ADVISOR V1.0 (FINAL FIXED)
========================================
✔ Executive recommendations
✔ Growth analysis
✔ Risk detection
✔ Financial monitoring
✔ PIN usage intelligence
✔ Compliance alerts
✔ Core Engine integration FIXED
✔ Enterprise module registration FIXED
========================================
*/

console.log("[STRATEGIC AI ADVISOR] LOADED");

/* ================= CORE FUNCTION ================= */

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

  if (totalUsers < 100) {
    recommendations.push("Focus on user acquisition to reach 100 users.");
  } else if (totalUsers < 1000) {
    recommendations.push("Strengthen onboarding and retention for scaling.");
  } else {
    recommendations.push("Optimize infrastructure for large-scale growth.");
  }

  if (pinUsageRate < 30) {
    recommendations.push("PIN usage is low — review distribution strategy.");
  } else if (pinUsageRate > 80) {
    recommendations.push("PIN usage is high — consider increasing supply.");
  }

  if (pendingEscrows > 20) {
    alerts.push("High escrow backlog detected.");
  }

  if (totalRevenue > 1000000) {
    recommendations.push("Revenue milestone achieved — review compliance planning.");
  }

  if (!auditValid) {
    alerts.push("Audit chain integrity issue detected.");
  }

  if (recommendations.length === 0) {
    recommendations.push("System stable. Continue monitoring KPIs.");
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

    <h4>🚨 Alerts</h4>
    ${
      alerts.length
        ? `<ul>${alerts.map(a => `<li>${a}</li>`).join("")}</ul>`
        : "<p>No critical alerts detected.</p>"
    }

    <h4>💡 Recommendations</h4>
    <ol>
      ${recommendations.map(r => `<li>${r}</li>`).join("")}
    </ol>
  `;
}

/* ================= MODULE REGISTRATION FIX ================= */
/* IMPORTANT: This makes it visible to Core Engine + SCL */

if (window.ENTERPRISE_CORE_ENGINE?.register) {
  window.ENTERPRISE_CORE_ENGINE.register(
    "strategic_ai_advisor",
    loadStrategicAIAdvisor
  );
}

/* ================= GLOBAL EXPORT (SYSTEM COMPATIBLE) ================= */

window.strategic_ai_advisor = {

  init: loadStrategicAIAdvisor,

  run: function () {
    return loadStrategicAIAdvisor();
  },

  evaluate: function () {
    return {
      status: "OK",
      module: "STRATEGIC_AI_ADVISOR"
    };
  }
};
