/*
========================================
USER PROFILE SYSTEM (V1)
========================================
✔ Profile view
✔ Safe user load
✔ Editable UI structure
✔ Future API ready
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

// ================= LOAD PROFILE =================
function loadProfile() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="section-title">My Profile</div>

    <div class="info-box">
      <p><b>User ID:</b> ${user.userId}</p>
      <p><b>Name:</b> ${user.fullName || user.username || "-"}</p>
      <p><b>Email:</b> ${user.email || "-"}</p>
      <p><b>Mobile:</b> ${user.mobile || "-"}</p>
      <p><b>Sponsor ID:</b> ${user.sponsorId || "-"}</p>
      <p><b>City:</b> ${user.city || "-"}</p>
      <p><b>State:</b> ${user.state || "-"}</p>
      <p><b>Country:</b> ${user.country || "-"}</p>
    </div>

    <div class="section-title">Edit Profile</div>

    <div class="info-box">
      <input id="editName" placeholder="Full Name" value="${user.fullName || ""}">
      <input id="editMobile" placeholder="Mobile" value="${user.mobile || ""}">
      <input id="editCity" placeholder="City" value="${user.city || ""}">
      <input id="editState" placeholder="State" value="${user.state || ""}">

      <button class="action-btn" onclick="updateProfile()">Update Profile</button>
    </div>
  `;
}

// ================= UPDATE PROFILE =================
function updateProfile() {
  const user = getSafeUser();
  if (!user) return;

  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === user.userId);

  if (index === -1) return;

  users[index].fullName = document.getElementById("editName").value;
  users[index].mobile = document.getElementById("editMobile").value;
  users[index].city = document.getElementById("editCity").value;
  users[index].state = document.getElementById("editState").value;

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  alert("Profile Updated Successfully");

  loadProfile();
}

// ================= EXPORT =================
window.loadProfile = loadProfile;
window.updateProfile = updateProfile;
