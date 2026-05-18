"use strict";

/*
========================================
BOOT ARCHITECTURE V2 - CORE ENGINE
========================================
✔ Module registry system
✔ Dependency validation
✔ Load tracking
✔ Crash-safe boot
✔ Enterprise engine support
✔ Auto initialization pipeline
========================================
*/

window.BOOT = {
  modules: {},
  status: {},
  hooks: {}
};

/* ================= REGISTER MODULE ================= */

BOOT.register = function (name, fn) {
  BOOT.modules[name] = fn;
  BOOT.status[name] = "registered";
};

/* ================= MARK LOADED ================= */

BOOT.loaded = function (name) {
  BOOT.status[name] = "loaded";
  console.log("[BOOT] Loaded:", name);
};

/* ================= REQUIRE CHECK ================= */

BOOT.require = function (list) {
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (!BOOT.status[m] || BOOT.status[m] !== "loaded") {
      console.error("[BOOT ERROR] Missing module:", m);
      throw new Error("BOOT FAILURE: " + m);
    }
  }
};

/* ================= START MODULE ================= */

BOOT.start = function (name) {
  if (BOOT.modules[name]) {
    try {
      BOOT.modules[name]();
      BOOT.loaded(name);

      // trigger hook after start
      BOOT.runHook("afterStart", name);

    } catch (e) {
      console.error("[BOOT CRASH]", name, e);
      BOOT.runHook("onCrash", { name, error: e });
    }
  } else {
    throw new Error("Module not found: " + name);
  }
};

/* ================= BOOT HOOK SYSTEM ================= */

BOOT.on = function (event, fn) {
  BOOT.hooks[event] = BOOT.hooks[event] || [];
  BOOT.hooks[event].push(fn);
};

BOOT.runHook = function (event, data) {
  const list = BOOT.hooks[event] || [];
  list.forEach(fn => {
    try {
      fn(data);
    } catch (e) {
      console.error("[HOOK ERROR]", e);
    }
  });
};

/* ================= ENTERPRISE AUTO INIT ================= */

BOOT.initEnterprise = function () {

  console.log("[BOOT] Initializing Enterprise Layer...");

  if (typeof initializeEnterpriseCoreSystem === "function") {
    initializeEnterpriseCoreSystem();
  }

  if (typeof bindEnterpriseCoreToDashboard === "function") {
    bindEnterpriseCoreToDashboard();
  }

  BOOT.runHook("enterpriseReady", true);

};

/* ================= AUTO START ================= */

BOOT.startSystem = function () {
  console.log("[BOOT] SYSTEM START SEQUENCE INITIATED");

  BOOT.initEnterprise();

  if (BOOT.modules["super_admin_dashboard"]) {
    BOOT.start("super_admin_dashboard");
  }
};

/* ================= BOOT REPORT ================= */

BOOT.report = function () {
  console.log("===== BOOT STATUS =====");
  console.table(BOOT.status);
};

/* ================= OPTIONAL GLOBAL HOOKS ================= */

BOOT.on("onCrash", function (data) {
  console.error("[RECOVERY TRIGGER]", data);
});

BOOT.on("enterpriseReady", function () {
  console.log("[ENTERPRISE] FULL CORE ACTIVE");
});
