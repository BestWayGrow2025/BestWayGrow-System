"use strict";

/*
========================================
SYSTEM PAGE ROUTER CONNECTOR V1.0
========================================
✔ Central page navigation fix
✔ Connects menu → page renderer
✔ Fixes broken dashboard navigation
✔ Uses data-page mapping
✔ No business logic
========================================
*/

(function () {

  if (window.__SYSTEM_PAGE_ROUTER__) return;

  window.__SYSTEM_PAGE_ROUTER__ = true;

  document.addEventListener("click", function (e) {

    const btn = e.target.closest("[data-page]");

    if (!btn) return;

    const page = btn.getAttribute("data-page");

    if (!page) return;

    openSystemPage(page);

  });

})();

// ================= PAGE HANDLER =================
function openSystemPage(page) {

  try {

    const main = document.getElementById("mainContent");

    if (!main) return;

    // ================= CORE ROUTING =================
    switch (page) {

      case "home":
        main.innerHTML = "🏠 Home Dashboard loaded successfully.";
        break;

      case "create":
        main.innerHTML = "👑 Create Sys Admin Panel";
        break;

      case "users":
        main.innerHTML = "👥 User Management";
        break;

      case "system":
        main.innerHTML = "⚙️ System Panel";
        break;

      case "pinmaster":
        main.innerHTML = "📌 PIN Master Active";
        break;

      case "productmaster":
        main.innerHTML = "📦 Product Master";
        break;

      case "rankmaster":
        main.innerHTML = "🏆 Rank Master";
        break;

      case "incomecontrol":
        main.innerHTML = "💰 Income Control";
        break;

      case "audit":
        main.innerHTML = "📜 Audit Panel";
        break;

      case "health":
        main.innerHTML = "🩺 Health Monitor";
        break;

      case "backup":
        main.innerHTML = "💾 Backup System";
        break;

      case "aigovernor":
        main.innerHTML = "🤖 AI Governor";
        break;

      case "escrow":
        main.innerHTML = "📦 Escrow Control";
        break;

      case "controlroom":
        main.innerHTML = "🖥 Control Room";
        break;

      case "businessintelligence":
        main.innerHTML = "📊 Business Intelligence";
        break;

      case "strategicai":
        main.innerHTML = "🧠 Strategic AI";
        break;

      case "auditblockchain":
        main.innerHTML = "⛓ Audit Blockchain";
        break;

      case "realtime":
        main.innerHTML = "📡 Live System";
        break;

      case "payments":
        main.innerHTML = "💳 Payment Gateway";
        break;

      case "orchestrator":
        main.innerHTML = "🧩 Orchestrator";
        break;

      case "healthmonitor":
        main.innerHTML = "🩺 Health Monitor";
        break;

      case "eventmonitor":
        main.innerHTML = "📡 Event Monitor";
        break;

      case "eventstream":
        main.innerHTML = "🌊 Event Stream";
        break;

      case "reports":
        main.innerHTML = "📊 Reports";
        break;

      case "tree":
        main.innerHTML = "🌳 Tree View";
        break;

      case "reset":
        main.innerHTML = "♻️ Reset System";
        break;

      default:
        main.innerHTML = "❌ Page not found: " + page;
    }

  } catch (err) {
    console.error("[PAGE ROUTER ERROR]", err);
  }
}

// ================= EXPORT =================
window.openSystemPage = openSystemPage;
