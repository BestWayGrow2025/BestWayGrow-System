"use strict";

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

  function initRegistry() {

    const CORE = window.ENTERPRISE_CORE_ENGINE;

    if (!CORE) return;

    // ================= HOME =================
    CORE.register("home", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderHome?.() || "<h2>🏠 Home</h2>";
    });

    // ================= CREATE =================
    CORE.register("create", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderCreateAdmin?.() || "<h2>👑 Create Admin</h2>";
    });

    // ================= USERS =================
    CORE.register("users", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderUsers?.() || "<h2>👥 Users</h2>";
    });

    // ================= SYSTEM =================
    CORE.register("system", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderSystem?.() || "<h2>⚙️ System</h2>";
    });

    // ================= PIN =================
    CORE.register("pinmaster", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderPINMaster?.() || "<h2>📌 PIN Master</h2>";
    });

    // ================= PRODUCT =================
    CORE.register("productmaster", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderProductMaster?.() || "<h2>📦 Product Master</h2>";
    });

    // ================= AUDIT =================
    CORE.register("audit", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderAudit?.() || "<h2>📜 Audit</h2>";
    });

    // ================= HEALTH =================
    CORE.register("health", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderHealth?.() || "<h2>🩺 Health</h2>";
    });

    // ================= BACKUP =================
    CORE.register("backup", function () {
      document.getElementById("mainContent").innerHTML =
        window.renderBackup?.() || "<h2>💾 Backup</h2>";
    });

    console.log("[SUPER ADMIN PAGE REGISTRY] OPTION B READY");
  }

  waitForCore(initRegistry);

})();
