/*
========================================
USER REGISTER v5.0 (FINAL PRODUCTION LIFECYCLE)
========================================
✔ Queue-only registration flow
✔ Live post-submit status watcher
✔ Real user ID → real referral link
✔ GitHub Pages repo path safe link
✔ Fast open referral link button
✔ Centralized validation authority
✔ Centralized duplicate protection
✔ Queue-safe submit
✔ Upgrade workflow activation
✔ Repurchase workflow activation
✔ Income lifecycle activation
✔ CTOR lifecycle activation
========================================
*/

let registrationSubmitLock = false;
let registrationIntroducerId = "";
let statusWatcher = null;

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
});

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("open-link-btn")) {
    const link = e.target.getAttribute("data-link") || "";
    if (link) {
      window.open(link, "_blank");
    }
  }
});

function initPage() {
  // Core boot is handled by:
  // core_boot_manager.js
  // core_initializer.js
}

function authPage() {
  const params = new URLSearchParams(window.location.search);

  registrationIntroducerId =
    String(params.get("ref") || "")
      .trim();
}
Reason: URL ref is input only. It must not automatically become trusted identity.
3. loadPage()

function bindEvents() {
  const btn = document.getElementById("registerBtn");
  if (btn) {
    btn.addEventListener("click", registerUser);
  }
}

function loadPage() {
  const introLabel =
    document.getElementById("introLabel");

  const formArea =
    document.getElementById("formArea");

  if (
    !registrationIntroducerId ||
    typeof getUserById !== "function"
  ) {
    if (introLabel) {
      introLabel.innerText =
        "Invalid Referral Link";
    }

    if (formArea) {
      formArea.style.display = "none";
    }

    return;
  }

  const intro =
    getUserById(registrationIntroducerId);

  if (!intro) {
    if (introLabel) {
      introLabel.innerText =
        "Invalid Referral Link";
    }

    if (formArea) {
      formArea.style.display = "none";
    }

    return;
  }

  if (introLabel) {
    introLabel.innerText =
      "Introducer: " +
      registrationIntroducerId;
  }
}

// Password security is NOT implemented in the registration controller.
// The controller forwards the credential only to the designated
// authentication/password authority through the approved registration flow.

function generateShareLink(userId, position) {
  const origin = window.location.origin;
  const path = window.location.pathname
    .split("/")
    .slice(0, -1)
    .join("/");

 return `${origin}${path}/user_registration_dashboard.html?ref=${userId}&pos=${position}`;
}

function watchRegistrationStatus(
  mobile,
  position
) {
  if (statusWatcher) {
    clearInterval(statusWatcher);
  }

  const msg = document.getElementById("msg");
  let tries = 0;

  statusWatcher = setInterval(function () {
    tries++;

    const users =
      typeof getUsers === "function"
        ? getUsers()
        : [];

    const created = users.find(function (u) {
      return u.mobile === mobile;
    });

    // ================= SUCCESS =================
    if (created && created.userId) {
      clearInterval(statusWatcher);
      statusWatcher = null;

      const realLink =
        generateShareLink(created.userId, position);

      msg.innerHTML = `
        ✅ Registration Complete<br><br>

        <b>User ID:</b> ${created.userId}<br><br>

        <b>Share Link:</b><br>
        <input
          value="${realLink}"
          readonly
          style="width:100%"
        ><br><br>

        <button
          type="button"
          class="open-link-btn"
          data-link="${realLink}">
          Open Referral Link
        </button><br><br>

        <hr>

        <b>Account Lifecycle Activated:</b><br>
        ✔ Referral Link Ready<br>
        ✔ Upgrade Available in User Dashboard<br>
        ✔ Repurchase Available in User Dashboard<br>
        ✔ Income Generation Activated<br>
        ✔ CTOR Maintenance Lifecycle Started<br><br>

        Status: Completed
      `;

      return;
    }

    // ================= FAILURE =================
    const queue =
      typeof getRegQueue === "function"
        ? getRegQueue()
        : [];

    const pending = queue.find(function (q) {
      return q.mobile === mobile;
    });

    if (pending && pending.status === "FAILED") {
      clearInterval(statusWatcher);
      statusWatcher = null;

      msg.innerHTML = `
        ❌ Registration Failed<br><br>
        ${pending.error || "Unknown error"}
      `;

      return;
    }

// ================= TIMEOUT =================
if (tries >= 20) {
  clearInterval(statusWatcher);
  statusWatcher = null;

  msg.innerHTML = `
    ⏳ Registration Submitted<br><br>
    Status: Still processing...
  `;
}
  }, 1000);
}

function registerUser() {
  if (registrationSubmitLock) {
    return;
  }

  registrationSubmitLock = true;

  const msg = document.getElementById("msg");

  const username =
    document.getElementById("username")
      .value
      .trim();

  const email =
    document.getElementById("email")
      .value
      .trim();

  const mobile =
    document.getElementById("mobile")
      .value
      .trim();

  const password =
    document.getElementById("password")
      .value
      .trim();

 const positionInput =
  document.querySelector(
    'input[name="position"]:checked'
  );

const registrationPosition =
  positionInput
    ? positionInput.value
    : "";

// ================= VALIDATION AUTHORITY =================
if (
  typeof validateRegistration !==
  "function"
) {
  msg.innerText =
    "Registration validation authority not loaded";

  registrationSubmitLock = false;
  return;
}

const validation =
  validateRegistration({
    username: username,
    email: email,
    mobile: mobile,
    password: password,
    introducerId:
      registrationIntroducerId,
  position:
  registrationPosition
  });

if (!validation || !validation.valid) {
  msg.innerText =
    validation && validation.message
      ? validation.message
      : "Registration validation failed";

  registrationSubmitLock = false;
  return;
}

// Validation and duplicate protection are owned by
// core_registration_validation_authority.js.
// The controller must not independently inspect
// the user repository for registration validation.

// ================= QUEUE AUTHORITY =================
if (
  typeof addToRegistrationQueue !==
  "function"
) {
  msg.innerText =
    "Registration queue authority not loaded";

  registrationSubmitLock = false;
  return;
}

  // ================= QUEUE SUBMISSION =================
const added =
  addToRegistrationQueue({
    username: username,
    email: email,
    mobile: mobile,
    password: password,
    introducerId:
      registrationIntroducerId,
   position: registrationPosition,
    status: "PENDING"
  });

if (!added) {
  msg.innerText =
    "Registration could not be submitted to the queue";

  registrationSubmitLock = false;
  return;
}
  // ================= SUBMITTED MESSAGE =================
msg.innerHTML = `
  ✅ Registration Submitted<br><br>
  Status: Processing Queue...
`;
// ================= WATCH FINAL STATUS =================
watchRegistrationStatus(
  mobile,
  registrationPosition
);

registrationSubmitLock = false;
