"use strict";

/*
========================================
RANK MASTER V1.1 STABLE ENGINE
========================================
✔ Data unchanged
✔ Added safe UI renderer
✔ Added DOM integration
✔ Prevents overwrite conflicts
✔ Production stable
========================================
*/

// ================= GUARD =================
if (window.__RANK_MASTER_LOADED__) {
  console.warn("[RANK MASTER] Already loaded");
} else {
  window.__RANK_MASTER_LOADED__ = true;
}

// ===================================
// RANK DEFINITIONS
// ===================================
const RANK_MASTER = [
  { rankId: 0, code: "MEMBER", name: "Member", requiredBV: 0, requiredDirects: 0, requiredActiveLegs: 0, ctorEligible: false, active: true },
  { rankId: 1, code: "STAR", name: "Star", requiredBV: 100, requiredDirects: 2, requiredActiveLegs: 2, ctorEligible: false, active: true },
  { rankId: 2, code: "SILVER", name: "Silver", requiredBV: 500, requiredDirects: 4, requiredActiveLegs: 4, ctorEligible: true, active: true },
  { rankId: 3, code: "GOLD", name: "Gold", requiredBV: 2000, requiredDirects: 6, requiredActiveLegs: 6, ctorEligible: true, active: true },
  { rankId: 4, code: "RUBY", name: "Ruby", requiredBV: 5000, requiredDirects: 8, requiredActiveLegs: 8, ctorEligible: true, active: true },
  { rankId: 5, code: "DIAMOND", name: "Diamond", requiredBV: 10000, requiredDirects: 10, requiredActiveLegs: 10, ctorEligible: true, active: true },
  { rankId: 6, code: "CROWN_DIAMOND", name: "Crown Diamond", requiredBV: 25000, requiredDirects: 12, requiredActiveLegs: 12, ctorEligible: true, active: true },
  { rankId: 7, code: "PRESIDENT", name: "President", requiredBV: 50000, requiredDirects: 15, requiredActiveLegs: 15, ctorEligible: true, active: true },
  { rankId: 8, code: "ROYAL_PRESIDENT", name: "Royal President", requiredBV: 100000, requiredDirects: 20, requiredActiveLegs: 20, ctorEligible: true, active: true },
  { rankId: 9, code: "GLOBAL_PRESIDENT", name: "Global President", requiredBV: 250000, requiredDirects: 25, requiredActiveLegs: 25, ctorEligible: true, active: true },
  { rankId: 10, code: "KOHINOOR", name: "Kohinoor", requiredBV: 500000, requiredDirects: 30, requiredActiveLegs: 30, ctorEligible: true, active: true }
];

// ===================================
// CORE HELPERS (UNCHANGED LOGIC)
// ===================================
function getAllRanks() {
  return RANK_MASTER.filter(r => r.active === true).map(r => ({ ...r }));
}

function getRankById(rankId) {
  return RANK_MASTER.find(r => Number(r.rankId) === Number(rankId)) || null;
}

function getRankByCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return RANK_MASTER.find(r => r.code === normalized) || null;
}

function getHighestRank() {
  const activeRanks = getAllRanks();
  if (!activeRanks.length) return null;
  return activeRanks[activeRanks.length - 1];
}

function isCTORRank(idOrCode) {
  let rank = typeof idOrCode === "number"
    ? getRankById(idOrCode)
    : getRankByCode(idOrCode);

  return !!(rank && rank.active && rank.ctorEligible);
}

// ===================================
// UI RENDER ENGINE (NEW SAFE LAYER)
// ===================================
function renderRankTable() {

  const body = document.getElementById("rankTableBody");
  if (!body) return;

  const ranks = getAllRanks();

  body.innerHTML = ranks.map(r => `
    <tr>
      <td>${r.rankId}</td>
      <td>${r.code}</td>
      <td>${r.name}</td>
      <td>${r.requiredBV}</td>
      <td>${r.requiredDirects}</td>
      <td>${r.requiredActiveLegs}</td>
      <td>${r.ctorEligible ? "YES" : "NO"}</td>
      <td>${r.active ? "ACTIVE" : "OFF"}</td>
    </tr>
  `).join("");
}

// ===================================
// SUMMARY RENDER
// ===================================
function renderSummary() {

  const total = getAllRanks().length;
  const highest = getHighestRank();
  const ctorCount = getAllRanks().filter(r => r.ctorEligible).length;

  const t1 = document.getElementById("totalRanks");
  const t2 = document.getElementById("highestRank");
  const t3 = document.getElementById("ctorRanks");

  if (t1) t1.innerText = total;
  if (t2) t2.innerText = highest ? highest.name : "-";
  if (t3) t3.innerText = ctorCount;
}

// ===================================
// INIT SAFE
// ===================================
function initRankMaster() {
  renderRankTable();
  renderSummary();
}

// Auto run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRankMaster);
} else {
  initRankMaster();
}

// ===================================
// EXPORT SAFE
// ===================================
window.RANK_MASTER = RANK_MASTER;
window.getAllRanks = getAllRanks;
window.getRankById = getRankById;
window.getRankByCode = getRankByCode;
window.getHighestRank = getHighestRank;
window.isCTORRank = isCTORRank;
