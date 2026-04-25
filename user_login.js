// ================= LOGIN PAGE =================
function loadLoginPage() {
  return `
    <div class="card">
      <h2>USER LOGIN</h2>

      <input type="text" id="userId" placeholder="Enter User ID">
      <input type="password" id="password" placeholder="Enter Password">
      <input type="checkbox" onchange="togglePassword()"> Show Password

      <button id="loginBtn" onclick="submitLogin()">Login</button>

      <div id="msg"></div>
    </div>
  `;
}

// ================= LOGIN FUNCTION =================
function submitLogin() {

  let userId = document.getElementById("userId").value.trim().toUpperCase();
  let password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showMsg("Enter User ID & Password");
    resetLogin();
    return;
  }

  let users = (typeof getUsers === "function") ? getUsers() : [];

  let user = users.find(u =>
    (u.userId || "").toUpperCase() === userId
  );

  if (!user) {
    showMsg("Invalid User ID");
    resetLogin();
    return;
  }

  if (user.role !== "user") {
    showMsg("Access denied");
    resetLogin();
    return;
  }

  if (user.status !== "active") {
    showMsg("Account inactive");
    resetLogin();
    return;
  }

  let stored = safeDecode(user.password || "");

  if (stored !== password) {
    showMsg("Wrong Password");
    resetLogin();
    return;
  }

  if (typeof setSession === "function") {
    setSession({
      userId: user.userId,
      role: user.role
    });
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "USER", "Login");
  }

  showMsg("Login Success", "green");

  document.getElementById("loginBtn").innerText = "Redirecting...";

  setTimeout(() => {
    window.location.href = "user_dashboard.html";
  }, 500);
}

