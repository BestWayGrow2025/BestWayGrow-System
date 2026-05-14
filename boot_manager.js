"use strict";

/*
========================================
BOOT ARCHITECTURE V2 - CORE ENGINE
========================================
✔ Module registry system
✔ Dependency validation
✔ Load tracking
✔ Crash-safe boot
✔ No silent failures
========================================
*/

window.BOOT = {
  modules: {},
  status: {},
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
    BOOT.modules[name]();
    BOOT.loaded(name);
  } else {
    throw new Error("Module not found: " + name);
  }
};

/* ================= BOOT REPORT ================= */

BOOT.report = function () {
  console.log("===== BOOT STATUS =====");
  console.table(BOOT.status);
};
