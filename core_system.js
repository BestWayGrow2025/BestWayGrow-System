/*
========================================
CORE SYSTEM V9.1 (FINAL STABLE SAFE)
========================================
✔ Safe storage
✔ Safe initialization commit
✔ Version controlled system
✔ Stable normalization
✔ Full wallet normalization FIXED
✔ Consistent seed timestamps FIXED
✔ No false initialization state
========================================
*/

"use strict";

// ================= GLOBAL STATE =================
window.__CORE_STATE__ = window.__CORE_STATE__ || {
  initialized: false,
  version: "9.1"
};

// ================= SAFE STORAGE =================
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const data = JSON.parse(raw);
    return (data !== null && data !== undefined) ? data : fallback;

  } catch (e) {
    console.error("safeGet error:", e.message);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("safeSet error:", e.message);
    return false;
  }
}

// ================= USERS =================
function getUsers() {
  const users = safeGet("users", []);
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  if (!Array.isArray(users)) return false;
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

  const stored = safeGet("systemSettings", {});
  return { ...defaults, ...stored };
}

function saveSystemSettings(settings) {
  return safeSet("systemSettings", settings);
}

// ================= SYSTEM SAFE CHECK =================
function isSystemSafe() {
  const s = getSystemSettings() || {};
  let session = null;

  try {
    if (typeof getSession === "function") {
      session = getSession();
    }
  } catch (e) {}

  if (s.lockMode === true && session && session.role !== "super_admin") {
    alert("System Locked");
    return false;
  }

  return true;
}

// ================= HELPERS =================
function getUserById(id) {
  if (!id) return null;
  return getUsers().find(u => u.userId === id) || null;
}

function getDirectUsers(userId) {
  if (!userId) return [];
  return getUsers().filter(u => u.introducerId === userId);
}

function getChildren(userId) {
  if (!userId) return [];
  return getUsers().filter(u => u.sponsorId === userId);
}

// ================= SEED DATA =================
function seedSystemUsers(users) {

  let changed = false;
  const now = Date.now();

  const seeds = [
    {
      userId: "SUPERADMIN",
      username: "Super Admin",
      password: btoa("123"),
      role: "super_admin",
      status: "active",
      createdAt: now
    },
    {
      userId: "BWG000001",
      username: "System Admin",
      password: btoa("123456"),
      role: "system_admin",
      status: "active",
      createdAt: now
    },
    {
      userId: "BWG000000",
      username: "User Root Admin",
      password: btoa("123456"),
      role: "admin",
      status: "active",
      introducerId: "",
      sponsorId: "",
      createdAt: now
    },
    {
      userId: "SYSTEM",
      username: "System Pool",
      role: "system",
      status: "active",
      wallet: {
        balance: 0,
        totalCredit: 0,
        totalDebit: 0
      },
      createdAt: now
    }
  ];

  seeds.forEach(seed => {
    if (!users.find(u => u.userId === seed.userId)) {
      users.push(seed);
      changed = true;
    }
  });

  return changed;
}

// ================= CORE INIT =================
function initCoreSystem() {

  if (window.__CORE_STATE__.initialized) {
    console.log("Core already initialized");
    return;
  }

  try {

    let users = getUsers();
    let changed = false;

    // ================= NORMALIZATION =================
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

      // ================= WALLET SAFE NORMALIZATION =================
      if (!u.wallet) {
        u.wallet = {};
      }

      const defaultWallet = {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      };

      Object.keys(defaultWallet).forEach(k => {
        if (u.wallet[k] === undefined || u.wallet[k] === null) {
          u.wallet[k] = defaultWallet[k];
          changed = true;
        }
      });

    });

    // ================= SEEDING =================
    if (seedSystemUsers(users)) {
      changed = true;
    }

    // ================= COMMIT =================
    if (changed) {
      const ok = saveUsers(users);
      if (!ok) throw new Error("Failed to save users");
    }

    // ================= FINAL INIT COMMIT =================
    window.__CORE_STATE__.initialized = true;

    console.log("✅ Core system initialized (V9.1 FINAL STABLE)");

  } catch (e) {

    console.error("❌ initCoreSystem failed:", e.message);

    window.__CORE_STATE__.initialized = false;
  }
}
}
