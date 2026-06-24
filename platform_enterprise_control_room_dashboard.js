"use strict";

/*
========================================
ENTERPRISE CONTROL ROOM DASHBOARD V1.0
========================================
✔ Executive command center
✔ Live financial overview
✔ Escrow monitoring
✔ PIN Bank monitoring
✔ PIN inventory monitoring
✔ Product inventory monitoring
✔ Fraud alert center
✔ Audit blockchain verification
✔ Real-time event feed
✔ Auto-refresh enabled
========================================
*/

console.log("[ENTERPRISE CONTROL ROOM DASHBOARD] LOADED");

/* ================= HELPERS ================= */

function safeArray(fn) {
  try {
    const value = typeof fn === "function" ? fn() : [];
    return Array.isArray(value) ? value : [];
  } catch (_) {
    return [];
  }
}

function safeCount(fn) {
  try {
    const value = typeof fn === "function" ? fn() : 0;
    return Number(value || 0);
  } catch (_) {
    return 0;
  }
}

function formatAmount(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/* ================= DATA COLLECTORS ================= */

function getControlRoomMetrics() {

  const users = safeArray(() =>
    typeof getUsers === "function" ? getUsers() : []
  );

  const chainInfo =
    typeof verifyAuditChain === "function"
      ? verifyAuditChain()
      : { valid: true, blocks: 0 };

  const realtimeEvents = safeArray(() =>
    typeof getRecentRealtimeEvents === "function"
      ? getRecentRealtimeEvents(20)
      : []
  );

  const escrowItems = safeArray(() =>
    typeof getAllEscrows === "function"
      ? getAllEscrows()
      : []
  );

  const pins = safeArray(() =>
    typeof loadPins === "function"
      ? loadPins()
      : []
  );

  const products = safeArray(() =>
    typeof getPinProducts === "function"
      ? getPinProducts()
      : []
  );

  let totalPinBank = 0;

  users.forEach(user => {
    if (
      user &&
      user.pinBank &&
      typeof user.pinBank === "object"
    ) {
      totalPinBank += Number(
        user.pinBank.balance || 0
      );
    }
  });

  const pendingEscrows =
    escrowItems.filter(
      x =>
        x &&
        (
          x.status === "pending" ||
          x.status === "submitted" ||
          x.status === "awaiting_approval"
        )
    ).length;

  const activePins =
    pins.filter(
      x =>
        x &&
        (
          x.status === "active" ||
          x.status === "assigned"
        )
    ).length;

  const usedPins =
    pins.filter(
      x => x && x.status === "used"
    ).length;

  const activeProducts =
    products.filter(
      x =>
        x &&
        (
          x.status === "active" ||
          x.active === true
        )
    ).length;

  const fraudAlerts = safeCount(() =>
    typeof getFraudAlerts === "function"
      ? getFraudAlerts().length
      : 0
  );

  return {
    users: users.length,
    totalPinBank,
    pendingEscrows,
    activePins,
    usedPins,
    activeProducts,
    fraudAlerts,
    auditValid: !!chainInfo.valid,
    auditBlocks: Number(chainInfo.blocks || 0),
    realtimeEvents
  };
}

/* ================= RENDER ================= */

function renderEnterpriseControlRoom(targetId = "mainContent") {

  const target = document.getElementById(targetId);
  if (!target) return false;

  const m = getControlRoomMetrics();

  const eventsHtml =
    m.realtimeEvents.length === 0
      ? "<p>No recent events.</p>"
      : `
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Reference</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${m.realtimeEvents.map(event => `
              <tr>
                <td>${event.eventName || "-"}</td>
                <td>${event.payload?.refId || "-"}</td>
                <td>${new Date(event.time).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

  target.innerHTML = `
    <h2>🖥 ENTERPRISE CONTROL ROOM</h2>

    <div style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:15px;
      margin-top:20px;
    ">

      <div class="card">
        <h3>👥 Users</h3>
        <h2>${m.users}</h2>
      </div>

      <div class="card">
        <h3>🏦 PIN Bank Balance</h3>
        <h2>${formatAmount(m.totalPinBank)}</h2>
      </div>

      <div class="card">
        <h3>📦 Pending Escrows</h3>
        <h2>${m.pendingEscrows}</h2>
      </div>

      <div class="card">
        <h3>📌 Active Pins</h3>
        <h2>${m.activePins}</h2>
      </div>

      <div class="card">
        <h3>✅ Used Pins</h3>
        <h2>${m.usedPins}</h2>
      </div>

      <div class="card">
        <h3>📦 Active Products</h3>
        <h2>${m.activeProducts}</h2>
      </div>

      <div class="card">
        <h3>🚨 Fraud Alerts</h3>
        <h2>${m.fraudAlerts}</h2>
      </div>

      <div class="card">
        <h3>🔐 Audit Chain</h3>
        <h2>${m.auditValid ? "VALID" : "BROKEN"}</h2>
        <p>${m.auditBlocks} Blocks</p>
      </div>
    </div>

    <div style="margin-top:30px;">
      <h3>⚡ Real-Time Event Feed</h3>
      ${eventsHtml}
    </div>
  `;

  return true;
}

/* ================= AUTO REFRESH ================= */

function startEnterpriseControlRoomRealtime(targetId = "mainContent") {

  renderEnterpriseControlRoom(targetId);

  if (typeof subscribeRealtime === "function") {
    subscribeRealtime("*", function () {
      renderEnterpriseControlRoom(targetId);
    });
  }

  return true;
}

/* ================= EXPORT ================= */

window.getControlRoomMetrics = getControlRoomMetrics;
window.renderEnterpriseControlRoom =
  renderEnterpriseControlRoom;
window.startEnterpriseControlRoomRealtime =
  startEnterpriseControlRoomRealtime;
