/*
========================================
USER REGISTER v5.0 (FINAL PRODUCTION LIFECYCLE)
========================================
✔ Queue-only registration
✔ Live post-submit watcher
✔ Temporary ID → Real ID replacement
✔ Real referral link update
✔ GitHub Pages repo path safe link
✔ Fast open referral link button
✔ Duplicate mobile check
✔ Duplicate email check
✔ Queue-safe submit
✔ Upgrade workflow activation
✔ Repurchase workflow activation
✔ Income lifecycle activation
✔ CTOR lifecycle activation
========================================
*/

let lock = false;
let introducerId = "BWG000000";
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
  if (typeof initCoreSystem === "function") {
    initCoreSystem();
  } else {
    alert("core_system.js missing");
    throw new Error("STOP");
  }
}

function authPage() {
  const params = new URLSearchParams(window.location.search);
  introducerId = params.get("ref") || "BWG000000";
}

function bindEvents() {
  const btn = document.getElementById("registerBtn");
  if (btn) {
    btn.addEventListener("click", registerUser);
  }
}

function loadPage() {
  const intro =
    typeof getUserById === "function"
      ? getUserById(introducerId)
      : null;

  const introLabel = document.getElementById("introLabel");
  const formArea = document.getElementById("formArea");

  if (!intro) {
    if (introLabel) {
      introLabel.innerText = "Invalid Referral Link";
    }

    if (formArea) {
      formArea.style.display = "none";
    }

    return;
  }

  if (introLabel) {
    introLabel.innerText = "Introducer: " + introducerId;
  }
}

function encodePass(password) {
  try {
    return btoa(password);
  } catch (e) {
    return password;
  }
}

function generateShareLink(userId, position) {
  const origin = window.location.origin;
  const path = window.location.pathname
    .split("/")
    .slice(0, -1)
    .join("/");

  return `${origin}${path}/user_register.html?ref=${userId}&pos=${position}`;
}

function watchRegistrationStatus(
  mobile,
  tempId,
  tempLink,
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

        <b>Temporary ID:</b> ${tempId}<br><br>

        <b>Share Link:</b><br>
        <input
          value="${tempLink}"
          readonly
          style="width:100%"
        ><br><br>

        <button
          type="button"
          class="open-link-btn"
          data-link="${tempLink}">
          Open Referral Link
        </button><br><br>

        Status: Still processing...
      `;
    }
  }, 1000);
}

function registerUser() {
  if (lock) return;
  lock = true;

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

  const position =
    document.querySelector(
      'input[name="position"]:checked'
    );

  // ================= VALIDATION =================
  if (!username || !email || !mobile || !password) {
    msg.innerText = "Fill all fields";
    lock = false;
    return;
  }

  if (!position) {
    msg.innerText = "Select position";
    lock = false;
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    msg.innerText = "Invalid mobile";
    lock = false;
    return;
  }

  const users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  if (users.find(function (u) {
    return u.mobile === mobile;
  })) {
    msg.innerText = "Mobile already exists";
    lock = false;
    return;
  }

  if (users.find(function (u) {
    return (
      (u.email || "").toLowerCase() ===
      email.toLowerCase()
    );
  })) {
    msg.innerText = "Email already exists";
    lock = false;
    return;
  }

  if (typeof addToRegistrationQueue !== "function") {
    msg.innerText = "Queue system not loaded";
    lock = false;
    return;
  }

  // ================= TEMPORARY PREVIEW =================
  const tempId = "BWG" + Date.now();
  const tempLink =
    generateShareLink(tempId, position.value);

  // ================= QUEUE SUBMISSION =================
  const added = addToRegistrationQueue({
    username: username,
    email: email,
    mobile: mobile,
    password: encodePass(password),
    introducerId: introducerId,
    position: position.value,
    status: "PENDING"
  });

  if (!added) {
    msg.innerText =
      "Registration failed (duplicate or error)";
    lock = false;
    return;
  }

  // ================= SUBMITTED MESSAGE =================
  msg.innerHTML = `
    ✅ Registration Submitted<br><br>

    <b>Temporary ID:</b> ${tempId}<br><br>

    <b>Share Link:</b><br>
    <input
      value="${tempLink}"
      readonly
      style="width:100%"
    ><br><br>

    <button
      type="button"
      class="open-link-btn"
      data-link="${tempLink}">
      Open Referral Link
    </button><br><br>

    Status: Processing Queue...
  `;

  // ================= WATCH FINAL STATUS =================
  watchRegistrationStatus(
    mobile,
    tempId,
    tempLink,
    position.value
  );

  lock = false;
}
