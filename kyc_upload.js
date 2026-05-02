/*
========================================
KYC UPLOAD SYSTEM (V1)
========================================
✔ KYC upload UI
✔ Document selection
✔ Status tracking (frontend)
✔ Backend ready structure
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

// ================= LOAD KYC PAGE =================
function loadKYCSection() {
  const user = getSafeUser();
  if (!user) return;

  const main = document.getElementById("mainContent");
  if (!main) return;

  const kyc = user.kyc || { status: "NOT_SUBMITTED" };

  main.innerHTML = `
    <div class="section-title">KYC Verification</div>

    <div class="info-box">
      <p><b>Status:</b> ${kyc.status}</p>
    </div>

    <div class="info-box">
      <label>Select Document Type</label>
      <select id="docType">
        <option value="AADHAAR">Aadhaar Card</option>
        <option value="PAN">PAN Card</option>
        <option value="DRIVING">Driving License</option>
      </select>

      <label>Upload Document</label>
      <input type="file" id="docFile">

      <button class="action-btn" onclick="submitKYC()">Submit KYC</button>
    </div>
  `;
}

// ================= SUBMIT KYC =================
function submitKYC() {
  const user = getSafeUser();
  if (!user) return;

  const docType = document.getElementById("docType").value;
  const fileInput = document.getElementById("docFile");

  if (!fileInput || fileInput.files.length === 0) {
    alert("Please select a file");
    return;
  }

  let users = typeof getUsers === "function" ? getUsers() : [];
  let index = users.findIndex(u => u.userId === user.userId);

  if (index === -1) return;

  users[index].kyc = {
    type: docType,
    status: "PENDING",
    submittedAt: new Date().toISOString(),
    fileName: fileInput.files[0].name
  };

  if (typeof saveUsers === "function") {
    saveUsers(users);
  }

  if (typeof logActivity === "function") {
    logActivity(user.userId, "USER", "KYC SUBMITTED", "KYC");
  }

  alert("KYC Submitted Successfully");

  loadKYCSection();
}

// ================= EXPORT =================
window.loadKYCSection = loadKYCSection;
window.submitKYC = submitKYC;
