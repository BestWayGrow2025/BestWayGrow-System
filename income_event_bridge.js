"use strict";

/*
========================================
ENTERPRISE INCOME UNIFIED MODULE v1.0
========================================
✔ Income History System
✔ Income Event Bridge Integration
✔ SYSTEM_EVENTS Real-Time Sync
✔ Wallet + Logs + Dashboard Update
✔ Full Null Safety Protection
✔ MLM Ready Architecture
========================================
*/

// ================= INIT =================
function initIncomeSystem() {

  if (!window.SYSTEM_EVENTS?.emit) {
    console.warn("[INCOME] SYSTEM_EVENTS NOT READY");
    return;
  }

  hook("processIncome", "INCOME_PROCESSED");
  hook("safeIncome", "INCOME_CREDIT");
  hook("addIncomeLog", "INCOME_LOG_CREATED");
  hook("releaseHoldIncome", "HOLD_INCOME_RELEASED");

  bindRealtimeSync();

  window.INCOME_SYSTEM_READY = true;

  console.log("[INCOME] SYSTEM READY");
}

// ================= SAFE HOOK =================
function hook(fnName, eventName) {

  if (typeof window[fnName] !== "function") return;

  if (window[fnName].__wrapped) return;

  const original = window[fnName];

  function wrapped(...args) {

    const result = original.apply(this, args);

    const payload = {
      functionName: fnName,
      eventName,
      args,
      result,
      timestamp: Date.now()
    };

    safeEmit(eventName + "_BEFORE", payload);
    safeEmit(eventName, payload);
    safeEmit("INCOME_EVENT", payload);
    safeEmit("INCOME_UPDATED", payload);

    return result;
  }

  wrapped.__wrapped = true;
  window[fnName] = wrapped;
}

// ================= SAFE EMIT =================
function safeEmit(event, data) {
  try {
    if (window.SYSTEM_EVENTS?.emit) {
      window.SYSTEM_EVENTS.emit(event, data);
    }
  } catch (_) {}
}

// ================= REALTIME SYNC =================
function bindRealtimeSync() {

  if (typeof window.onSystemEvent !== "function") return;

  window.onSystemEvent("INCOME_UPDATED", function () {

    try { window.loadIncomeSummary?.(); } catch (_) {}
    try { window.loadIncomeLogs?.(); } catch (_) {}
    try { window.refreshDashboardBalances?.(); } catch (_) {}
    try { window.refreshReports?.(); } catch (_) {}
  });
}

// ================= HISTORY SYSTEM =================
function loadIncomeHistory() {

  const user = getCurrentUser?.();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const history = user?.incomeHistory || [];

  let html = `
    <h3>Income History</h3>
    <table border="1" width="100%">
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Description</th>
      </tr>
  `;

  if (!history.length) {
    html += `<tr><td colspan="4">No Income Records</td></tr>`;
  }

  history.forEach(item => {

    const date = item?.date || "-";
    const type = item?.type || "-";
    const amount = Number(item?.amount || 0);
    const desc = item?.description || "-";

    html += `
      <tr>
        <td>${date}</td>
        <td>${type}</td>
        <td>₹${amount}</td>
        <td>${desc}</td>
      </tr>
    `;
  });

  html += `</table>`;
  main.innerHTML = html;
}

// ================= ADD INCOME =================
function addIncome(userId, type, amount, description = "") {

  const safeAmount = Number(amount);

if (!isFinite(safeAmount) || safeAmount <= 0) return;

  let users = getUsers?.() || [];
  let index = users.findIndex(u => u.userId === userId);

  if (index === -1) return;

  users[index].incomeHistory ||= [];

  users[index].incomeHistory.push({
    type: type || "-",
    amount: safeAmount,
    description: description || "",
    date: new Date().toISOString()
  });

  users[index].wallet ||= {};
  users[index].wallet.incomeBalance =
    Number(users[index].wallet.incomeBalance || 0) + safeAmount;

  saveUsers?.(users);
}

// ================= BROADCAST API =================
function broadcastIncomeEvent(payload = {}) {
  safeEmit("INCOME_EVENT", {
    ...payload,
    timestamp: Date.now()
  });
}

// ================= EXPORTS =================
window.initIncomeSystem = initIncomeSystem;
window.loadIncomeHistory = loadIncomeHistory;
window.addIncome = addIncome;
window.broadcastIncomeEvent = broadcastIncomeEvent;

// ================= AUTO BOOT =================
(function enterpriseBoot() {

  function start() {

    if (window.__INCOME_BOOTED__) return;

    window.__INCOME_BOOTED__ = true;

    initIncomeSystem();

    console.log("[INCOME] ENTERPRISE BOOT COMPLETE");
  }

  const wait = setInterval(() => {

    if (window.SYSTEM_EVENTS?.on) {

      clearInterval(wait);

      // single listener only
      window.SYSTEM_EVENTS.on("SYSTEM_READY", start);

      // SAFE BACKUP (ONLY if already fired system-wide flag exists)
      if (window.__SYSTEM_READY__ === true) {
        start();
      }
    }

  }, 50);

})();
