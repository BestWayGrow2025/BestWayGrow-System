"use strict";

/*
========================================
QUALIFICATION ENGINE V1.0 (RANK & CTOR ELIGIBILITY CORE)
========================================
✔ Permanent rank qualification
✔ Highest qualified rank detection
✔ Pre-launch SILVER offer support
✔ Monthly CTOR eligibility
✔ Highest-rank-only benefit enforcement
✔ Read-only business rule engine
✔ Dependency-safe
✔ Production READY
========================================
*/

"use strict";

// ===================================
// SYSTEM SETTINGS
// ===================================
function getQualificationSettings() {

  if (typeof getSystemSettings !== "function") {
    return {};
  }

  const settings = getSystemSettings();

  return (
    settings &&
    typeof settings === "object"
  ) ? settings : {};
}

// ===================================
// PRE-LAUNCH OFFER
// ===================================
function isPreLaunchOfferActive() {

  const settings = getQualificationSettings();

  if (settings.preLaunchOfferEnabled !== true) {
    return false;
  }

  const now = Date.now();

  const start = settings.preLaunchStartDate
    ? new Date(settings.preLaunchStartDate).getTime()
    : null;

  const end = settings.preLaunchEndDate
    ? new Date(settings.preLaunchEndDate).getTime()
    : null;

  if (start && now < start) {
    return false;
  }

  if (end && now > end) {
    return false;
  }

  return true;
}

function getApplicableSilverRequirement() {

  const settings = getQualificationSettings();

  if (isPreLaunchOfferActive()) {

    const offerCount = Number(
      settings.preLaunchSilverDirectRequirement
    );

    if (!isNaN(offerCount) && offerCount > 0) {
      return offerCount;
    }
  }

  const silver = getRankByCode("SILVER");

  return silver
    ? Number(silver.requiredCount || 10)
    : 10;
}

// ===================================
// USER HELPERS
// ===================================
function getQualificationUser(userId) {

  if (typeof getUserById !== "function") {
    return null;
  }

  return getUserById(userId);
}

function getDirectUsersSafe(userId) {

  if (typeof getDirectUsers === "function") {

    const users = getDirectUsers(userId);

    if (Array.isArray(users)) {
      return users;
    }
  }

  return [];
}

// ===================================
// COUNT QUALIFIED DIRECTS
// ===================================
function countQualifiedDirects(
  userId,
  requiredRankCode
) {

  const directs =
    getDirectUsersSafe(userId);

  let count = 0;

  directs.forEach(user => {

    if (!user) {
      return;
    }

    if (
      String(user.status || "")
        .toLowerCase() !== "active"
    ) {
      return;
    }

    const rank =
      getRankById(user.rankLevel);

    if (
      rank &&
      rank.code === requiredRankCode
    ) {
      count++;
    }
  });

  return count;
}

// ===================================
// CHECK SPECIFIC RANK
// ===================================
function checkRankQualification(
  userId,
  rankCode
) {

  const user =
    getQualificationUser(userId);

  if (!user) {
    return false;
  }

  const rank =
    getRankByCode(rankCode);

  if (
    !rank ||
    rank.active !== true
  ) {
    return false;
  }

  // MEMBER always qualifies
  if (rank.code === "MEMBER") {
    return true;
  }

  // SILVER special rule
  if (rank.code === "SILVER") {

    const required =
      getApplicableSilverRequirement();

    return (
      countQualifiedDirects(
        userId,
        "SILVER"
      ) >= required
    );
  }

  // All higher ranks:
  // 4 directs of previous rank
  const requiredCount =
    Number(rank.requiredCount || 0);

  const previousRankCode =
    String(rank.requiredRankCode || "")
      .trim()
      .toUpperCase();

  if (
    !previousRankCode ||
    requiredCount <= 0
  ) {
    return false;
  }

  return (
    countQualifiedDirects(
      userId,
      previousRankCode
    ) >= requiredCount
  );
}

// ===================================
// HIGHEST QUALIFIED RANK
// ===================================
function getHighestQualifiedRank(
  userId
) {

  const ranks =
    getAllRanks();

  let highest =
    getRankByCode("MEMBER");

  ranks.forEach(rank => {

    if (
      rank &&
      checkRankQualification(
        userId,
        rank.code
      )
    ) {
      highest = rank;
    }
  });

  return highest;
}

// ===================================
// MONTHLY ACTIVE CHECK
// ===================================
function isMonthlyActiveForCTOR(
  userId
) {

  const user =
    getQualificationUser(userId);

  if (!user) {
    return false;
  }

  return (
    Number(
      user.monthlyPoints || 0
    ) >= 1
  );
}

// ===================================
// CTOR ELIGIBILITY
// ===================================
function isUserCTORQualified(
  userId
) {

  const highest =
    getHighestQualifiedRank(userId);

  if (
    !highest ||
    highest.ctorEligible !== true
  ) {
    return false;
  }

  if (
    !isMonthlyActiveForCTOR(userId)
  ) {
    return false;
  }

  return true;
}

// ===================================
// CURRENT CTOR RANK
// ===================================
function getUserCurrentCTORRank(
  userId
) {

  if (
    !isUserCTORQualified(userId)
  ) {
    return null;
  }

  return getHighestQualifiedRank(
    userId
  );
}

// ===================================
// SAFE GLOBAL EXPORT
// ===================================
window.isPreLaunchOfferActive =
  isPreLaunchOfferActive;

window.getApplicableSilverRequirement =
  getApplicableSilverRequirement;

window.checkRankQualification =
  checkRankQualification;

window.getHighestQualifiedRank =
  getHighestQualifiedRank;

window.isMonthlyActiveForCTOR =
  isMonthlyActiveForCTOR;

window.isUserCTORQualified =
  isUserCTORQualified;

window.getUserCurrentCTORRank =
  getUserCurrentCTORRank;


