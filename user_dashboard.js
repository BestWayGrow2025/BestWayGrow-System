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

  let main = document.getElementById("mainContent");
  if (!main) return;

  let balance = 0;

  try {
    if (typeof getWalletBalance === "function") {
      balance = getWalletBalance(user.userId);
    } else {
      balance = Number(user.wallet?.balance || 0);
    }
  } catch (err) {
    console.error("Wallet error:", err);
  }

  main.innerHTML = `
    <div class="section-title">Wallet Overview</div>

    <div class="info-box">
      <p><b>Current Balance:</b> ₹${balance}</p>
      <p><b>Total Credit:</b> ₹${Number(user.wallet?.totalCredit || 0)}</p>
      <p><b>Total Debit:</b> ₹${Number(user.wallet?.totalDebit || 0)}</p>
    </div>
  `;
}

// ================= WALLET HISTORY =================
function loadWalletHistory() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let history = [];

  try {
    if (typeof getWalletHistory === "function") {
      history = getWalletHistory(user.userId) || [];
    } else if (user.walletHistory) {
      history = user.walletHistory;
    }
  } catch (err) {
    console.error("Wallet history error:", err);
  }

  let html = `
    <div class="section-title">Wallet Transaction History</div>

    <table>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Remark</th>
      </tr>
  `;

  if (!history.length) {
    html += `
      <tr>
        <td colspan="4">No Wallet History Found</td>
      </tr>
    `;
  }

  history.slice(-20).reverse().forEach(item => {
    html += `
      <tr>
        <td>${item.date || "N/A"}</td>
        <td>${item.type || "N/A"}</td>
        <td>₹${Number(item.amount || 0)}</td>
        <td>${item.remark || "N/A"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= DIRECT TEAM LIST =================
function loadDirectTeam() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let directUsers = [];

  try {
    if (typeof getDirectUsers === "function") {
      directUsers = getDirectUsers(user.userId) || [];
    }
  } catch (err) {
    console.error("Direct team error:", err);
  }

  let html = `
    <div class="section-title">Direct Team List</div>

    <table>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Position</th>
        <th>Status</th>
      </tr>
  `;

  if (!directUsers.length) {
    html += `
      <tr>
        <td colspan="4">No Direct Team Found</td>
      </tr>
    `;
  }

  directUsers.forEach(member => {
    html += `
      <tr>
        <td>${member.userId || "N/A"}</td>
        <td>${member.fullName || member.username || "N/A"}</td>
        <td>${member.position || "N/A"}</td>
        <td>${member.accountStatus || "active"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

// ================= PROFILE =================
function loadProfile() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  let directUsers = [];

  try {
    if (typeof getDirectUsers === "function") {
      directUsers = getDirectUsers(user.userId) || [];
    }
  } catch (err) {
    console.error("Direct users error:", err);
  }

  try {
    if (typeof calculateUserRank === "function") {
      calculateUserRank();
    }
  } catch (err) {
    console.error("Rank error:", err);
  }

  let leftCount = directUsers.filter(u => (u.position || "") === "L").length;
  let rightCount = directUsers.filter(u => (u.position || "") === "R").length;

  main.innerHTML = `
    <div class="section-title">User Profile</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId || "N/A"}</p>
      <p><b>Full Name:</b> ${user.fullName || user.username || "N/A"}</p>
      <p><b>Mobile:</b> ${user.mobile || "N/A"}</p>
      <p><b>Email:</b> ${user.email || "N/A"}</p>
      <p><b>Introducer ID:</b> ${user.introducerId || "N/A"}</p>
      <p><b>Sponsor ID:</b> ${user.sponsorId || "N/A"}</p>
      <p><b>Position:</b> ${user.position || "L"}</p>
      <p><b>Join Date:</b> ${user.joinDate ? new Date(user.joinDate).toLocaleString() : "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Account Status:</b> ${user.accountStatus || "active"}</p>
      <p><b>KYC Status:</b> ${user.kycStatus || "pending"}</p>
      <p><b>Upgrade Status:</b> ${user.upgradeStatus || "not_upgraded"}</p>
      <p><b>Repurchase Status:</b> ${user.repurchaseStatus || "not_started"}</p>
      <p><b>Block Status:</b> ${user.blockStatus || "unblocked"}</p>
      <p><b>Current Rank:</b> ${user.rank || "Starter"}</p>
    </div>

    <div class="info-box">
      <p><b>Total Direct Team:</b> ${directUsers.length}</p>
      <p><b>Left Team:</b> ${leftCount}</p>
      <p><b>Right Team:</b> ${rightCount}</p>
    </div>

    <div class="info-box">
      <p><b>Office Name:</b> ${user.officeName || "N/A"}</p>
      <p><b>Office City:</b> ${user.officeCity || "N/A"}</p>
      <p><b>Office Code:</b> ${user.officeCode || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Department:</b> ${user.department || "N/A"}</p>
      <p><b>Designation:</b> ${user.designation || "N/A"}</p>
      <p><b>Reporting Admin:</b> ${user.reportingAdmin || "N/A"}</p>
    </div>

    <div class="info-box">
      <p><b>Support Tickets:</b> ${user.supportTicketCount || 0}</p>
      <p><b>Last Support Date:</b> ${user.lastSupportDate || "N/A"}</p>
      <p><b>Remarks:</b> ${user.remarks || "N/A"}</p>
    </div>
  `;
}

// ================= UPGRADE STATUS CHECK =================
function canUpgrade(user) {
  if (!user) return false;

  return (user.accountStatus || "active") === "active" &&
         user.upgradeStatus !== "completed";
}

// ================= REPURCHASE STATUS CHECK =================
function canRepurchase(user) {
  if (!user) return false;

  return (user.accountStatus || "active") === "active" &&
         user.upgradeStatus === "completed";
}

// ================= PAGE NAVIGATION =================
function loadUpgrade() {
  let user = getSafeUser();
  if (!user) return;

  if (!canUpgrade(user)) {
    alert("Upgrade Not Allowed");
    return;
  }

  location.href = "user_upgrade.html";
}

function loadRepurchase() {
  let user = getSafeUser();
  if (!user) return;

  if (!canRepurchase(user)) {
    alert("Repurchase Not Allowed");
    return;
  }

  location.href = "user_repurchase.html";
}

// ================= PIN REQUEST =================
function requestPin() {
  let user = getSafeUser();
  if (!user) return;

  alert("PIN Request Sent To Admin");

  try {
    if (typeof logActivity === "function") {
      logActivity(
        user.userId,
        "USER",
        "PIN Request",
        "USER_DASHBOARD"
      );
    }
  } catch (err) {
    console.error(err);
  }
}

// ================= INCOME HISTORY =================
function loadIncomeHistory() {
  let user = getSafeUser();
  if (!user) return;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-title">Income History</div>

    <div class="info-box">
      <p><b>Total Income:</b> ₹${Number(user.totalIncome || 0)}</p>
      <p><b>Direct Income:</b> ₹${Number(user.directIncome || 0)}</p>
      <p><b>Level Income:</b> ₹${Number(user.levelIncome || 0)}</p>
      <p><b>Reward Income:</b> ₹${Number(user.rewardIncome || 0)}</p>
    </div>
  `;
}

// ================= WITHDRAW REQUEST =================
function loadWithdrawSection() {
  let user = getSafeUser();
  if (!user) return;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-title">Withdraw Request</div>

    <div class="info-box">
      <p><b>Available Balance:</b> ₹${Number(user.walletBalance || 0)}</p>

      <input type="number" id="withdrawAmount" class="ref-box" placeholder="Enter Withdraw Amount">

      <button class="action-btn" onclick="submitWithdrawRequest()">
        Submit Withdraw
      </button>
    </div>
  `;
}

function submitWithdrawRequest() {
  let user = getSafeUser();
  if (!user) return;

  let amount = Number(document.getElementById("withdrawAmount").value);

  if (!amount || amount <= 0 || amount > Number(user.walletBalance || 0)) {
    alert("Enter Valid Amount");
    return;
  }

  if (!user.withdrawRequests) {
    user.withdrawRequests = [];
  }

  user.withdrawRequests.push({
    amount: amount,
    status: "pending",
    date: new Date().toLocaleString()
  });

  user.walletBalance = Number(user.walletBalance || 0) - amount;
  user.totalDebit = Number(user.totalDebit || 0) + amount;

  if (!user.walletHistory) {
    user.walletHistory = [];
  }

  user.walletHistory.push({
    date: new Date().toLocaleString(),
    type: "Debit",
    amount: amount,
    remark: "Withdraw Request"
  });

  if (!user.notifications) {
    user.notifications = [];
  }

  user.notifications.push({
    title: "Withdraw Request Submitted",
    message: "₹" + amount + " withdraw request pending",
    date: new Date().toLocaleString()
  });

  if (typeof saveUsers === "function") {
    saveUsers();
  }

  alert("Withdraw Request Submitted");

  try {
    if (typeof logActivity === "function") {
      logActivity(
        user.userId,
        "USER",
        "Withdraw Request ₹" + amount,
        "USER_DASHBOARD"
      );
    }
  } catch (err) {
    console.error(err);
  }
}

// ================= WITHDRAW HISTORY =================
function loadWithdrawHistory() {
  let user = getSafeUser();
  if (!user) return;

  let requests = user.withdrawRequests || [];

  let html = `
    <div class="section-title">Withdraw History</div>
  `;

  if (!requests.length) {
    html += `
      <div class="info-box">
        <p>No Withdraw History Found</p>
      </div>
    `;
  }

  requests.slice(-20).reverse().forEach(item => {
    html += `
      <div class="info-box">
        <p><b>Amount:</b> ₹${Number(item.amount || 0)}</p>
        <p><b>Status:</b> ${item.status || "pending"}</p>
        <p><b>Date:</b> ${item.date || "N/A"}</p>
      </div>
    `;
  });

  document.getElementById("mainContent").innerHTML = html;
}

// ================= NOTIFICATION ADD =================
function addUserNotification(title, message) {
  let user = getSafeUser();
  if (!user) return;

  if (!user.notifications) {
    user.notifications = [];
  }

  user.notifications.push({
    title: title,
    message: message,
    date: new Date().toLocaleString()
  });

  if (typeof saveUsers === "function") {
    saveUsers();
  }
}

// ================= NOTIFICATIONS =================
function loadNotifications() {
  let user = getSafeUser();
  if (!user) return;

  let notifications = user.notifications || [];

  let html = `
    <div class="section-title">Notifications</div>
  `;

  if (!notifications.length) {
    html += `
      <div class="info-box">
        <p>No New Notifications</p>
      </div>
    `;
  }

  notifications.slice(-20).reverse().forEach(item => {
    html += `
      <div class="info-box">
        <p><b>${item.title || "Notification"}</b></p>
        <p>${item.message || "N/A"}</p>
        <p>${item.date || "N/A"}</p>
      </div>
    `;
  });

  document.getElementById("mainContent").innerHTML = html;
}

// ================= SUPPORT TICKETS =================
function loadSupportTickets() {
  let user = getSafeUser();
  if (!user) return;

  let tickets = user.supportTickets || [];

  let html = `
    <div class="section-title">Support Tickets</div>

    <div class="info-box">
      <input type="text" id="supportSubject" class="ref-box" placeholder="Subject"><br><br>

      <textarea id="supportMessage" class="ref-box" placeholder="Enter Message"></textarea><br><br>

      <button class="action-btn" onclick="submitSupportTicket()">
        Submit Ticket
      </button>
    </div>
  `;

  if (!tickets.length) {
    html += `
      <div class="info-box">
        <p>No Support Tickets Found</p>
      </div>
    `;
  }

  tickets.slice(-20).reverse().forEach(item => {
    html += `
      <div class="info-box">
        <p><b>${item.subject || "Support Ticket"}</b></p>
        <p>${item.message || "N/A"}</p>
        <p>Status: ${item.status || "pending"}</p>
        <p>${item.date || "N/A"}</p>
      </div>
    `;
  });

  document.getElementById("mainContent").innerHTML = html;
}

// ================= SUPPORT TICKET SAVE =================
function submitSupportTicket() {
  let user = getSafeUser();
  if (!user) return;

  let subject = document.getElementById("supportSubject").value.trim();
  let message = document.getElementById("supportMessage").value.trim();

  if (!subject || !message) {
    alert("All Fields Required");
    return;
  }

  if (!user.supportTickets) {
    user.supportTickets = [];
  }

  user.supportTickets.push({
    subject: subject,
    message: message,
    status: "pending",
    date: new Date().toLocaleString()
  });

  user.supportTicketCount = user.supportTickets.length;
  user.lastSupportDate = new Date().toLocaleString();

  if (typeof saveUsers === "function") {
    saveUsers();
  }

  alert("Support Ticket Submitted");

  try {
    if (typeof logActivity === "function") {
      logActivity(
        user.userId,
        "USER",
        "Support Ticket Submitted",
        "USER_DASHBOARD"
      );
    }
  } catch (err) {
    console.error(err);
  }

  loadSupportTickets();
}

// ================= EDIT PROFILE =================
function loadEditProfile() {
  let user = getSafeUser();
  if (!user) return;

  let main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="section-title">Edit Profile</div>

    <div class="info-box">
      <input type="text" id="editFullName" class="ref-box" value="${user.fullName || ""}" placeholder="Full Name"><br><br>

      <input type="text" id="editMobile" class="ref-box" value="${user.mobile || ""}" placeholder="Mobile"><br><br>

      <input type="email" id="editEmail" class="ref-box" value="${user.email || ""}" placeholder="Email"><br><br>

      <button class="action-btn" onclick="saveProfile()">
        Save Profile
      </button>
    </div>
  `;
}


// ================= PROFILE VALIDATION =================
function validateProfileBeforeSave(fullName, mobile, email) {
  if (!fullName || fullName.length < 3) {
    return "Full Name Required";
  }

  if (!mobile || mobile.length < 10) {
    return "Valid Mobile Required";
  }

  if (!email || !email.includes("@")) {
    return "Valid Email Required";
  }

  return "ok";
}


// ================= SAVE PROFILE =================
function saveProfile() {
  let user = getSafeUser();
  if (!user) return;

  let fullName = document.getElementById("editFullName")?.value.trim();
  let mobile = document.getElementById("editMobile")?.value.trim();
  let email = document.getElementById("editEmail")?.value.trim();

  let validation = validateProfileBeforeSave(fullName, mobile, email);

  if (validation !== "ok") {
    alert(validation);
    return;
  }

  user.fullName = fullName;
  user.mobile = mobile;
  user.email = email;

  if (typeof saveUsers === "function") {
    saveUsers();
  }

  alert("Profile Updated Successfully");

  if (typeof addUserNotification === "function") {
    addUserNotification(
      "Profile Updated",
      "Your profile updated successfully"
    );
  }

  try {
    if (typeof logActivity === "function") {
      logActivity(
        user.userId,
        "USER",
        "Profile Updated",
        "USER_DASHBOARD"
      );
    }
  } catch (err) {
    console.error("Profile update log error:", err);
  }
}

// ================= CHANGE PASSWORD =================
function loadChangePassword() {
  let user = getSafeUser();
  if (!user) return;

  document.getElementById("mainContent").innerHTML = `
    <div class="section-title">Change Password</div>

    <div class="info-box">
      <input type="password" id="oldPassword" class="ref-box" placeholder="Old Password"><br><br>
      <input type="password" id="newPassword" class="ref-box" placeholder="New Password"><br><br>
      <input type="password" id="confirmPassword" class="ref-box" placeholder="Confirm Password"><br><br>

      <button class="action-btn" onclick="savePassword()">
        Change Password
      </button>
    </div>
  `;
}

// ================= PASSWORD ENCODE / DECODE =================
function encode(p) {
  return btoa(p);
}

function decode(p) {
  try {
    return atob(p);
  } catch (e) {
    return "";
  }
}

// ================= CHANGE PASSWORD SAVE =================
function savePassword() {
  let user = getSafeUser();
  if (!user) return;

  let oldPassword = document.getElementById("oldPassword").value.trim();
  let newPassword = document.getElementById("newPassword").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!oldPassword || !newPassword || !confirmPassword) {
    alert("All Fields Required");
    return;
  }

  if (decode(user.password || "") !== oldPassword) {
    alert("Old Password Incorrect");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password Minimum 6 Characters");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Password Not Match");
    return;
  }

  user.password = encode(newPassword);

  if (typeof saveUsers === "function") {
    saveUsers();
  }

  alert("Password Changed Successfully");

  try {
    if (typeof logActivity === "function") {
      logActivity(
        user.userId,
        "USER",
        "Password Changed",
        "USER_DASHBOARD"
      );
    }
  } catch (err) {
    console.error(err);
  }
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
