/*
========================================
CORE SYSTEM V10.1 (FINAL HARDENED CORE)
========================================
✔ Safe storage recovery
✔ Immutable normalization
✔ Verified writes
✔ Duplicate cleanup
✔ System settings normalization
✔ Single initialization lock
✔ Core health tracking
✔ Authoritative safety layer
✔ Storage availability validation
✔ No recursive safety instability
✔ Production LOCKED
========================================
*/

"use strict";

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

    if (raw === null || raw === undefined || raw === "") {
      return fallback;
    }

    const data = JSON.parse(raw);

    if (data === null || data === undefined) {
      return fallback;
    }

    return data;

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

    // ================= VERIFY WRITE =================
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

// ================= USER NORMALIZER =================
function normalizeUser(user = {}) {

  if (!user || typeof user !== "object") {
    return null;
  }

  if (!user.userId) {
    return null;
  }

  // IMMUTABLE COPY
  const safeUser = {
    ...user
  };

  safeUser.status = safeUser.status || "active";
  safeUser.accountStatus = safeUser.accountStatus || "active";
  safeUser.role = safeUser.role || "user";

  if (!safeUser.wallet || typeof safeUser.wallet !== "object") {
    safeUser.wallet = {};
  }

  const walletDefaults = {
    balance: 0,
    incomeBalance: 0,
    holdIncome: 0,
    totalCredit: 0,
    totalDebit: 0
  };

  const cleanWallet = {};

  Object.keys(walletDefaults).forEach(k => {

    let val = Number(safeUser.wallet[k]);

    if (isNaN(val) || val < 0) {
      val = 0;
    }

    cleanWallet[k] = parseFloat(val.toFixed(2));
  });

  safeUser.wallet = cleanWallet;

  safeUser.directIds = Array.isArray(safeUser.directIds)
    ? [...safeUser.directIds]
    : [];

  safeUser.children = Array.isArray(safeUser.children)
    ? [...safeUser.children]
    : [];

  return safeUser;
}

// ================= USERS =================
function getUsers() {

  let users = safeGet("users", []);

  if (!Array.isArray(users)) {
    users = [];
  }

  let clean = [];
  let ids = new Set();

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

  let clean = [];
  let ids = new Set();

  users.forEach(user => {

    const normalized = normalizeUser(user);

    if (!normalized) return;

    if (ids.has(normalized.userId)) return;

    ids.add(normalized.userId);

    clean.push(normalized);
  });

  return safeSet("users", clean);
}

// ================= SETTINGS =================
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
    ...(settings && typeof settings === "object"
      ? settings
      : {})
  };

  Object.keys(defaults).forEach(k => {

    if (typeof defaults[k] === "boolean") {
      safe[k] = safe[k] === true;
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

  const clean = normalizeSystemSettings(settings);

  return safeSet("systemSettings", clean);
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

// ================= SYSTEM SAFETY =================
function isSystemSafe() {

  const state = window.__CORE_STATE__;

  if (!state) return false;

  if (state.initializing) return false;

  if (state.corrupted) return false;

  if (!state.storageAvailable) return false;

  if (!state.initialized) return false;

  return true;
}

// ================= SEED SYSTEM =================
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
      username: "Root Admin",
      password: btoa("123456"),
      role: "admin",
      status: "active",
      createdAt: now
    },
    {
      userId: "SYSTEM",
      username: "System Pool",
      role: "system",
      status: "active",
      wallet: {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      },
      createdAt: now
    }
  ];

  const ids = new Set(users.map(u => u.userId));

  seeds.forEach(seed => {

    if (!ids.has(seed.userId)) {

      users.push(normalizeUser(seed));

      changed = true;
    }
  });

  return changed;
}

// ================= CORE INIT =================
function initCoreSystem() {

  if (window.__CORE_STATE__.initialized) {
    return true;
  }

  if (window.__CORE_STATE__.initializing) {
    return false;
  }

  window.__CORE_STATE__.initializing = true;

  try {

    if (!isStorageAvailable()) {
      throw new Error("Storage unavailable");
    }

    let users = getUsers();

    let changed = false;

    if (seedSystemUsers(users)) {
      changed = true;
    }

    if (changed) {

      const saved = saveUsers(users);

      if (!saved) {
        throw new Error("User save failed");
      }
    }

    // SETTINGS SELF-HEAL
    const settings = getSystemSettings();

    if (!safeSet("systemSettings", settings)) {
      throw new Error("Settings save failed");
    }

    window.__CORE_STATE__.initialized = true;
    window.__CORE_STATE__.initializing = false;
    window.__CORE_STATE__.corrupted = false;
    window.__CORE_STATE__.storageAvailable = true;
    window.__CORE_STATE__.initTime = Date.now();
    window.__CORE_STATE__.lastError = null;

    console.log("Core System Initialized V10.1");

    return true;

  } catch (e) {

    console.error("Core init failed:", e.message);

    window.__CORE_STATE__.initialized = false;
    window.__CORE_STATE__.initializing = false;
    window.__CORE_STATE__.corrupted = true;
    window.__CORE_STATE__.lastError = e.message;

    return false;
  }
}

// ================= AUTO INIT =================
initCoreSystem();
