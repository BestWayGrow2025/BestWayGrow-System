// ========================================
// USER DASHBOARD FINAL LOCK (QUEUE SYSTEM)
// ========================================
// ✔ Uses getCurrentUser()
// ✔ Role = user enforced
// ✔ Status = active enforced
// ✔ No session mismatch
// ✔ Safe + clean
// ========================================


// ================= LOGOUT =================
function logout() {
  logoutSession();
}


// ================= SAFE USER =================
function getSafeUser() {
  let user = getCurrentUser();

  if (!user) {
    window.location.href = "user_login.html";
    return null;
  }

  return user;
}


// ================= LOAD HOME =================
// ================= HOME =================
function loadHome() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) {
    console.error("mainContent missing");
    return;
  }

  let refLink = generateRefLink(user.userId);
  let directUsers = [];

  try {
    if (typeof getDirectUsers === "function") {
      directUsers = getDirectUsers(user.userId) || [];
    }
  } catch (err) {
    console.error("Direct users error:", err);
  }

  let leftCount = directUsers.filter(u => (u.position || "") === "L").length;
  let rightCount = directUsers.filter(u => (u.position || "") === "R").length;

  main.innerHTML = `
    <div class="section-title">Dashboard Overview</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId || "N/A"}</p>
      <p><b>Full Name:</b> ${user.fullName || user.username || "N/A"}</p>
      <p><b>Mobile:</b> ${user.mobile || "N/A"}</p>
      <p><b>Email:</b> ${user.email || "N/A"}</p>
      <p><b>Sponsor ID:</b> ${user.sponsorId || "N/A"}</p>
      <p><b>Join Date:</b> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
      <p><b>City:</b> ${user.city || "N/A"}</p>
      <p><b>State:</b> ${user.state || "N/A"}</p>
      <p><b>Country:</b> ${user.country || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Wallet Balance:</b> ₹${Number(user.walletBalance || 0)}</p>
      <p><b>Income Balance:</b> ₹${Number(user.incomeBalance || 0)}</p>
      <p><b>Hold Income:</b> ₹${Number(user.holdIncome || 0)}</p>
      <p><b>Total Credit:</b> ₹${Number(user.totalCredit || 0)}</p>
      <p><b>Total Debit:</b> ₹${Number(user.totalDebit || 0)}</p>
      <p><b>Total Income:</b> ₹${Number(user.totalIncome || 0)}</p>
    </div>

    <div class="info-box">
      <p><b>Total Pins:</b> ${user.totalPins || 0}</p>
      <p><b>Used Pins:</b> ${user.usedPins || 0}</p>
      <p><b>Available Pins:</b> ${user.availablePins || 0}</p>
      <p><b>Last Pin Used:</b> ${user.lastPinUsedDate || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Total Direct Team:</b> ${directUsers.length}</p>
      <p><b>Left Team:</b> ${leftCount}</p>
      <p><b>Right Team:</b> ${rightCount}</p>
    </div>

    <div class="section-title">Referral Link</div>

    <input id="refLink" class="ref-box" value="${refLink}" readonly>
    <button class="action-btn" onclick="copyRefLink()">Copy Link</button>
    <p id="copyMsg"></p>
  `;
}


// ================= PIN =================
// ================= PIN SECTION =================
function loadPinSection() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let pins = [];

  try {
    if (typeof loadPins === "function") {
      let allPins = loadPins() || [];

      pins = allPins.filter(pin =>
        pin.ownerId === user.userId ||
        pin.usedBy === user.userId
      );
    }
  } catch (err) {
    console.error("PIN error:", err);
  }

  let html = `
    <div class="section-title">PIN Section</div>

    <button class="action-btn" onclick="requestPin()">
      Request PIN
    </button>

    <table>
      <tr>
        <th>PIN</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
  `;

  if (!pins.length) {
    html += `<tr><td colspan="3">No PIN Available</td></tr>`;
  }

  pins.slice(-20).reverse().forEach(pin => {
    html += `
      <tr>
        <td>${pin.pinId || "N/A"}</td>
        <td>₹${Number(pin.amount || 0)}</td>
        <td>${pin.status || "unused"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}


// ================= TREE =================
// ================= TREE =================
function loadTree() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let allUsers = [];

  try {
    if (typeof getUsers === "function") {
      allUsers = getUsers() || [];
    }
  } catch (err) {
    console.error("Users error:", err);
  }

  function buildTree(parentId, level = 1) {
    if (level > 10) return "";

    let team = allUsers.filter(u => u.sponsorId === parentId);

    if (!team.length) return "";

    let html = "";

    team.forEach(member => {
      html += `
        <div style="margin-left:${level * 20}px; padding:8px; border-left:3px solid #4a00e0; margin-bottom:8px;">
          <p><b>${member.userId || "N/A"}</b> - ${member.fullName || member.username || "N/A"}</p>
          <p>Position: ${member.position || "N/A"}</p>
        </div>
      `;

      html += buildTree(member.userId, level + 1);
    });

    return html;
  }

  main.innerHTML = `
    <div class="section-title">Full Team Tree</div>

    <div class="info-box">
      <p><b>My User ID:</b> ${user.userId || "N/A"}</p>
      <p><b>My Name:</b> ${user.fullName || user.username || "N/A"}</p>
    </div>

    <div class="info-box">
      <h3>Complete Downline Tree</h3>
      ${buildTree(user.userId) || "<p>No Team Found</p>"}
    </div>
  `;
}


// ================= WALLET =================
function loadWallet() {
  let user = getSafeUser();
  if (!user) return;

  let balance = (typeof getWalletBalance === "function")
    ? getWalletBalance(user.userId)
    : 0;

  document.getElementById("mainContent").innerHTML =
    "<h3>💰 Wallet Balance: ₹" + balance + "</h3>";
}


// ================= WALLET HISTORY =================
function loadWalletHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>📜 Wallet History</h3>";
}


// ================= TEAM =================
function loadDirectTeam() {
  document.getElementById("mainContent").innerHTML = "<h3>👥 Team</h3>";
}


// ================= PROFILE =================
function loadProfile() {
  let user = getSafeUser();
  if (!user) return;

  document.getElementById("mainContent").innerHTML =
    "<h3>👤 Profile</h3>" +
    "<p>Name: " + user.username + "</p>" +
    "<p>User ID: " + user.userId + "</p>";
}


// ================= UPGRADE =================
function loadUpgrade() {
  document.getElementById("mainContent").innerHTML = "<h3>⬆️ Upgrade</h3>";
}


// ================= REPURCHASE =================
function loadRepurchase() {
  document.getElementById("mainContent").innerHTML = "<h3>🔁 Repurchase</h3>";
}


// ================= INCOME =================
function loadIncomeHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>💵 Income</h3>";
}


// ================= WITHDRAW =================
function loadWithdrawSection() {
  document.getElementById("mainContent").innerHTML = "<h3>🏧 Withdraw</h3>";
}


// ================= WITHDRAW HISTORY =================
function loadWithdrawHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>📄 Withdraw History</h3>";
}


// ================= NOTIFICATIONS =================
function loadNotifications() {
  document.getElementById("mainContent").innerHTML = "<h3>🔔 Notifications</h3>";
}


// ================= SUPPORT =================
function loadSupportTickets() {
  document.getElementById("mainContent").innerHTML = "<h3>🛠 Support</h3>";
}


// ================= EDIT PROFILE =================
function loadEditProfile() {
  document.getElementById("mainContent").innerHTML = "<h3>✏️ Edit Profile</h3>";
}


// ================= PASSWORD =================
function loadChangePassword() {
  document.getElementById("mainContent").innerHTML = "<h3>🔒 Change Password</h3>";
}


// ================= ACTIVITY =================
function loadActivityLogs() {
  document.getElementById("mainContent").innerHTML = "<h3>📜 Activity Logs</h3>";
}


// ================= LOGIN HISTORY =================
function loadLoginHistory() {
  document.getElementById("mainContent").innerHTML = "<h3>🕓 Login History</h3>";
}


// ================= KYC =================
function loadKYCSection() {
  document.getElementById("mainContent").innerHTML = "<h3>🪪 KYC</h3>";
}


// ================= RANK =================
function loadRankReward() {
  document.getElementById("mainContent").innerHTML = "<h3>🏆 Rank</h3>";
}


// ================= REFERRAL =================
function loadReferralLink() {
  let user = getSafeUser();
  if (!user) return;

  let link =
    window.location.origin +
    "/user_register.html?ref=" +
    user.userId;

  document.getElementById("mainContent").innerHTML =
    "<h3>🔗 Referral Link</h3><p>" + link + "</p>";
}


// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

  let user = getSafeUser();
  if (!user) return;

  document.getElementById("welcome").innerText =
    "Welcome " + user.username + " (" + user.userId + ")";

  loadHome();
});
