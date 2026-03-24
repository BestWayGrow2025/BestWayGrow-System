// ===== RANDOM ID =====
function generateUserId() {
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let existingIds = users.map(u => u.userId);

  let newId;
  do {
    let randomNum = Math.floor(1 + Math.random() * 999999);
    newId = "BWG" + String(randomNum).padStart(6, "0");
  } while (existingIds.includes(newId));

  return newId;
}

// ===== INTRODUCER VALIDATION =====
function isValidIntroducer(id) {
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  return users.some(u => u.userId === id);
}

// ===== REGISTER USER =====
function registerUser(username, password, introducerId) {

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if (!isValidIntroducer(introducerId)) {
    alert("Invalid Introducer");
    return;
  }

  let newUser = {
    userId: generateUserId(),
    username,
    password,
    role: "user",
    introducerId,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  alert("User Created: " + newUser.userId);
}
