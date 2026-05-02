/*
========================================
RANK & REWARD SYSTEM (V1)
========================================
✔ Rank calculation
✔ Team-based progression
✔ Simple reward unlock logic
✔ Safe user integration
========================================
*/

// ================= SAFE USER =================
function getSafeUser() {
  const user = getCurrentUser();

  if (!user) {
    document.getElementById("mainContent").innerHTML =
      "<div class='info-box'>Login Required</div>";
    return null;
  }

  return user;
}

// ================= CALCULATE RANK =================
function calculateRank(totalTeam) {
  if (totalTeam >= 1000) return "DIAMOND";
  if (totalTeam >= 500) return "PLATINUM";
  if (totalTeam >= 200) return "GOLD";
  if (totalTeam >= 50) return "SILVER";
  if (totalTeam >= 10) return "BRONZE";
  return "STARTER";
}

// ================= LOAD RANK SECTION =================
function loadRankReward() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const users = typeof getUsers === "function" ? getUsers() : [];

  // count total team using tree_system (safe fallback)
  let totalTeam = 0;

  if (typeof countTree === "function") {
    const tree = countTree(user.userId, users);
    totalTeam = tree.total || 0;
  }

  const rank = calculateRank(totalTeam);

  main.innerHTML = `
    <div class="section-title">Rank & Reward</div>

    <div class="info-box">
      <p><b>Current Rank:</b> ${rank}</p>
      <p><b>Total Team:</b> ${totalTeam}</p>
    </div>

    <div class="info-box">
      <p><b>Next Rank Requirements:</b></p>
      <p>• BRONZE → 10 members</p>
      <p>• SILVER → 50 members</p>
      <p>• GOLD → 200 members</p>
      <p>• PLATINUM → 500 members</p>
      <p>• DIAMOND → 1000 members</p>
    </div>
  `;
}

// ================= EXPORT =================
window.loadRankReward = loadRankReward;

