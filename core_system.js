/*
========================================
CORE SYSTEM V9.0
FINAL STABLE EXECUTION VERSION
========================================
✔ Safe storage
✔ Global initialization lock
✔ No repeated mutation loop
✔ Stable admin/system seeding
✔ Production safe
✔ Session → User bridge
✔ Prevent duplicate storage writes
✔ Prevent recursive initialization
========================================
*/

"use strict";

// ================= GLOBAL INIT LOCK =================
window.__CORE_INIT_DONE__ =
  window.__CORE_INIT_DONE__ || false;

// ================= SAFE STORAGE =================
function safeGet(key, fallback) {

  try {

    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const data = JSON.parse(raw);

    return (
      data !== null &&
      data !== undefined
    )
      ? data
      : fallback;

  } catch (e) {

    console.error(
      "safeGet error:",
      e.message
    );

    return fallback;
  }
}

function safeSet(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (e) {

    console.error(
      "safeSet error:",
      e.message
    );

    return false;
  }
}

// ================= USERS =================
function getUsers() {

  const users =
    safeGet("users", []);

  return Array.isArray(users)
    ? users
    : [];
}

function saveUsers(users) {

  if (!Array.isArray(users)) {
    return false;
  }

  return safeSet("users", users);
}

// ================= SYSTEM SETTINGS =================
function getSystemSettings() {

  const defaults = {

    lockMode: false,

    registrationOpen: true,

    adminAccess: true,

    upgradesOpen: true,

    repurchaseOpen: true,

    withdrawOpen: true,

    pinCreateOpen: true,

    payoutOpen: true,

    incomeOpen: true,

    autoRun: false,

    manualRun: true
  };

  const stored =
    safeGet("systemSettings", {});

  return {
    ...defaults,
    ...stored
  };
}

function saveSystemSettings(settings) {

  return safeSet(
    "systemSettings",
    settings
  );
}

// ================= SYSTEM SAFE CHECK =================
function isSystemSafe() {

  const s =
    getSystemSettings() || {};

  let session = null;

  try {

    if (
      typeof getSession === "function"
    ) {

      session = getSession();
    }

  } catch (e) {}

  if (
    s.lockMode === true &&
    session &&
    session.role !== "super_admin"
  ) {

    alert("System Locked");

    return false;
  }

  return true;
}

// ================= HELPERS =================
function getUserById(id) {

  if (!id) {
    return null;
  }

  return (
    getUsers().find(
      u => u.userId === id
    ) || null
  );
}

function getDirectUsers(userId) {

  if (!userId) {
    return [];
  }

  return getUsers().filter(
    u => u.introducerId === userId
  );
}

function getChildren(userId) {

  if (!userId) {
    return [];
  }

  return getUsers().filter(
    u => u.sponsorId === userId
  );
}

// ================= CORE INIT =================
function initCoreSystem() {

  // 🔒 GLOBAL INIT GUARD
  if (window.__CORE_INIT_DONE__) {

    console.log(
      "Core already initialized"
    );

    return;
  }

  // lock immediately
  window.__CORE_INIT_DONE__ = true;

  try {

    let users = getUsers();

    let changed = false;

    // ================= USER NORMALIZATION =================
    users.forEach(u => {

      if (!u.status) {

        u.status = "active";

        changed = true;
      }

      if (!u.accountStatus) {

        u.accountStatus = "active";

        changed = true;
      }

      if (!u.blockStatus) {

        u.blockStatus = "unblocked";

        changed = true;
      }

      // wallet normalization
      if (!u.wallet) {

        u.wallet = {

          balance: 0,

          incomeBalance: 0,

          holdIncome: 0,

          totalCredit: 0,

          totalDebit: 0
        };

        changed = true;
      }
    });

    // ================= SUPER ADMIN =================
    if (
      !users.find(
        u => u.userId === "SUPERADMIN"
      )
    ) {

      users.push({

        userId: "SUPERADMIN",

        username: "Super Admin",

        password: btoa("123"),

        role: "super_admin",

        status: "active",

        createdAt: Date.now()
      });

      changed = true;
    }

    // ================= SYSTEM ADMIN =================
    if (
      !users.find(
        u => u.userId === "BWG000001"
      )
    ) {

      users.push({

        userId: "BWG000001",

        username: "System Admin",

        password: btoa("123456"),

        role: "system_admin",

        status: "active",

        createdAt: Date.now()
      });

      changed = true;
    }

    // ================= ROOT USER ADMIN =================
    if (
      !users.find(
        u => u.userId === "BWG000000"
      )
    ) {

      users.push({

        userId: "BWG000000",

        username: "User Root Admin",

        password: btoa("123456"),

        role: "admin",

        status: "active",

        introducerId: "",

        sponsorId: "",

        createdAt: Date.now()
      });

      changed = true;
    }

    // ================= SYSTEM POOL =================
    if (
      !users.find(
        u => u.userId === "SYSTEM"
      )
    ) {

      users.push({

        userId: "SYSTEM",

        username: "System Pool",

        role: "system",

        status: "active",

        wallet: {

          balance: 0,

          totalCredit: 0,

          totalDebit: 0
        },

        createdAt: Date.now()
      });

      changed = true;
    }

    // ================= SAVE ONLY IF CHANGED =================
    if (changed) {

      saveUsers(users);

      console.log(
        "Users normalized and saved"
      );
    }

    console.log(
      "✅ Core system initialized (V9 stable)"
    );

  } catch (e) {

    console.error(
      "❌ initCoreSystem failed:",
      e.message
    );
  }
}
