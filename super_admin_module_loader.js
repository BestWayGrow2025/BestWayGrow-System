"use strict";

/*
========================================
SUPER ADMIN MODULE LOADER vFINAL
========================================
✔ Module UI loader only
✔ Page wiring + bindings
✔ Works with ENTERPRISE_CORE_ENGINE
✔ No business logic
✔ No PIN / financial logic
✔ Registry-safe structure
========================================
*/

(function () {

  console.log("[SUPER ADMIN MODULE LOADER] INIT");

  // ================= CORE WAIT =================
  function waitForCore(callback) {

    const timer = setInterval(() => {

      if (
        window.ENTERPRISE_CORE_ENGINE &&
        typeof window.ENTERPRISE_CORE_ENGINE.register === "function"
      ) {
        clearInterval(timer);
        callback();
      }

    }, 100);

  }

  // ================= PAGE REGISTRATION =================
  function registerPages() {

    const CORE = window.ENTERPRISE_CORE_ENGINE;
    if (!CORE) return;

    // ================= HOME =================
    CORE.register("home", function () {
      setContent(window.renderHome?.() || "<h2>🏠 Home</h2>");
    });

    // ================= CREATE ADMIN =================
    CORE.register("create", function () {
      setContent(window.renderCreateAdmin?.() || "<h2>👑 Create System Admin</h2>");
    });

    // ================= USERS =================
    CORE.register("users", function () {
      setContent(window.renderUsers?.() || "<h2>👥 Users</h2>");
    });

    // ================= SYSTEM =================
    CORE.register("system", function () {
      setContent(window.renderSystem?.() || "<h2>⚙️ System Settings</h2>");
    });

    // ================= PIN =================
    CORE.register("pinmaster", function () {
      setContent(window.renderPINMaster?.() || "<h2>📌 PIN Master</h2>");
    });

    // ================= PRODUCT =================
    CORE.register("productmaster", function () {
      setContent(window.renderProductMaster?.() || "<h2>📦 Product Master</h2>");
    });

    // ================= RANK =================
    CORE.register("rankmaster", function () {
      setContent(window.renderRankMaster?.() || "<h2>🏆 Rank Master</h2>");
    });

    // ================= INCOME =================
    CORE.register("incomecontrol", function () {
      setContent(window.renderIncomeControl?.() || "<h2>💰 Income Control</h2>");
    });

    // ================= AUDIT =================
    CORE.register("audit", function () {
      setContent(window.renderAudit?.() || "<h2>📜 Audit Logs</h2>");
    });

    // ================= HEALTH =================
    CORE.register("health", function () {
      setContent(window.renderHealth?.() || "<h2>🩺 System Health</h2>");
    });

    // ================= BACKUP =================
    CORE.register("backup", function () {
      setContent(window.renderBackup?.() || "<h2>💾 Backup System</h2>");
    });

    // ================= AI GOVERNOR =================
    CORE.register("aigovernor", function () {
      setContent(window.renderAIGovernor?.() || "<h2>🤖 AI Governor</h2>");
    });

    // ================= ESCROW =================
    CORE.register("escrow", function () {
      setContent(window.renderEscrow?.() || "<h2>📦 Escrow Control</h2>");
    });

    // ================= CONTROL ROOM =================
    CORE.register("controlroom", function () {
      setContent(window.renderControlRoom?.() || "<h2>🖥 Control Room</h2>");
    });

    // ================= BUSINESS INTELLIGENCE =================
    CORE.register("businessintelligence", function () {
      setContent(window.renderBI?.() || "<h2>📊 Business Intelligence</h2>");
    });

    // ================= STRATEGIC AI =================
    CORE.register("strategicai", function () {
      setContent(window.renderStrategicAI?.() || "<h2>🧠 Strategic AI</h2>");
    });

    // ================= AUDIT BLOCKCHAIN =================
    CORE.register("auditblockchain", function () {
      setContent(window.renderAuditChain?.() || "<h2>⛓ Audit Blockchain</h2>");
    });

    // ================= REALTIME =================
    CORE.register("realtime", function () {
      setContent(window.renderRealtime?.() || "<h2>📡 Realtime System</h2>");
    });

    // ================= PAYMENTS =================
    CORE.register("payments", function () {
      setContent(window.renderPayments?.() || "<h2>💳 Payment Gateway</h2>");
    });

    // ================= ORCHESTRATOR =================
    CORE.register("orchestrator", function () {
      setContent(window.renderOrchestrator?.() || "<h2>🧩 Orchestrator Kernel</h2>");
    });

    // ================= HEALTH MONITOR =================
    CORE.register("healthmonitor", function () {
      setContent(window.renderHealthMonitor?.() || "<h2>🩺 Health Monitor</h2>");
    });

    // ================= EVENT MONITOR =================
    CORE.register("eventmonitor", function () {
      setContent(window.renderEventMonitor?.() || "<h2>📡 Event Monitor</h2>");
    });

    // ================= EVENT STREAM =================
    CORE.register("eventstream", function () {
      setContent(window.renderEventStream?.() || "<h2>🌊 Event Stream</h2>");
    });

    // ================= REPORTS =================
    CORE.register("reports", function () {
      setContent(window.renderReports?.() || "<h2>📊 Reports</h2>");
    });

    // ================= TREE =================
    CORE.register("tree", function () {
      setContent(window.renderTree?.() || "<h2>🌳 Tree View</h2>");
    });

    // ================= RESET =================
    CORE.register("reset", function () {
      setContent(window.renderReset?.() || "<h2>♻️ System Reset</h2>");
    });

    console.log("[SUPER ADMIN MODULE LOADER] REGISTRY READY");
  }

  // ================= CONTENT SETTER =================
  function setContent(html) {
    const el = document.getElementById("mainContent");
    if (el) el.innerHTML = html;
  }

  // ================= INIT =================
  function init() {

    try {
      registerPages();

      window.__SUPER_ADMIN_MODULE_LOADER__ = {
        loaded: true,
        initialized: true
      };

      console.log("[SUPER ADMIN MODULE LOADER] ACTIVE");

    } catch (err) {
      console.error("[MODULE LOADER ERROR]", err);
    }
  }

  // ================= BOOT =================
  waitForCore(init);

})();
