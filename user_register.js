/*
========================================
USER REGISTER v4.6 (FINAL COPY BUTTON FIX)
========================================
✔ Queue-only registration
✔ Live post-submit watcher
✔ Temporary ID → Real ID replacement
✔ Real referral link update
✔ GitHub Pages repo path safe link
✔ Stable copy button (dynamic render safe)
✔ Duplicate mobile check
✔ Duplicate email check
✔ Queue-safe submit
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
  if (e.target.classList.contains("copy-link-btn")) {
    const link = e.target.getAttribute("data-link") || "";
    navigator.clipboard.writeText(link);
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
  let btn = document.getElementById("registerBtn");
  if (btn) {
    btn.addEventListener("click", registerUser);
  }
}

function loadPage() {
  let intro = typeof getUserById === "function" ? getUserById(introducerId) : null;

  if (!intro) {
    document.getElementById("introLabel").innerText = "Invalid Referral Link";
    document.getElementById("formArea").style.display = "none";
    return;
  }

  document.getElementById("introLabel").innerText = "Introducer: " + introducerId;
}

function encodePass(p) {
  try { return btoa(p); } catch { return p; }
}

function generateShareLink(id, pos) {
  const origin = window.location.origin;
  const path = window.location.pathname.split("/").slice(0, -1).join("/");
  return `${origin}${path}/user_register.html?ref=${id}&pos=${pos}`;
}

function watchRegistrationStatus(mobile, tempId, tempLink, position) {
  if (statusWatcher) clearInterval(statusWatcher);

  const msg = document.getElementById("msg");
  let tries = 0;

  statusWatcher = setInterval(function () {
    tries++;

    let users = typeof getUsers === "function" ? getUsers() : [];
    let created = users.find(u => u.mobile === mobile);

    if (created && created.userId) {
      clearInterval(statusWatcher);
      statusWatcher = null;

      let realLink = generateShareLink(created.userId, position);

      msg.innerHTML = `
        ✅ Registration Complete<br><br>

        <b>User ID:</b> ${created.userId}<br><br>

        <b>Share Link:</b><br>
        <input value="${realLink}" readonly style="width:100%"><br><br>

        <button type="button" class="copy-link-btn" data-link="${realLink}">
          Copy Link
        </button><br><br>

        Status: Completed
      `;
      return;
    }

    let queue = typeof getRegQueue === "function" ? getRegQueue() : [];
    let pending = queue.find(q => q.mobile === mobile);

    if (pending && pending.status === "FAILED") {
      clearInterval(statusWatcher);
      statusWatcher = null;

      msg.innerHTML = `❌ Registration Failed<br><br>${pending.error || "Unknown error"}`;
      return;
    }

    if (tries >= 20) {
      clearInterval(statusWatcher);
      statusWatcher = null;

      msg.innerHTML = `
        ⏳ Registration Submitted<br><br>

        <b>Temporary ID:</b> ${tempId}<br><br>

        <b>Share Link:</b><br>
        <input value="${tempLink}" readonly style="width:100%"><br><br>

        <button type="button" class="copy-link-btn" data-link="${tempLink}">
          Copy Link
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

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const position = document.querySelector('input[name="position"]:checked');

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

  let users = typeof getUsers === "function" ? getUsers() : [];

  if (users.find(u => u.mobile === mobile)) {
    msg.innerText = "Mobile already exists";
    lock = false;
    return;
  }

  if (users.find(u => (u.email || "").toLowerCase() === email.toLowerCase())) {
    msg.innerText = "Email already exists";
    lock = false;
    return;
  }

  if (typeof addToRegistrationQueue !== "function") {
    msg.innerText = "Queue system not loaded";
    lock = false;
    return;
  }

  let tempId = "BWG" + Date.now();
  let tempLink = generateShareLink(tempId, position.value);

  let added = addToRegistrationQueue({
    username,
    email,
    mobile,
    password: encodePass(password),
    introducerId,
    position: position.value,
    status: "PENDING"
  });

  if (!added) {
    msg.innerText = "Registration failed (duplicate or error)";
    lock = false;
    return;
  }

  msg.innerHTML = `
    ✅ Registration Submitted<br><br>

    <b>Temporary ID:</b> ${tempId}<br><br>

    <b>Share Link:</b><br>
    <input value="${tempLink}" readonly style="width:100%"><br><br>

    <button type="button" class="copy-link-btn" data-link="${tempLink}">
      Copy Link
    </button><br><br>

    Status: Processing Queue...
  `;

  watchRegistrationStatus(mobile, tempId, tempLink, position.value);

  lock = false;
}
