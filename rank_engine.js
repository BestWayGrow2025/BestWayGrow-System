/*
========================================
RANK ENGINE V1.0 (PERMANENT RANK STORAGE)
========================================
✔ Permanent highest rank storage
✔ Rank achieved once and retained forever
✔ No rank downgrade allowed
✔ Highest-rank-only benefit enforcement
✔ Promotion-safe update logic
✔ Qualification engine integration
✔ CTOR-ready helper functions
✔ Audit logging support
✔ Dependency-safe
✔ Production READY
========================================
*/

"use strict";

// ===================================
// SAFE USER ACCESS
// ===================================
function getRankUser(userId) {

  if (
    !userId ||
    typeof getUserById !== "function"
  ) {
    return null;
  }

  return getUserById(userId);
}

function saveRankUsers(users) {

  if (
    typeof saveUsers !== "function"
  ) {
    return false;
  }

  return saveUsers(users);
}

// ===================================
// RANK NORMALIZATION
// ===================================
function normalizeStoredRank(user) {

  if (
    !user ||
    typeof user !== "object"
  ) {
    return false;
  }

  let changed = false;

  if (
    typeof user.highestRankId !== "number" ||
    isNaN(user.highestRankId)
  ) {
    user.highestRankId = 0;
    changed = true;
  }

  if (
    !user.highestRankCode ||
    typeof user.highestRankCode !== "string"
  ) {

    const rank =
      typeof getRankById === "function"
        ? getRankById(
            user.highestRankId
          )
        : null;

    user.highestRankCode =
      rank?.code || "MEMBER";

    changed = true;
  }

  if (
    !user.rankAchievedDate
  ) {

    user.rankAchievedDate =
      new Date().toISOString();

    changed = true;
  }

  return changed;
}

// ===================================
// COMPARISON
// ===================================
function isRankHigher(
  newRank,
  oldRank
) {

  if (!newRank) {
    return false;
  }

  if (!oldRank) {
    return true;
  }

  return (
    Number(newRank.rankId) >
    Number(oldRank.rankId)
  );
}

// ===================================
// HELPERS
// ===================================
function getUserHighestRank(
  userId
) {

  const user =
    getRankUser(userId);

  if (!user) {
    return null;
  }

  normalizeStoredRank(user);

  if (
    typeof getRankById !==
    "function"
  ) {
    return null;
  }

  return getRankById(
    user.highestRankId
  );
}

function getUserHighestRankCode(
  userId
) {

  const rank =
    getUserHighestRank(userId);

  return rank
    ? rank.code
    : "MEMBER";
}

function getUserHighestRankId(
  userId
) {

  const rank =
    getUserHighestRank(userId);

  return rank
    ? Number(rank.rankId)
    : 0;
}

// ===================================
// UPDATE PERMANENT HIGHEST RANK
// ===================================
function updateUserHighestRank(
  userId
) {

  try {

    if (
      !userId ||
      typeof getUsers !==
        "function" ||
      typeof getQualifiedRank !==
        "function" ||
      typeof getRankById !==
        "function"
    ) {

      return false;
    }

    const users =
      getUsers();

    if (
      !Array.isArray(users)
    ) {
      return false;
    }

    const user =
      users.find(
        u =>
          u.userId ===
          userId
      );

    if (!user) {
      return false;
    }

    normalizeStoredRank(
      user
    );

    // Current permanently stored rank
    const currentRank =
      getRankById(
        user.highestRankId
      );

    // Newly qualified rank
    const qualifiedRank =
      getQualifiedRank(
        userId
      );

    if (
      !qualifiedRank
    ) {
      return false;
    }

    // Only upgrade if higher
    if (
      !isRankHigher(
        qualifiedRank,
        currentRank
      )
    ) {
      return true;
    }

    // Permanent promotion
    user.highestRankId =
      Number(
        qualifiedRank.rankId
      );

    user.highestRankCode =
      qualifiedRank.code;

    user.rankAchievedDate =
      new Date()
        .toISOString();

    const saved =
      saveRankUsers(
        users
      );

    if (!saved) {
      return false;
    }

    // Audit log
    if (
      typeof logActivity ===
      "function"
    ) {

      try {

        logActivity(
          userId,
          "SYSTEM",
          `RANK PROMOTED TO ${qualifiedRank.code}`,
          "RANK_ENGINE"
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
        "RANK_ENGINE_ERROR: " +
          err.message,
        userId ||
          "UNKNOWN",
        "RANK_ENGINE"
      );
    }

    return false;
  }
}

// ===================================
// CTOR ACTIVE BENEFIT RANK
// ===================================
function getCurrentCTORRank(
  userId
) {

  const user =
    getRankUser(userId);

  if (!user) {
    return null;
  }

  const highestRank =
    getUserHighestRank(
      userId
    );

  if (
    !highestRank
  ) {
    return null;
  }

  // Must be CTOR eligible rank
  if (
    typeof isCTORRank ===
      "function" &&
    !isCTORRank(
      highestRank.code
    )
  ) {
    return null;
  }

  // Must satisfy monthly active points
  if (
    Number(
      user.monthlyPoints ||
        0
    ) < 1
  ) {
    return null;
  }

  return highestRank;
}

// ===================================
// CHECK IF USER

