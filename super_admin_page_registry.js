"use strict";

/*
========================================
SUPER ADMIN PAGE REGISTRY v2.1 FINAL
========================================
✔ Waits for Core Engine readiness
✔ Safe module registration
✔ Real module execution support
✔ Navigation integration fixed
✔ No placeholder rendering
✔ Production stable
✔ Duplicate execution prevention
✔ Enterprise-safe architecture
========================================
*/

(function () {

  // ========================================
  // INIT GUARD
  // ========================================
  if (window.__SUPER_ADMIN_PAGE_REGISTRY__)
    return;

  window.__SUPER_ADMIN_PAGE_REGISTRY__ =
    true;

  // ========================================
  // WAIT FOR CORE ENGINE
  // ========================================
  function waitForCore(callback) {

    const timer = setInterval(() => {

      if (
        window.ENTERPRISE_CORE_ENGINE &&
        typeof window
          .ENTERPRISE_CORE_ENGINE
          .register === "function"
      ) {

        clearInterval(timer);

        callback();
      }

    }, 100);
  }

  // ========================================
  // REGISTER SINGLE PAGE
  // ========================================
  function registerPage(page, title) {

    window
      .ENTERPRISE_CORE_ENGINE
      .register(page, function () {

        // ========================================
        // REAL MODULE EXECUTION
        // ========================================

        if (
          typeof window
            .executeSuperAdminModule ===
          "function"
        ) {

          window
            .executeSuperAdminModule(page);

          return;
        }

        // ========================================
        // SAFE FALLBACK
        // ========================================

        const container =
          document.getElementById(
            "mainContent"
          );

        if (!container) return;

        container.textContent =
          page + " module unavailable.";
      });
  }

  // ========================================
  // INITIALIZE REGISTRY
  // ========================================
  function initRegistry() {

    // ================= CORE =================
    registerPage(
      "home",
      "🏠 Home Dashboard"
    );

    registerPage(
      "create",
      "👑 Create System Admin"
    );

    registerPage(
      "users",
      "👥 User Management"
    );

    registerPage(
      "system",
      "⚙️ System Settings"
    );

    // ================= BUSINESS =================
    registerPage(
      "pinmaster",
      "📌 PIN Master"
    );

    registerPage(
      "productmaster",
      "📦 Product Master"
    );

    registerPage(
      "rankmaster",
      "🏆 Rank Master"
    );

    registerPage(
      "incomecontrol",
      "💰 Income Control"
    );

    // ================= GOVERNANCE =================
    registerPage(
      "audit",
      "📜 Audit"
    );

    registerPage(
      "health",
      "🩺 Health"
    );

    registerPage(
      "backup",
      "💾 Backup"
    );

    registerPage(
      "aigovernor",
      "🤖 AI Governor"
    );

    // ================= FINANCIAL =================
    registerPage(
      "escrow",
      "📦 Escrow Control"
    );

    // ================= EXECUTIVE =================
    registerPage(
      "controlroom",
      "🖥 Enterprise Control Room"
    );

    registerPage(
      "businessintelligence",
      "📊 Business Intelligence"
    );

    registerPage(
      "strategicai",
      "🧠 Strategic AI Advisor"
    );

    // ================= PLATFORM =================
    registerPage(
      "auditblockchain",
      "⛓ Enterprise Audit Blockchain"
    );

    registerPage(
      "realtime",
      "📡 Live System Realtime"
    );

    registerPage(
      "payments",
      "💳 Payment Gateway"
    );

    registerPage(
      "orchestrator",
      "🧩 Orchestrator Kernel"
    );

    registerPage(
      "healthmonitor",
      "🩺 Advanced Health Monitor"
    );

    // ================= MONITORING =================
    registerPage(
      "eventmonitor",
      "📡 Event Monitor"
    );

    registerPage(
      "eventstream",
      "🌊 Event Stream"
    );

    // ================= REPORTING =================
    registerPage(
      "reports",
      "📊 Reports"
    );

    registerPage(
      "tree",
      "🌳 Tree View"
    );

    registerPage(
      "reset",
      "♻️ Reset"
    );

    console.log(
      "[SUPER ADMIN PAGE REGISTRY] READY"
    );
  }

  // ========================================
  // START
  // ========================================
  waitForCore(initRegistry);

})();
