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
  hooks: {},

  /* ================= ENTERPRISE LAYER REGISTRY ================= */
  enterprise: {
    core: null,
    autopilot: null,
    autowiring: null,
    learning: null
  }
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

  /* ================= CORE ENGINE ================= */
  if (typeof EnterpriseCoreEngine !== "undefined") {
    BOOT.enterprise.core = new EnterpriseCoreEngine();
  }

  /* ================= AUTO WIRING ================= */
  if (typeof EnterpriseAutoWiringLayer !== "undefined") {
    BOOT.enterprise.autowiring = new EnterpriseAutoWiringLayer();
    BOOT.enterprise.autowiring?.connect?.();
  }

  /* ================= AUTOPILOT ENGINE ================= */
  if (typeof EnterpriseAutopilotEngine !== "undefined") {
    BOOT.enterprise.autopilot = new EnterpriseAutopilotEngine();
  }

  /* ================= SELF LEARNING ENGINE ================= */
  if (typeof EnterpriseSelfLearningEngine !== "undefined") {
    BOOT.enterprise.learning = new EnterpriseSelfLearningEngine();
  }

  /* ================= EVENT HUB WIRING ================= */

  if (window.systemEventHub && BOOT.enterprise.core) {
    BOOT.enterprise.core.attachLiveLoop?.(window.systemEventHub);
  }

  if (BOOT.enterprise.learning && window.auditAPI) {
    BOOT.enterprise.learning.attach?.(window.auditAPI);
  }

  if (typeof attachAutopilotToEventHub === "function") {
    attachAutopilotToEventHub(window.systemEventHub);
  }

  BOOT.runHook("enterpriseReady", true);

  console.log("[BOOT] ENTERPRISE CORE FULLY WIRED");
};

/* ================= AUTO START ================= */

BOOT.startSystem = function () {
  console.log("[BOOT] SYSTEM START SEQUENCE INITIATED");

  BOOT.initEnterprise();

  if (BOOT.modules["super_admin_dashboard"]) {
    BOOT.start("super_admin_dashboard");
  }

  BOOT.runHook("systemReady", true);
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

BOOT.on("systemReady", function () {
  console.log("[SYSTEM] ALL LAYERS ONLINE");
});
