/*
========================================
TREE SYSTEM V13 (FINAL CLEAN LOCK)
========================================
✔ Header structured
✔ Sponsor fix applied
✔ Placement fallback safe
✔ Clean readable blocks
✔ Production stable
========================================
*/

// ================= HEADER 1: CHILD HELPERS =================
function getChildren(userId, users) {
  return users.filter(u => u.sponsorId === userId);
}

function getIntroducerChildren(userId, users) {
  return users.filter(u => u.introducerId === userId);
}

// ================= HEADER 2: DIRECT CHILD ACCESS =================
function getLeftChild(userId, users) {
  let user = users.find(u => u.userId === userId);
  return user ? user.leftChild : null;
}

function getRightChild(userId, users) {
  let user = users.find(u => u.userId === userId);
  return user ? user.rightChild : null;
}

// ================= HEADER 3: TREE PLACEMENT ENGINE =================
function findPlacement(sponsorId, position, users) {

  let current = users.find(u => u.userId === sponsorId);
  if (!current) throw new Error("Invalid sponsor");

  let safety = 0;

  while (true) {

    if (safety++ > 1000) {
      throw new Error("Tree loop overflow");
    }

    if (position === "L") {

      if (!current.leftChild) {
        return { parentId: current.userId, side: "L" };
      }

      current = users.find(u => u.userId === current.leftChild);

    } else {

      if (!current.rightChild) {
        return { parentId: current.userId, side: "R" };
      }

      current = users.find(u => u.userId === current.rightChild);
    }

    if (!current) throw new Error("Tree broken");
  }
}

// ================= HEADER 4: USER ID GENERATOR =================
function generateUserId(users) {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let id;
  let safety = 0;

  do {

    if (safety++ > 1000) {
      throw new Error("User ID generation failed");
    }

    id = "BWG";

    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }

  } while (users.some(u => u.userId === id));

  return id;
}

// ================= HEADER 5: REFERRAL LINK =================
function generateReferralLink(userId) {
  try {
    let base = window.location.origin || "";

    if (!base || base === "null") {
      base = "https://yourdomain.com";
    }

    return base + "/register.html?ref=" + encodeURIComponent(userId);

  } catch {
    return "https://yourdomain.com/register.html?ref=" + userId;
  }
}

// ================= HEADER 6: CREATE USER ENGINE =================
function createUserWithTree(req) {

  try {

    // ================= SYSTEM CHECK =================
    let sys = (typeof getSystemSettings === "function") ? getSystemSettings() : {};

    if (sys.lockMode) throw new Error("System Locked");
    if (sys.registrationOpen === false) throw new Error("Registration Closed");

    if (typeof isSystemSafe === "function" && !isSystemSafe()) {
      throw new Error("System not ready");
    }

    let users = (typeof getUsers === "function") ? getUsers() : [];
    if (!Array.isArray(users)) users = [];

    // ================= VALIDATION =================
    if (!req || !req.mobile) {
      throw new Error("Invalid request");
    }

    req.introducerId = req.introducerId || "BWG000000";

    // ✅ IMPORTANT FIX
    req.sponsorId = req.sponsorId || req.introducerId;

    if (!req.position || !["L", "R"].includes(req.position)) {
      req.position = "L";
    }

    let introducerUser = users.find(u => u.userId === req.introducerId);
    if (!introducerUser) throw new Error("Invalid introducer");

    let sponsorUser = users.find(u => u.userId === req.sponsorId);
    if (!sponsorUser) throw new Error("Invalid sponsor");

    if (users.find(u => u.mobile === req.mobile)) {
      throw new Error("Mobile already exists");
    }

    // ================= GENERATE USER =================
    let userId = generateUserId(users);

   // ================= SAFE TREE PLACEMENT =================
    let placement;

    try {
      placement = findPlacement(req.sponsorId, req.position, users);
    } catch (e) {

      console.warn("Placement fallback:", e.message);

      placement = findPlacement("BWG000000", req.position, users);
    }

    // ================= REFERRAL =================
    let referralLink = generateReferralLink(userId);

    // ================= USER OBJECT =================
    let newUser = {
      userId,
      username: req.username || "",
      password: req.password || "",
      name: req.name || "",
      email: req.email || "",
      mobile: req.mobile,

      role: "user",
      status: "active",

      introducerId: req.introducerId,
      sponsorId: placement.parentId,
      position: placement.side,

      leftChild: null,
      rightChild: null,

      wallet: {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      },

      referralLink,
      createdAt: new Date().toISOString()
    };

    // ================= LINK TO PARENT =================
    let parentIndex = users.findIndex(u => u.userId === placement.parentId);

    if (parentIndex === -1) {
      throw new Error("Parent not found");
    }

    // ✅ SAFE INSERT (NO OVERWRITE BUG)
    if (placement.side === "L") {

      if (users[parentIndex].leftChild) {
        throw new Error("Left already occupied");
      }

      users[parentIndex].leftChild = userId;

    } else {

      if (users[parentIndex].rightChild) {
        throw new Error("Right already occupied");
      }

      users[parentIndex].rightChild = userId;
    }

    // ================= SAVE =================
    users.push(newUser);

    if (typeof saveUsers === "function") {
      saveUsers(users);
    }

    // ================= LOG =================
    if (typeof logActivity === "function") {
      logActivity(newUser.userId, "USER", "Created");
    }

    return newUser;

  } catch (err) {
    console.error("User creation failed:", err.message);
    throw err;
  }
}
