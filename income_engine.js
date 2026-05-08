"use strict";

const INCOME_CONFIG = {
  UGLI_LEVEL_1: 23.81,
  UGLI_LEVEL_OTHERS: 1.19,
  MAX_LEVELS: 30,
  CTOR_PERCENT: 25
};

const INCOME_EXEC_LOCK = {};
const INCOME_EXEC_TTL = 10000;

// ================= GLOBAL TRANSACTION TRACK =================
const INCOME_TX_KEY = "INCOME_TX_LOG";

// ================= SAFE TX STORE =================
function getTxLog() {

  try {

    return JSON.parse(
      localStorage.getItem(INCOME_TX_KEY)
    ) || {};

  } catch {

    return {};
  }
}

function saveTxLog(log) {

  localStorage.setItem(
    INCOME_TX_KEY,
    JSON.stringify(log)
  );
}

function isTxUsed(txId) {

  const log = getTxLog();

  return !!log[txId];
}

function markTxUsed(txId) {

  if (!txId) return false;

  const log = getTxLog();

  // cleanup old entries (24h)
  const now = Date.now();

  Object.keys(log).forEach(key => {

    if (now - log[key] > 86400000) {
      delete log[key];
    }

  });

  log[txId] = now;

  saveTxLog(log);

  return true;
}

// ================= CALC =================
function calc(bv, percent) {

  let result =
    (Number(bv) * Number(percent)) / 100;

  return parseFloat(result.toFixed(2));
}

// ================= EXEC LOCK =================
function isIncomeLocked(key) {

  let t = INCOME_EXEC_LOCK[key];

  if (!t) return false;

  if (
    Date.now() - t >
    INCOME_EXEC_TTL
  ) {

    delete INCOME_EXEC_LOCK[key];

    return false;
  }

  return true;
}

function setIncomeLock(key, val) {

  if (val) {
    INCOME_EXEC_LOCK[key] = Date.now();
  } else {
    delete INCOME_EXEC_LOCK[key];
  }
}

// ================= VALIDATION =================
function canRunIncome(type) {

  try {

    let s = getSystemSettings();

    if (!s || typeof s !== "object") {
      return false;
    }

    if (s.lockMode === true) {
      return false;
    }

    if (
      type === "upgrade" &&
      s.upgradesOpen === false
    ) {
      return false;
    }

    if (
      type === "repurchase" &&
      s.repurchaseOpen === false
    ) {
      return false;
    }

    if (
      typeof isIncomeAllowed ===
      "function"
    ) {

      if (!isIncomeAllowed(type)) {
        return false;
      }
    }

    return true;

  } catch {

    return false;
  }
}

// ================= SAFE INCOME =================
function safeIncome(data) {

  try {

    if (!data || !data.userId) {
      return false;
    }

    const amount =
      Number(data.amount);

    if (
      isNaN(amount) ||
      amount <= 0
    ) {

      return false;
    }

    if (
      typeof creditWallet !==
      "function"
    ) {

      return false;
    }

    const success = creditWallet(
      data.userId,
      amount,
      `${String(data.type || "income").toUpperCase()} - ${data.note || ""}`
    );

    if (!success) {
      return false;
    }

    if (
      typeof addIncomeLog ===
      "function"
    ) {

      let logged = addIncomeLog({
        userId: data.userId,
        type: data.type,
        amount,
        sourceUser:
          data.sourceUser || "-",
        note:
          data.note || ""
      });

      if (!logged) {

        if (
          typeof debitWallet ===
          "function"
        ) {

          const rollbackOk =
            debitWallet(
              data.userId,
              amount,
              "Income rollback"
            );

          if (!rollbackOk) {

            if (
              typeof logCritical ===
              "function"
            ) {

              logCritical(
                "ROLLBACK FAILED: " +
                data.userId
              );
            }
          }
        }

        return false;
      }
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      logCritical(
        "safeIncome error: " +
        err.message
      );
    }

    return false;
  }
}

// ================= HELPERS =================
function getUser(userId) {

  return typeof getUserById ===
    "function"
    ? getUserById(userId)
    : null;
}

function getIntroducer(user) {

  if (
    !user ||
    !user.introducerId
  ) {

    return null;
  }

  return getUser(
    user.introducerId
  );
}

// ================= CTOR =================
function isCTORQualified(user) {

  if (!user) return false;

  if (
    user.status !== "active"
  ) {

    return false;
  }

  if (
    !user.rankLevel ||
    user.rankLevel <= 0
  ) {

    return false;
  }

  return Number(
    user.monthlyPoints || 0
  ) >= 1;
}

// ================= CTOR DISTRIBUTION =================
function distributeCTOR(
  userId,
  totalCTOR,
  type
) {

  const CTOR_SPLIT = [
    25,
    15,
    12,
    6,
    6,
    6,
    6,
    6,
    6,
    6,
    6
  ];

  totalCTOR = parseFloat(
    Number(totalCTOR).toFixed(2)
  );

  if (totalCTOR <= 0) {
    return false;
  }

  let current = getUser(userId);

  let level = 1;

  const visited = new Set();

  for (
    let i = 0;
    i < CTOR_SPLIT.length;
    i++
  ) {

    if (
      !current ||
      visited.has(current.userId)
    ) {

      break;
    }

    visited.add(current.userId);

    let parent =
      getIntroducer(current);

    if (
      !parent ||
      visited.has(parent.userId)
    ) {

      break;
    }

    let amount = calc(
      totalCTOR,
      CTOR_SPLIT[i]
    );

    if (amount > 0) {

      safeIncome({
        userId:
          isCTORQualified(parent)
            ? parent.userId
            : "SYSTEM",

        type: "ctor",

        amount,

        sourceUser: userId,

        note:
          isCTORQualified(parent)
            ? `${type.toUpperCase()} CTOR LEVEL ${level}`
            : `MISS CTOR L${level}`
      });
    }

    current = parent;

    level++;
  }

  return true;
}

// ================= UGLI =================
function processUpgradeIncome(
  userId,
  bv
) {

  if (
    typeof updateUserPoints ===
    "function"
  ) {

    updateUserPoints(
      userId,
      bv,
      false
    );
  }

  let current = getUser(userId);

  if (!current) {
    return false;
  }

  let level = 1;

  let visited = new Set([
    userId
  ]);

  while (
    level <=
    INCOME_CONFIG.MAX_LEVELS
  ) {

    let parent =
      getIntroducer(current);

    if (
      !parent ||
      visited.has(parent.userId)
    ) {

      break;
    }

    visited.add(parent.userId);

    let percent =
      level === 1
        ? INCOME_CONFIG.UGLI_LEVEL_1
        : INCOME_CONFIG.UGLI_LEVEL_OTHERS;

    let income =
      calc(bv, percent);

    if (income > 0) {

      safeIncome({
        userId: parent.userId,

        type: "upgrade",

        amount: income,

        sourceUser: userId,

        note: `LEVEL ${level}`
      });
    }

    current = parent;

    level++;
  }

  distributeCTOR(
    userId,
    calc(
      bv,
      INCOME_CONFIG.CTOR_PERCENT
    ),
    "upgrade"
  );

  return true;
}

// ================= REPURCHASE =================
function processRepurchaseIncome(
  userId,
  bv
) {

  if (
    typeof updateUserPoints ===
    "function"
  ) {

    updateUserPoints(
      userId,
      bv,
      false
    );
  }

  let current = getUser(userId);

  if (!current) {
    return false;
  }

  let usableBV =
    calc(bv, 50);

  let rliPool =
    calc(usableBV, 40);

  let ctorPool =
    calc(usableBV, 60);

  let perLevel =
    parseFloat(
      (
        rliPool /
        INCOME_CONFIG.MAX_LEVELS
      ).toFixed(2)
    );

  let level = 1;

  let visited = new Set([
    userId
  ]);

  while (
    level <=
    INCOME_CONFIG.MAX_LEVELS
  ) {

    let parent =
      getIntroducer(current);

    if (
      !parent ||
      visited.has(parent.userId)
    ) {

      break;
    }

    visited.add(parent.userId);

    if (perLevel > 0) {

      if (
        Number(
          parent.monthlyPoints || 0
        ) >= 1
      ) {

        safeIncome({
          userId:
            parent.userId,

          type:
            "repurchase",

          amount:
            perLevel,

          sourceUser:
            userId,

          note:
            `RLI LEVEL ${level}`
        });

      } else {

        if (
          typeof addHoldIncome ===
          "function"
        ) {

          addHoldIncome(
            parent.userId,
            perLevel,
            `RLI LEVEL ${level}`
          );
        }
      }
    }

    current = parent;

    level++;
  }

  distributeCTOR(
    userId,
    ctorPool,
    "repurchase"
  );

  return true;
}

// ================= MAIN =================
function processIncome(
  type,
  userId,
  bv,
  sourceId = ""
) {

  let execKey =
    `${type}_${userId}_${Number(bv)}_${sourceId}`;

  try {

    bv = Number(bv);

    if (
      !userId ||
      isNaN(bv) ||
      bv <= 0
    ) {

      return false;
    }

    if (
      !canRunIncome(type)
    ) {

      return false;
    }

    if (
      isTxUsed(execKey)
    ) {

      return false;
    }

    if (
      isIncomeLocked(execKey)
    ) {

      return false;
    }

    setIncomeLock(
      execKey,
      true
    );

    markTxUsed(execKey);

    if (
      type === "upgrade"
    ) {

      return processUpgradeIncome(
        userId,
        bv
      );
    }

    if (
      type ===
      "repurchase"
    ) {

      return processRepurchaseIncome(
        userId,
        bv
      );
    }

    console.warn(
      "Unknown income type:",
      type
    );

    return false;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      logCritical(
        "processIncome error: " +
        err.message
      );
    }

    return false;

  } finally {

    setIncomeLock(
      execKey,
      false
    );
  }
}
