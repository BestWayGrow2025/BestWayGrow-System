"use strict";

/*
========================================
USER DASHBOARD FINAL V9.0 BOOT VERSION
========================================
✔ Boot Architecture V2 compatible
✔ Unified session authentication
✔ Route guard integration
✔ Strict user-only access
✔ Safe logout
✔ Tree counting
✔ PIN request integration
✔ Direct team viewer
✔ Referral link copy
✔ Production READY
========================================
*/

let currentUser = null;

/* ================= MODULE REGISTRATION ================= */

BOOT.register("user_dashboard", function () {
  initPage();

  if (!authPage()) {
    window.location.href = "user_login.html";
    return;
  }

  bindEvents();
  loadHome();
});

/* ================= INIT ================= */

function initPage() {
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("❌ core_system.js missing");
    throw new Error("STOP");
  }
}

/* ================= AUTH ================= */

function authPage() {
  if (typeof requireAuth === "function") {
    const ok = requireAuth(["user"]);
    if (ok === false) return false;
  }

  const session =
    typeof getSession === "function"
      ? getSession()
      : null;

  if (!session || session.role !== "user") {
    return false;
  }

  currentUser =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : (
          typeof getUserById === "function"
            ? getUserById(session.userId)
            : null
        );

  if (!currentUser) {
    return false;
  }

  const status =
    currentUser.status ||
    currentUser.accountStatus ||
    "active";

  if (status !== "active") {
    logout();
    return false;
  }

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " +
      (currentUser.username || currentUser.userId) +
      " (" +
      currentUser.userId +
      ")";
  }

  return true;
}

/* ================= EVENTS ================= */

function bindEvents() {
  const logoutBtn =
    document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
}

/* ================= SAFE HELPERS ================= */

function getSafeUser() {
  return currentUser;
}

function getAllUsers() {
  return typeof getUsers === "function"
    ? getUsers()
    : [];
}

/* ================= TREE COUNT ================= */

function countTree(userId, users) {
  const user =
    users.find(function (u) {
      return u.userId === userId;
    });

  if (!user) {
    return { left: 0, right: 0, total: 0 };
  }

  function traverse(id) {
    if (!id) return 0;

    const node =
      users.find(function (u) {
        return u.userId === id;
      });

    if (!node) return 0;

    return (
      1 +
      traverse(node.leftChild) +
      traverse(node.rightChild)
    );
  }

  const left = traverse(user.leftChild);
  const right = traverse(user.rightChild);

  return {
    left: left,
    right: right,
    total: left + right
  };
}

/* ================= HOME ================= */

function loadHome() {
  const user = getSafeUser();
  if (!user) return;

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  const users = getAllUsers();
  const tree = countTree(user.userId, users);

  const refLink =
    typeof generateReferralLink === "function"
      ? generateReferralLink(user.userId)
      : "";

  main.innerHTML = `
    <div class="section-title">Dashboard Overview</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId}</p>
      <p><b>Name:</b> ${user.fullName || user.username || "-"}</p>
      <p><b>Sponsor:</b> ${user.sponsorId || "-"}</p>
    </div>

    <div class="info-box">
      <p><b>Wallet:</b> ₹${Number(user.wallet?.balance || 0)}</p>
      <p><b>Income:</b> ₹${Number(user.wallet?.incomeBalance || 0)}</p>
    </div>

    <div class="info-box">
      <p><b>Total Team:</b> ${tree.total}</p>
      <p><b>Left:</b> ${tree.left}</p>
      <p><b>Right:</b> ${tree.right}</p>
    </div>

    <div class="section-title">Referral</div>
    <input id="referralLinkBox" value="${refLink}" readonly>
    <button onclick="copyReferralLink()">Copy</button>
  `;
}

/* ================= PIN SECTION ================= */

function loadPinSection() {
  const user = getSafeUser();
  if (!user) return;

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  main.innerHTML = `
    <h3>PIN Request</h3>

    <input id="pinAmount" placeholder="Amount">
    <input id="pinPaymentId" placeholder="Payment Ref">

    <button onclick="requestPin()">Request PIN</button>
  `;
}

/* ================= REQUEST PIN ================= */

function requestPin() {
  const user = getSafeUser();
  if (!user) return;

  const amount =
    Number(document.getElementById("pinAmount").value);

  const paymentId =
    document.getElementById("pinPaymentId").value.trim();

  try {
    if (typeof executePinFlow !== "function") {
      throw new Error("Flow engine missing");
    }

    executePinFlow("REQUEST_PIN", {
      type: "upgrade",
      amount: amount,
      paymentId: paymentId
    });

    alert("PIN Request Submitted");
  } catch (err) {
    alert(err.message);
  }
}

/* ================= DIRECT TEAM ================= */

function loadDirectTeam() {
  const user = getSafeUser();
  if (!user) return;

  const main =
    document.getElementById("mainContent");

  if (!main) return;

  const users = getAllUsers();

  const list =
    users.filter(function (u) {
      return u.introducerId === user.userId;
    });

  let html =
    `<h3>Direct Team</h3>
     <table>
       <tr>
         <th>ID</th>
         <th>Name</th>
       </tr>`;

  list.forEach(function (u) {
    html += `
      <tr>
        <td>${u.userId}</td>
        <td>${u.username || "-"}</td>
      </tr>
    `;
  });

  html += `</table>`;

  main.innerHTML = html;
}

/* ================= REFERRAL COPY ================= */

function copyReferralLink() {
  const box =
    document.getElementById("referralLinkBox");

  if (!box) return;

  navigator.clipboard
    .writeText(box.value)
    .then(function () {
      alert("Copied");
    });
}

/* ================= LOGOUT ================= */

function logout() {
  if (typeof logoutSession === "function") {
    logoutSession();
    return;
  }

  if (typeof destroySession === "function") {
    destroySession();
  }

  window.location.replace("user_login.html");
}

/* ================= EXPORT ================= */

window.loadHome = loadHome;
window.loadPinSection = loadPinSection;
window.loadDirectTeam = loadDirectTeam;
window.copyReferralLink = copyReferralLink;
window.requestPin = requestPin;
window.logout = logout;

/* ================= START MODULE ================= */

BOOT.start("user_dashboard");
