"use strict";

/*
========================================
CORE SYSTEM v10.2 (BOOT MANAGER FINAL)
========================================
✔ Safe storage recovery
✔ Verified writes
✔ Duplicate cleanup
✔ User normalization
✔ System settings normalization
✔ Seed user self-healing
✔ Global READY signal
✔ Boot Manager compatible
✔ No automatic self-start
✔ Production stable
========================================
*/

// ========================================
// GLOBAL STATE
// ========================================

window.__CORE_STATE__ = window.__CORE_STATE__ || {
  initialized: false,
  initializing: false,
  corrupted: false,
  storageAvailable: true,
  version: "10.2",
  initTime: null,
  lastError: null
};

// ========================================
// STORAGE TEST
// ========================================

function isStorageAvailable() {

  try {

    const testKey = "__storage_test__";

    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);

    return true;

  } catch (e) {

    console.error("[CORE] Storage unavailable:", e.message);

    window.__CORE_STATE__.storageAvailable = false;
    window.__CORE_STATE__.lastError = e.message;

    return false;
  }
}

// ========================================
// SAFE STORAGE
// ========================================

function safeGet(key, fallback) {

  try {

    const raw = localStorage.getItem(key);

    if (raw === null || raw === undefined || raw === "") {
      return fallback;
    }

    const data = JSON.parse(raw);

    return (data === null || data === undefined)
      ? fallback
      : data;

  } catch (e) {

    console.error("[CORE] safeGet error:", key, e.message);

    window.__CORE_STATE__.lastError = e.message;

    return fallback;
  }
}

function safeSet(key, value) {

  try {

    const encoded = JSON.stringify(value);

    localStorage.setItem(key, encoded);

    // Verify write
    const verify = localStorage.getItem(key);

    if (verify !== encoded) {
      throw new Error("Storage verification failed");
    }

    return true;

  } catch (e) {

    console.error("[CORE] safeSet error:", key, e.message);

    window.__CORE_STATE__.corrupted = true;
    window.__CORE_STATE__.lastError = e.message;

    return false;
  }
}

// ========================================
// USER NORMALIZER
// ========================================

function normalizeUser(user = {}) {

  if (!user || typeof user !== "object") return null;
  if (!user.userId) return null;

  const safeUser = { ...user };

  // Defaults
  safeUser.status = safeUser.status || "active";
  safeUser.accountStatus = safeUser.accountStatus || "active";
  safeUser.role = safeUser.role || "user";

  // Wallet defaults
  const walletDefaults = {
    balance: 0,
    incomeBalance: 0,
    holdIncome: 0,
    totalCredit: 0,
    totalDebit: 0
  };

  const sourceWallet =
    safeUser.wallet && typeof safeUser.wallet === "object"
      ? safeUser.wallet
      : {};

  const cleanWallet = {};

  Object.keys(walletDefaults).forEach(key => {

    let value = Number(sourceWallet[key]);

    if (isNaN(value) || value < 0) {
      value = 0;
    }

    cleanWallet[key] = parseFloat(value.toFixed(2));
  });

  safeUser.wallet = cleanWallet;

  // Arrays
  safeUser.directIds = Array.isArray(safeUser.directIds)
    ? [...safeUser.directIds]
    : [];

  safeUser.children = Array.isArray(safeUser.children)
    ? [...safeUser.children]
    : [];

  return safeUser;
}

// ========================================
// USERS
// ========================================

function getUsers() {

  let users = safeGet("users", []);

  if (!Array.isArray(users)) {
    users = [];
  }

  const clean = [];
  const ids = new Set();

  users.forEach(user => {

    const normalized = normalizeUser(user);

    if (!normalized) return;
    if (ids.has(normalized.userId)) return;

    ids.add(normalized.userId);
    clean.push(normalized);
  });

  return clean;
}

function saveUsers(users) {

  if (!Array.isArray(users)) {
    return false;
  }

  const clean = [];
  const ids = new Set();

  users.forEach(user => {

    const normalized = normalizeUser(user);

    if (!normalized) return;
    if (ids.has(normalized.userId)) return;

    ids.add(normalized.userId);
    clean.push(normalized);
  });

  return safeSet("users", clean);
}

// ========================================
// SYSTEM SETTINGS
// ========================================

function normalizeSystemSettings(settings = {}) {

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
    manualRun: true,
    queueStop: false,
    initialized: true,
    updatedAt: new Date().toISOString()
  };

  const safe = {
    ...defaults,
    ...(settings && typeof settings === "object" ? settings : {})
  };

  // Normalize booleans
  Object.keys(defaults).forEach(key => {
    if (typeof defaults[key] === "boolean") {
      safe[key] = safe[key] === true;
    }
  });

  safe.updatedAt = new Date().toISOString();

  return safe;
}

function getSystemSettings() {

  const stored = safeGet("systemSettings", {});

  return normalizeSystemSettings(stored);
}

function saveSystemSettings(settings) {

  return safeSet(
    "systemSettings",
    normalizeSystemSettings(settings)
  );
}

// ========================================
// HELPERS
// ========================================

function getUserById(userId) {

  if (!userId) return null;

  return getUsers().find(user => user.userId === userId) || null;
}

function getDirectUsers(userId) {

  if (!userId) return [];

  return getUsers().filter(
    user => user.introducerId === userId
  );
}

function getChildren(userId) {

  if (!userId) return [];

  return getUsers().filter(
    user => user.sponsorId === userId
  );
}

function isSystemSafe() {

  const state = window.__CORE_STATE__;

  return !!(
    state &&
    state.initialized &&
    !state.initializing &&
    !state.corrupted &&
    state.storageAvailable
  );
}

// ========================================
// SEED USERS
// ========================================

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
      userId: "SYSTEM",
      username: "System Pool",
      role: "system",
      status: "active",
      createdAt: now,
      wallet: {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      }
    }
  ];

  const ids = new Set(users.map(user => user.userId));

  seeds.forEach(seed => {

    if (!ids.has(seed.userId)) {
      users.push(normalizeUser(seed));
      changed = true;
    }
  });

  return changed;
}

// ========================================
// CORE INITIALIZATION
// ========================================

function initCoreSystem() {

  // Already initialized
  if (window.__CORE_STATE__.initialized) {
    return true;
  }

  // Currently initializing
  if (window.__CORE_STATE__.initializing) {
    return false;
  }

  window.__CORE_STATE__.initializing = true;

  try {

    // Storage test
    if (!isStorageAvailable()) {
      throw new Error("Storage unavailable");
    }

    // Load users
    let users = getUsers();

    // Seed required users
    const changed = seedSystemUsers(users);

    // Save if changed
    if (changed) {
      if (!saveUsers(users)) {
        throw new Error("Failed to save users");
      }
    }

    // Normalize and save settings
    if (!saveSystemSettings(getSystemSettings())) {
      throw new Error("Failed to save system settings");
    }

    // Update core state
    window.__CORE_STATE__.initialized = true;
    window.__CORE_STATE__.initializing = false;
    window.__CORE_STATE__.corrupted = false;
    window.__CORE_STATE__.storageAvailable = true;
    window.__CORE_STATE__.initTime = Date.now();
    window.__CORE_STATE__.lastError = null;

    // Global readiness flags
    window.__CORE_READY__ = true;

    // =========================
    // DEPENDENCY GATE TRIGGER
    // =========================

    try {

      if (typeof window.startDependencyMonitor === "function") {
        window.startDependencyMonitor();
      }

      if (typeof window.markDependenciesReady === "function") {
        window.markDependenciesReady();
      }

    } catch (e) {
      console.warn("[CORE] Dependency guard hook failed:", e.message);
    }

    // Native event
    window.dispatchEvent(new Event("CORE_READY"));

    // Event bus event
    if (window.SYSTEM_EVENTS &&
        typeof window.SYSTEM_EVENTS.emit === "function") {

      window.SYSTEM_EVENTS.emit("CORE_READY", {
        time: Date.now(),
        state: window.__CORE_STATE__
      });
    }

    console.log("[CORE] SYSTEM READY v10.2");

    return true;

  } catch (e) {

    console.error("[CORE ERROR]", e.message);

    window.__CORE_STATE__.initialized = false;
    window.__CORE_STATE__.initializing = false;
    window.__CORE_STATE__.corrupted = true;
    window.__CORE_STATE__.lastError = e.message;

    return false;
  }
}

// ========================================
// GLOBAL EXPORTS
// ========================================

// Critical export for boot_manager.js
window.initCoreSystem = initCoreSystem;

// Helper exports
window.isStorageAvailable = isStorageAvailable;
window.safeGet = safeGet;
window.safeSet = safeSet;
window.normalizeUser = normalizeUser;
window.getUsers = getUsers;
window.saveUsers = saveUsers;
window.getSystemSettings = getSystemSettings;
window.saveSystemSettings = saveSystemSettings;
window.getUserById = getUserById;
window.getDirectUsers = getDirectUsers;
window.getChildren = getChildren;
window.isSystemSafe = isSystemSafe;

// Debug marker
window.__CORE_SYSTEM_LOADED__ = true;

console.log("[CORE] LOADED v10.2");
