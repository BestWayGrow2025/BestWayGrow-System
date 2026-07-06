"use strict";
/*
RANK MASTER VIEW V1.0
✔ Read-only dashboard renderer ✔ Uses rank_master.js only ✔ No rank modification ✔ No business logic ✔ No qualification logic ✔ Dashboard safe ✔ Router compatible
*/
(function () {
if (window.RANK_MASTER_VIEW) { return; }
window.RANK_MASTER_VIEW = true;
function initRankMasterView() {
try {

  if (
    typeof getAllRanks !== "function" ||
    typeof getHighestRank !== "function"
  ) {

   console.error(
  "[RANK MASTER VIEW] core_rank_master_registry.js missing"
);

    return;
  }

  renderSummary();
  renderRankTable();

  console.log(
    "[RANK MASTER VIEW] READY"
  );

} catch (err) {

  console.error(
    "[RANK MASTER VIEW ERROR]",
    err
  );
}

}
function renderSummary() {
const ranks =
  getAllRanks() || [];

const highest =
  getHighestRank();

const ctorCount =
  ranks.filter(function (rank) {
    return rank.ctorEligible === true;
  }).length;

const totalRanksEl =
  document.getElementById(
    "totalRanks"
  );

const highestRankEl =
  document.getElementById(
    "highestRank"
  );

const ctorRanksEl =
  document.getElementById(
    "ctorRanks"
  );

if (totalRanksEl) {
  totalRanksEl.textContent =
    ranks.length;
}

if (highestRankEl) {
  highestRankEl.textContent =
    highest
      ? highest.name
      : "-";
}

if (ctorRanksEl) {
  ctorRanksEl.textContent =
    ctorCount;
}

}
function renderRankTable() {
const tbody =
  document.getElementById(
    "rankTableBody"
  );

if (!tbody) {
  return;
}

const ranks =
  getAllRanks() || [];

if (!ranks.length) {

  tbody.innerHTML = `
    <tr>
      <td colspan="8">
        No Rank Data Found
      </td>
    </tr>
  `;

  return;
}

tbody.innerHTML = "";

ranks.forEach(function (rank) {

  const row =
    document.createElement("tr");

  row.innerHTML = `
    <td>${rank.rankId}</td>
    <td>${rank.code}</td>
    <td>${rank.name}</td>
    <td>${rank.requiredBV}</td>
    <td>${rank.requiredDirects}</td>
    <td>${rank.requiredActiveLegs}</td>
    <td>
      ${rank.ctorEligible ? "YES" : "NO"}
    </td>
    <td>
      ${rank.active ? "ACTIVE" : "INACTIVE"}
    </td>
  `;

  tbody.appendChild(row);

});

}
if ( document.readyState === "loading" ) {
document.addEventListener(
  "DOMContentLoaded",
  initRankMasterView
);

} else {
initRankMasterView();

}
window.initRankMasterView = initRankMasterView;
})();


