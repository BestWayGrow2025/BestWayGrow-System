"use strict";

/*
========================================
SUPER ADMIN PAGE REGISTRY v1.1 (FIXED)
========================================
✔ Waits for Core Engine readiness
✔ Safe module registration
✔ No race conditions
========================================
*/

(function () {

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

  function registerPage(page, title) {

    window.ENTERPRISE_CORE_ENGINE.register(page, function () {

      const container = document.getElementById("mainContent");
      if (!container) return;

      container.innerHTML = `
        <h2>${title}</h2>
        <p>${page} module loaded successfully.</p>
      `;
    });

  }

  function initRegistry() {

    // Core Pages
    registerPage("home", "🏠 Home Dashboard");
    registerPage("create", "👑 Create System Admin");
    registerPage("users", "👥 User Management");
    registerPage("system", "⚙️ System Settings");

    // Business Pages
    registerPage("pinmaster", "📌 PIN Master");
    registerPage("productmaster", "📦 Product Master");
    registerPage("rankmaster", "🏆 Rank Master");
    registerPage("incomecontrol", "💰 Income Control");

    // Governance
    registerPage("audit", "📜 Audit");
    registerPage("health", "🩺 Health");
    registerPage("backup", "💾 Backup");
    registerPage("aigovernor", "🤖 AI Governor");

    // Financial
    registerPage("escrow", "📦 Escrow Control");

    // Executive
    registerPage("controlroom", "🖥 Enterprise Control Room");
    registerPage("businessintelligence", "📊 Business Intelligence");
    registerPage("strategicai", "🧠 Strategic AI Advisor");

    // Platform
    registerPage("auditblockchain", "⛓ Enterprise Audit Blockchain");
    registerPage("realtime", "📡 Live System Realtime");
    registerPage("payments", "💳 Payment Gateway");
    registerPage("orchestrator", "🧩 Orchestrator Kernel");
    registerPage("healthmonitor", "🩺 Advanced Health Monitor");

    // Monitoring
    registerPage("eventmonitor", "📡 Event Monitor");
    registerPage("eventstream", "🌊 Event Stream");

    // Reporting
    registerPage("reports", "📊 Reports");
    registerPage("tree", "🌳 Tree View");
    registerPage("reset", "♻️ Reset");

    console.log("[SUPER ADMIN PAGE REGISTRY] READY");
  }

  waitForCore(initRegistry);

})();
