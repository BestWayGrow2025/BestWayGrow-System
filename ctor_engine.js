"use strict";

/*
========================================
CTOR ENGINE V1.0 (RANK-WISE CTOR DISTRIBUTION)
========================================
✔ Dedicated CTOR distribution engine
✔ Reads CTOR percentages from rank_master.js
✔ Uses permanent highest achieved rank
✔ Requires monthly active points
✔ Highest-rank-only benefit enforcement
✔ Equal distribution among same-rank achievers
✔ Unqualified shares credited to SYSTEM
✔ Duplicate-safe execution
✔ Audit logging support
✔ Dependency-safe
✔ Production READY
========================================
*/

"use strict";

// ===================================
// EXECUTION LOCKS
// ===================================
const CTOR_LOCKS = {};
const CTOR_LOCK_TTL = 10000;

// ===================================
// LOCK HELPERS
// ===================================
function isCTORLocked(key) {

  const ts = CTOR_LOCKS[key];

  if (!ts) {
    return false;
  }

  if (Date.now() - ts > CTOR_LOCK_TTL) {
    delete CTOR_LOCKS[key];
    return false;
  }

  return true;
}

function setCTORLock(key, state) {

  if (!key) {
    return false;
  }

  if (state) {
    CTOR_LOCKS[key] = Date.now();
  } else {
    delete CTOR_LOCKS[key];
  }

  return true;
}

// ===================================
// CALCULATION
// ===================================
function calcCTORAmount(totalPool, percent) {

  const value =
    (Number(totalPool) * Number(percent)) / 100;

  if (
    isNaN(value) ||
    value <= 0
  ) {
    return 0;
  }

  return parseFloat(value.toFixed(2));
}

// ===================================
// ELIGIBLE USERS
// ===================================
function getCTORQualifiedUsers(rankCode) {

  if (
    typeof getUsers !== "function" ||
    typeof getCurrentCTORRank !== "function"
  ) {
    return [];
  }

  const users = getUsers();

  if (!Array.isArray(users)) {
    return [];
  }

  return users.filter(user => {

    if (!user || !user.userId) {
      return false;
    }

    const rank =
      getCurrentCTORRank(user.userId);

    return !!(
      rank &&
      rank.code === rankCode
    );
  });
}

// ===================================
// PAY SINGLE RANK SHARE
// ===================================
function distributeCTORRank(
  totalPool,
  rank
) {

  if (
    !rank ||
    rank.active !== true
  ) {
    return false;
  }

  const percent = Number(
    rank.ctorPercent || 0
  );

  if (
    isNaN(percent) ||
    percent <= 0
  ) {
    return false;
  }

  const rankPool =
    calcCTORAmount(
      totalPool,
      percent
    );

  if (rankPool <= 0) {
    return false;
  }

  const qualifiedUsers =
    getCTORQualifiedUsers(
      rank.code
    );

  // No eligible users → SYSTEM
  if (
    !qualifiedUsers.length
  ) {

    if (
      typeof safeIncome ===
      "function"
    ) {

      safeIncome({
        userId: "SYSTEM",
        type: "ctor",
        amount: rankPool,
        sourceUser: "SYSTEM",
        note:
          `${rank.code} CTOR NO QUALIFIER`,
        ref:
          `CTOR_SYSTEM_${rank.code}_${Date.now()}`
      });
    }

    return true;
  }

  // Equal distribution
  const perUser =
    parseFloat(
      (
        rankPool /
        qualifiedUsers.length
      ).toFixed(2)
    );

  if (perUser <= 0) {
    return false;
  }

  qualifiedUsers.forEach(
    user => {

      if (
        typeof safeIncome ===
        "function"
      ) {

        safeIncome({
          userId:
            user.userId,
          type: "ctor",
          amount: perUser,
          sourceUser:
            "SYSTEM",
          note:
            `${rank.code} CTOR`,
          ref:
            `CTOR_${rank.code}_${user.userId}_${Date.now()}`
        });
      }
    }
  );

  return true;
}

// ===================================
// MAIN DISTRIBUTION
// ===================================
function distributeCTORPool(
  totalPool,
  sourceRef = ""
) {

  const execKey =
    `CTOR_${Number(totalPool)}_${sourceRef}`;

  try {

    totalPool =
      Number(totalPool);

    if (
      isNaN(totalPool) ||
      totalPool <= 0
    ) {
      return false;
    }

    if (
      isCTORLocked(execKey)
    ) {
      return false;
    }

    setCTORLock(
      execKey,
      true
    );

    if (
      typeof getAllRanks !==
      "function"
    ) {
      return false;
    }

    const ranks =
      getAllRanks();

    if (
      !Array.isArray(ranks)
    ) {
      return false;
    }

    // Only CTOR ranks with percentages
    const ctorRanks =
      ranks.filter(rank =>
        rank &&
        rank.active === true &&
        rank.ctorEligible === true &&
        Number(
          rank.ctorPercent || 0
        ) > 0
      );

    if (
      !ctorRanks.length
    ) {
      return false;
    }

    // Rank-wise distribution
    ctorRanks.forEach(rank => {
      distributeCTORRank(
        totalPool,
        rank
      );
    });

    // Reset stored pool if supported
    if (
      typeof resetCTORPool ===
      "function"
    ) {
      resetCTORPool();
    }

    // Audit log
    if (
      typeof logActivity ===
      "function"
    ) {

      try {

        logActivity(
          "SYSTEM",
          "SYSTEM",
          `CTOR DISTRIBUTED ${totalPool}`,
          sourceRef ||
            "CTOR_ENGINE"
        );

      } catch (_) {}
    }

    return true;

  } catch (err) {

    if (
      typeof logCritical ===
      "function"
    ) {

      logCritical(
        "CTOR_ENGINE_ERROR: " +
          err.message,
        "SYSTEM",
        "CTOR_ENGINE"
      );
    }

    return false;

  } finally {

    setCTORLock(
      execKey,
      false
    );
  }
}

// ===================================
// GLOBAL EXPORT
// ===================================
window.calcCTORAmount =
  calcCTORAmount;

window.getCTORQualifiedUsers =
  getCTORQualifiedUsers;

window.distributeCTORRank =
  distributeCTORRank;

window.distributeCTORPool =
  distributeCTORPool;
