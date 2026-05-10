/*
========================================
RANK MASTER V1.0 (AUTHORITATIVE SOURCE)
========================================
✔ Single source of truth for all ranks
✔ Qualification definitions
✔ CTOR eligibility support
✔ Rank promotion support
✔ Dashboard display support
✔ Read-only master data
✔ Dependency-safe
✔ Production READY
========================================
*/

"use strict";

// ===================================
// RANK DEFINITIONS (11 TOTAL RANKS)
// ===================================
// IMPORTANT:
// - This file stores only rank definitions.
// - No income calculations are stored here.
// - UGLI, RLI and CTOR percentages remain in income_engine.js.
// - CTOR eligibility starts from SILVER.
// ===================================
const RANK_MASTER = [
  {
    rankId: 0,
    code: "MEMBER",
    name: "Member",
    requiredBV: 0,
    requiredDirects: 0,
    requiredActiveLegs: 0,
    ctorEligible: false,
    active: true
  },
  {
    rankId: 1,
    code: "STAR",
    name: "Star",
    requiredBV: 100,
    requiredDirects: 2,
    requiredActiveLegs: 2,
    ctorEligible: false,
    active: true
  },
  {
    rankId: 2,
    code: "SILVER",
    name: "Silver",
    requiredBV: 500,
    requiredDirects: 4,
    requiredActiveLegs: 4,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 3,
    code: "GOLD",
    name: "Gold",
    requiredBV: 2000,
    requiredDirects: 6,
    requiredActiveLegs: 6,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 4,
    code: "RUBY",
    name: "Ruby",
    requiredBV: 5000,
    requiredDirects: 8,
    requiredActiveLegs: 8,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 5,
    code: "DIAMOND",
    name: "Diamond",
    requiredBV: 10000,
    requiredDirects: 10,
    requiredActiveLegs: 10,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 6,
    code: "CROWN_DIAMOND",
    name: "Crown Diamond",
    requiredBV: 25000,
    requiredDirects: 12,
    requiredActiveLegs: 12,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 7,
    code: "PRESIDENT",
    name: "President",
    requiredBV: 50000,
    requiredDirects: 15,
    requiredActiveLegs: 15,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 8,
    code: "ROYAL_PRESIDENT",
    name: "Royal President",
    requiredBV: 100000,
    requiredDirects: 20,
    requiredActiveLegs: 20,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 9,
    code: "GLOBAL_PRESIDENT",
    name: "Global President",
    requiredBV: 250000,
    requiredDirects: 25,
    requiredActiveLegs: 25,
    ctorEligible: true,
    active: true
  },
  {
    rankId: 10,
    code: "KOHINOOR",
    name: "Kohinoor",
    requiredBV: 500000,
    requiredDirects: 30,
    requiredActiveLegs: 30,
    ctorEligible: true,
    active: true
  }
];

// ===================================
// HELPERS
// ===================================
function getAllRanks() {
  return RANK_MASTER
    .filter(rank => rank.active === true)
    .map(rank => ({ ...rank }));
}

function getRankById(rankId) {
  return RANK_MASTER.find(
    rank => Number(rank.rankId) === Number(rankId)
  ) || null;
}

function getRankByCode(code) {
  const normalized = String(code || "")
    .trim()
    .toUpperCase();

  return RANK_MASTER.find(
    rank => rank.code === normalized
  ) || null;
}

function getHighestRank() {
  const activeRanks = getAllRanks();

  if (!activeRanks.length) {
    return null;
  }

  return activeRanks[activeRanks.length - 1];
}

function isCTORRank(rankIdOrCode) {
  let rank = null;

  if (typeof rankIdOrCode === "number") {
    rank = getRankById(rankIdOrCode);
  } else {
    rank = getRankByCode(rankIdOrCode);
  }

  return !!(
    rank &&
    rank.active === true &&
    rank.ctorEligible === true
  );
}

// ===================================
// SAFE GLOBAL EXPORT
// ===================================
window.RANK_MASTER = RANK_MASTER;
window.getAllRanks = getAllRanks;
window.getRankById = getRankById;
window.getRankByCode = getRankByCode;
window.getHighestRank = getHighestRank;
window.isCTORRank = isCTORRank;

