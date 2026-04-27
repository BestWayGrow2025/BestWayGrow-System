let session = null;
let currentUser = null;
let lock = false;
let introducerId = "BWG000001";

document.addEventListener("DOMContentLoaded", function () {
  initPage();
  authPage();
  bindEvents();
  loadPage();
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
  introducerId = params.get("ref") || "BWG000001";
}

function bindEvents() {
  document.getElementById("registerBtn").addEventListener("click", registerUser);
}

function loadPage() {
  const introUser = typeof getUserById === "function"
    ? getUserById(introducerId)
    : null;

  if (!introUser) {
    document.getElementById("introLabel").innerText = "Invalid Referral Link";
    document.getElementById("formArea").style.display = "none";
    return;
  }

  document.getElementById("introLabel").innerText = "Introducer: " + introducerId;
}

function encodePass(password) {
  try {
    return btoa(password);
  } catch {
    return password;
  }
}

function registerUser() {
  if (lock) return;
  lock = true;

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value.trim();
  const position = document.querySelector('input[name="position"]:checked');

  if (!username || !email || !mobile || !password) {
    alert("Fill all fields");
    lock = false;
    return;
  }

  if (!position) {
    alert("Select position");
    lock = false;
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    alert("Invalid mobile");
    lock = false;
    return;
  }

  const users = typeof getUsers === "function" ? getUsers() : [];

  if (users.find(user => user.mobile === mobile)) {
    alert("Mobile already exists");
    lock = false;
    return;
  }

  if (users.find(user => user.email === email)) {
    alert("Email already exists");
    lock = false;
    return;
  }

  if (typeof addToRegistrationQueue !== "function") {
    alert("Registration queue missing");
    lock = false;
    return;
  }

  const added = addToRegistrationQueue({
    username: username,
    email: email,
    password: encodePass(password),
    mobile: mobile,
    introducerId: introducerId,
    position: position.value
  });

  if (!added) {
    alert("Registration failed or duplicate request");
    lock = false;
    return;
  }

  setTimeout(function () {
    const latestUser = typeof getUsers === "function" ? getUsers().slice(-1)[0] : null;

    document.getElementById("msg").innerHTML = `
      <div>
        ✅ Registration Complete<br><br>
        User ID: <b>${latestUser ? latestUser.userId : "Not Found"}</b><br><br>
        User created successfully<br><br>
        <a href="user_login.html">
          <button>Go to Login</button>
        </a>
      </div>
    `;

    resetForm();
    lock = false;
  }, 500);
}

function resetForm() {
  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("password").value = "";

  document.querySelectorAll('input[name="position"]').forEach(function (radio) {
    radio.checked = false;
  });
}


