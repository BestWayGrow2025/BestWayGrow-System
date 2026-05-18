"use strict";

/*
========================================
SUPER ADMIN PAGE REGISTRY v1.0
========================================
Registers dashboard pages with
Enterprise Core Engine.
========================================
*/

(function () {

  function registerPage(page, title) {
    if (
      !window.ENTERPRISE_CORE_ENGINE ||
      typeof window.ENTERPRISE_CORE_ENGINE.register !== "function"
    ) {
      return;
    }

    window.ENTERPRISE_CORE_ENGINE.register(page, function () {
      const container = document.getElementById("mainContent");
      if (!container) return;

      container.innerHTML = `
        <h2>${title}</h2>
        <p>${title} module loaded successfully.</p>
      `;
    });
  }

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

  // Platform Integration
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

})();
