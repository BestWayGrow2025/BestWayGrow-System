/*
========================================
💸 WITHDRAWAL SYSTEM V9.0 (FINAL HARDENED)
========================================
✔ Core safety aligned
✔ Session-safe execution
✔ Immutable config normalization
✔ Atomic withdrawal locking
✔ Duplicate/replay protection
✔ Pending request protection
✔ Wallet rollback-safe debit flow
✔ Approve/reject idempotent
✔ Refund rollback protected
✔ Transaction ref hardened
✔ Audit + critical logging
✔ Production LOCKED
========================================
*/

"use strict";

const WITHDRAW_LIMIT = 3000;
const WITHDRAW_KEY = "withdrawals";
const WITHDRAW_CONFIG_KEY = "withdrawConfig";

const WITHDRAW_LOCKS = {};
const WITHDRAW_LOCK_TTL = 10000;

// =====================
// CONFIG
// =====================
function getDefaultWithdrawConfig() {

  return {
    chargeEnabled: true,
    chargePercent: 10,
    minWithdraw: 500,
    updatedAt: new Date().toISOString()
  };
}

function normalizeWithdrawConfig(cfg = {}) {

  const base = {
    ...getDefaultWithdrawConfig(),
    ...(cfg || {})
  };

  base.chargeEnabled =
    base.chargeEnabled !== false;

  base.chargePercent = Math.max(
    0,
    Math.min(
      100,
      Number(base.chargePercent || 0)
    )
  );

  base.minWithdraw = Math.max(
    0,
    Number(base.minWithdraw || 0)
  );

  base.updatedAt =
    base.updatedAt ||
    new Date().toISOString();

  return base;
}

// =====================
// CONFIG LOAD/SAVE
// =====================
function getWithdrawConfig() {

  let cfg = normalizeWithdrawConfig(
    safeGet(
      WITHDRAW_CONFIG_KEY,
      {}
    )
  );

  safeSet(
    WITHDRAW_CONFIG_KEY,
    cfg
  );

  return cfg;
}

function saveWithdrawConfig(data) {

  let cfg =
    normalizeWithdrawConfig(data);

  cfg.updatedAt =
    new Date().toISOString();

  safeSet(
    WITHDRAW_CONFIG_KEY,
    cfg
  );

  return true;
}

// =====================
// STORAGE
// =====================
function normalizeWithdrawEntry(w = {}) {

  return {
    requestId:
      String(
        w.requestId ||
        generateTxnRef("WD")
      ),

    userId:
      String(w.userId || ""),

    amount:
      parseFloat(
        Number(
          w.amount || 0
        ).toFixed(2)
      ),

    charge:
      parseFloat(
        Number(
          w.charge || 0
        ).toFixed(2)
      ),

    finalAmount:
      parseFloat(
        Number(
          w.finalAmount || 0
        ).toFixed(2)
      ),

    status:
      String(
        w.status || "PENDING"
      ),

    time:
      w.time ||
      new Date().toISOString(),

    processedAt:
      w.processedAt || null,

    processedBy:
      w.processedBy || null,

    debitRef:
      String(w.debitRef || ""),

    refundRef:
      String(w.refundRef || "")
  };
}

function getWithdrawals() {

  let data = safeGet(
    WITHDRAW_KEY,
    []
  );

  if (!Array.isArray(data)) {
    data = [];
  }

  return data
    .map(normalizeWithdrawEntry)
    .filter(w =>
      w.requestId &&
      w.userId
    );
}

function saveWithdrawals(data) {

  if (!Array.isArray(data)) {
    data = [];
  }

  data = data
    .map(normalizeWithdrawEntry)
    .slice(-WITHDRAW_LIMIT);

  safeSet(
    WITHDRAW_KEY,
    data
  );

  return true;
}

// =====================
// LOCKS
// =====================
function isWithdrawLocked(userId) {

  let lock =
    WITHDRAW_LOCKS[userId];

  if (!lock) {
    return false;
  }

  if (
    (Date.now() - lock) >
    WITHDRAW_LOCK_TTL
  ) {

    delete WITHDRAW_LOCKS[userId];

    return false;
  }

  return true;
}

function setWithdrawLock(
  userId,
  val
) {

  if (val) {

    WITHDRAW_LOCKS[userId] =
      Date.now();

  } else {

    delete WITHDRAW_LOCKS[userId];
  }
}

// =====================
// SYSTEM SAFETY
// =====================
function isWithdrawSystemSafe() {

  try {

    if (
      typeof window.__CORE_STATE__ !==
      "undefined" &&
      window.__CORE_STATE__
    ) {

      if (
        window.__CORE_STATE__.initialized !== true
      ) {

        return false;
      }

      if (
        window.__CORE_STATE__.corrupted === true
      ) {

        return false;
      }
    }

    if (
      typeof getSession ===
      "function"
    ) {

      let session =
        getSession();

      if (
        !session ||
        !session.userId
      ) {

        return false;
      }
    }

    let settings =
      typeof getSystemSettings ===
      "function"
        ? getSystemSettings()
        : null;

    if (!settings) {
      return false;
    }

    if (
      settings.lockMode === true
    ) {

      return false;
    }

    if (
      settings.withdrawStop === true
    ) {

      return false;
    }

    if (
      typeof isSystemSafe ===
      "function"
    ) {

      return !!isSystemSafe();
    }

    return true;

  } catch {

    return false;
  }
}

// =====================
// HELPERS
// =====================
function getPendingWithdraw(
  userId
) {

  return getWithdrawals()
    .find(w =>
      w.userId === userId &&
      w.status === "PENDING"
    );
}

function hasRecentWithdraw(
  userId,
  ms = 5000
) {

  return getWithdrawals()
    .some(w => {

      if (
        w.userId !== userId
      ) {

        return false;
      }

      return (
        Date.now() -
        new Date(
          w.time
        ).getTime()
      ) < ms;
    });
}

function generateWithdrawRef(
  prefix = "WD"
) {

  return (
    prefix + "_" +
    Date.now() + "_" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}

// =====================
// REQUEST
// =====================
function requestWithdraw(
  userId,
  amount
) {

  if (!userId) {
    return false;
  }

  if (
    !isWithdrawSystemSafe()
  ) {

    return false;
  }

  if (
    isWithdrawLocked(userId)
  ) {

    return false;
  }

  setWithdrawLock(
    userId,
    true
  );

  try {

    amount = Number(amount);

    if (
      isNaN(amount) ||
      amount <= 0
    ) {

      return false;
    }

    if (
      typeof isUserActive ===
      "function" &&
      !isUserActive(userId)
    ) {

      return false;
    }

    if (
      hasRecentWithdraw(userId)
    ) {

      return false;
    }

    if (
      getPendingWithdraw(userId)
    ) {

      return false;
    }

    const cfg =
      getWithdrawConfig();

    if (
      amount <
      Number(
        cfg.minWithdraw || 0
      )
    ) {

      return false;
    }

    if (
      typeof getWalletBalance !==
      "function"
    ) {

      return false;
    }

    const balance =
      Number(
        getWalletBalance(userId)
      );

    if (
      isNaN(balance) ||
      balance < amount
    ) {

      return false;
    }

    const charge =
      cfg.chargeEnabled
        ? parseFloat(
            (
              amount *
              Number(
                cfg.chargePercent || 0
              ) / 100
            ).toFixed(2)
          )
        : 0;

    const finalAmount =
      parseFloat(
        (
          amount - charge
        ).toFixed(2)
      );

    if (
      finalAmount <= 0
    ) {

      return false;
    }

    if (
      typeof debitWallet !==
      "function"
    ) {

      return false;
    }

    const debitRef =
      generateWithdrawRef(
        "WITHDRAW_DEBIT"
      );

    const debited =
      debitWallet(
        userId,
        amount,
        "Withdrawal Request",
        debitRef
      );

    if (!debited) {
      return false;
    }

    let withdrawals =
      getWithdrawals();

    let request = {
      requestId:
        generateWithdrawRef(
          "WD"
        ),

      userId,

      amount,

      charge,

      finalAmount,

      status:
        "PENDING",

      time:
        new Date()
          .toISOString(),

      processedAt:
        null,

      processedBy:
        null,

      debitRef,

      refundRef:
        ""
    };

    withdrawals.push(request);

    const saved =
      saveWithdrawals(
        withdrawals
      );

    if (!saved) {

      if (
        typeof creditWallet ===
        "function"
      ) {

        creditWallet(
          userId,
          amount,
          "Withdrawal Rollback",
          generateWithdrawRef(
            "WITHDRAW_ROLLBACK"
          ),
          true
        );
      }

      return false;
    }

    if (
      typeof logActivity ===
      "function"
    ) {

      logActivity(
        userId,
        "USER",
        "Withdraw Request ₹" +
        amount +
        " | Fee ₹" +
        charge
      );
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      logCritical(
        "Withdraw request error: " +
        err.message,
        userId
      );
    }

    return false;

  } finally {

    setWithdrawLock(
      userId,
      false
    );
  }
}

// =====================
// APPROVE
// =====================
function approveWithdraw(
  requestId,
  adminId = "ADMIN"
) {

  try {

    if (
      !isWithdrawSystemSafe()
    ) {

      return false;
    }

    let withdrawals =
      getWithdrawals();

    let req =
      withdrawals.find(
        w =>
          w.requestId ===
          requestId
      );

    if (
      !req ||
      req.status !== "PENDING"
    ) {

      return false;
    }

    req.status =
      "APPROVED";

    req.processedAt =
      new Date()
        .toISOString();

    req.processedBy =
      adminId;

    saveWithdrawals(
      withdrawals
    );

    if (
      typeof logActivity ===
      "function"
    ) {

      logActivity(
        adminId,
        "ADMIN",
        "Withdraw Approved " +
        requestId
      );
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      logCritical(
        "Approve withdraw error: " +
        err.message,
        adminId
      );
    }

    return false;
  }
}

// =====================
// REJECT
// =====================
function rejectWithdraw(
  requestId,
  adminId = "ADMIN"
) {

  try {

    if (
      !isWithdrawSystemSafe()
    ) {

      return false;
    }

    let withdrawals =
      getWithdrawals();

    let req =
      withdrawals.find(
        w =>
          w.requestId ===
          requestId
      );

    if (
      !req ||
      req.status !== "PENDING"
    ) {

      return false;
    }

    if (
      typeof creditWallet !==
      "function"
    ) {

      return false;
    }

    const refundRef =
      generateWithdrawRef(
        "WITHDRAW_REFUND"
      );

    const refunded =
      creditWallet(
        req.userId,
        req.amount,
        "Withdraw Refund",
        refundRef,
        true
      );

    if (!refunded) {
      return false;
    }

    req.status =
      "REJECTED";

    req.processedAt =
      new Date()
        .toISOString();

    req.processedBy =
      adminId;

    req.refundRef =
      refundRef;

    saveWithdrawals(
      withdrawals
    );

    if (
      typeof logActivity ===
      "function"
    ) {

      logActivity(
        adminId,
        "ADMIN",
        "Withdraw Rejected " +
        requestId
      );
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      logCritical(
        "Reject withdraw error: " +
        err.message,
        adminId
      );
    }

    return false;
  }
}

// =====================
// ADMIN CONFIG
// =====================
function toggleWithdrawCharge(
  adminId = "ADMIN"
) {

  let cfg =
    getWithdrawConfig();

  cfg.chargeEnabled =
    !cfg.chargeEnabled;

  saveWithdrawConfig(cfg);

  if (
    typeof logActivity ===
    "function"
  ) {

    logActivity(
      adminId,
      "ADMIN",
      "Withdraw Charge → " +
      (
        cfg.chargeEnabled
          ? "ON"
          : "OFF"
      )
    );
  }

  return true;
}

function updateWithdrawChargePercent(
  percent,
  adminId = "ADMIN"
) {

  percent = Number(percent);

  if (
    isNaN(percent) ||
    percent < 0 ||
    percent > 100
  ) {

    return false;
  }

  let cfg =
    getWithdrawConfig();

  cfg.chargePercent =
    percent;

  saveWithdrawConfig(cfg);

  if (
    typeof logActivity ===
    "function"
  ) {

    logActivity(
      adminId,
      "ADMIN",
      "Withdraw Charge % → " +
      percent
    );
  }

  return true;
}

function resetWithdrawConfig(
  adminId = "ADMIN"
) {

  saveWithdrawConfig(
    getDefaultWithdrawConfig()
  );

  if (
    typeof logActivity ===
    "function"
  ) {

    logActivity(
      adminId,
      "ADMIN",
      "Withdraw config RESET"
    );
  }

  return true;
}

// =====================
// EXPORTS
// =====================
window.getWithdrawConfig =
  getWithdrawConfig;

window.saveWithdrawConfig =
  saveWithdrawConfig;

window.toggleWithdrawCharge =
  toggleWithdrawCharge;

window.updateWithdrawChargePercent =
  updateWithdrawChargePercent;

window.resetWithdrawConfig =
  resetWithdrawConfig;

window.getWithdrawals =
  getWithdrawals;

window.saveWithdrawals =
  saveWithdrawals;

window.requestWithdraw =
  requestWithdraw;

window.approveWithdraw =
  approveWithdraw;

window.rejectWithdraw =
  rejectWithdraw;

window.isWithdrawSystemSafe =
  isWithdrawSystemSafe;
