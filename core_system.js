"use strict";

/*
========================================
CORE SYSTEM V10.1 (FINAL FIXED)
========================================
✔ Safe storage recovery
✔ Verified writes
✔ Clean initialization order FIXED
✔ Global READY signal ADDED
✔ Prevent race condition across modules
✔ Production stable boot layer
========================================
*/

// ================= GLOBAL STATE =================
window.__CORE_STATE__ = window.__CORE_STATE__ || {
  initialized: false,
  initializing: false,
  corrupted: false,
  storageAvailable: true,
  version: "10.1",
  initTime: null,
  lastError: null
};

// ================= STORAGE TEST =================
function isStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error("Storage unavailable:", e.message);
    window.__CORE_STATE__.storageAvailable = false;
    window.__CORE_STATE__.lastError = e.message;
    return false;
  }
}

// ================= SAFE STORAGE =================
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const data = JSON.parse(raw);
    return data ?? fallback;

  } catch (e) {
    console.error("safeGet error:", key, e.message);
    window.__CORE_STATE__.lastError = e.message;
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    const encoded = JSON.stringify(value);
    localStorage.setItem(key, encoded);

    const verify = localStorage.getItem(key);
    if (verify !== encoded) {
      throw new Error("Storage verification failed");
    }

    return true;

  } catch (e) {
    console.error("safeSet error:", key, e.message);
    window.__CORE_STATE__.corrupted = true;
    window.__CORE_STATE__.lastError = e.message;
    return false;
  }
}

// ================= NORMALIZER =================
function normalizeUser(user = {}) {
  if (!user || typeof user !== "object") return null;
  if (!user.userId) return null;

  const safeUser = { ...user };

  safeUser.status = safeUser.status || "active";
  safeUser.role = safeUser.role || "user";

  safeUser.wallet = safeUser.wallet || {
    balance: 0,
    incomeBalance: 0,
    holdIncome: 0,
    totalCredit: 0,
    totalDebit: 0
  };

  Object.keys(safeUser.wallet).forEach(k => {
    let v = Number(safeUser.wallet[k]);
    if (isNaN(v) || v < 0) v = 0;
    safeUser.wallet[k] = parseFloat(v.toFixed(2));
  });

  safeUser.directIds = Array.isArray(safeUser.directIds) ? [...safeUser.directIds] : [];
  safeUser.children = Array.isArray(safeUser.children) ? [...safeUser.children] : [];

  return safeUser;
}

// ================= USERS =================
function getUsers() {
  let users = safeGet("users", []);
  if (!Array.isArray(users)) users = [];

  const clean = [];
  const ids = new Set();

  users.forEach(u => {
    const n = normalizeUser(u);
    if (!n) return;

    if (ids.has(n.userId)) return;

    ids.add(n.userId);
    clean.push(n);
  });

  return clean;
}

function saveUsers(users) {
  if (!Array.isArray(users)) return false;

  const clean = [];
  const ids = new Set();

  users.forEach(u => {
    const n = normalizeUser(u);
    if (!n) return;

    if (ids.has(n.userId)) return;

    ids.add(n.userId);
    clean.push(n);
  });

  return safeSet("users", clean);
}

// ================= SETTINGS =================
function getSystemSettings() {
  const stored = safeGet("systemSettings", {});

  return {
    lockMode: false,
    registrationOpen: true,
    adminAccess: true,
    payoutOpen: true,
    incomeOpen: true,
    autoRun: false,
    updatedAt: new Date().toISOString(),
    ...(stored || {})
  };
}

function saveSystemSettings(settings) {
  return safeSet("systemSettings", settings);
}

// ================= CORE INIT =================
function initCoreSystem() {

  if (window.__CORE_STATE__.initialized) return true;
  if (window.__CORE_STATE__.initializing) return false;

  window.__CORE_STATE__.initializing = true;

  try {

    if (!isStorageAvailable()) {
      throw new Error("Storage unavailable");
    }

    let users = getUsers();

    const seeds = [
      {
        userId: "SUPERADMIN",
        role: "super_admin",
        status: "active"
      },
      {
        userId: "SYSTEM",
        role: "system",
        status: "active",
        wallet: {
          balance: 0,
          incomeBalance: 0,
          totalCredit: 0,
          totalDebit: 0
        }
      }
    ];

    const ids = new Set(users.map(u => u.userId));

    seeds.forEach(s => {
      if (!ids.has(s.userId)) {
        users.push(normalizeUser(s));
      }
    });

    saveUsers(users);
    saveSystemSettings(getSystemSettings());

    window.__CORE_STATE__.initialized = true;
    window.__CORE_STATE__.initializing = false;
    window.__CORE_STATE__.initTime = Date.now();
    window.__CORE_STATE__.lastError = null;

    // 🔥 GLOBAL SYNC SIGNAL (IMPORTANT FIX)
    window.__CORE_READY__ = true;
    window.dispatchEvent(new Event("CORE_READY"));

    console.log("[CORE] SYSTEM READY V10.1");

    return true;

  } catch (e) {

    console.error("[CORE ERROR]", e.message);

    window.__CORE_STATE__.corrupted = true;
    window.__CORE_STATE__.initializing = false;
    window.__CORE_STATE__.lastError = e.message;

    return false;
  }
}

// ================= SAFE INIT =================
window.addEventListener("DOMContentLoaded", initCoreSystem);

