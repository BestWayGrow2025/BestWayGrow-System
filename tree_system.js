/*
========================================
TREE SYSTEM V12 (MASTER LOCK ❤️ FINAL)
========================================
✔ Random User ID
✔ Referral link
✔ Wallet aligned
✔ Point system attached
✔ Rank system attached
✔ Safe placement
✔ No overwrite bug
✔ Direct point trigger added
✔ Fully income-engine compatible
========================================
*/

// ================= GET CHILDREN =================
function getChildren(userId, users) {
  return users.filter(u => u.sponsorId === userId);
}

function getIntroducerChildren(userId, users) {
  return users.filter(u => u.introducerId === userId);
}

// ================= GET LEFT CHILD =================
function getLeftChild(userId, users) {
  let user = users.find(u => u.userId === userId);
  return user ? user.leftChild : null;
}

// ================= GET RIGHT CHILD =================
function getRightChild(userId, users) {
  let user = users.find(u => u.userId === userId);
  return user ? user.rightChild : null;
}

// ================= FIND PLACEMENT =================
function findPlacement(sponsorId, position, users) {

  let current = users.find(u => u.userId === sponsorId);

  if (!current) {
    throw new Error("Invalid sponsor");
  }

  let safety = 0;

  while (true) {

    if (safety++ > 1000) {
      throw new Error("Tree loop overflow");
    }

    if (position === "L") {

      if (!current.leftChild) {
        return {
          parentId: current.userId,
          side: "L"
        };
      }

      current = users.find(u => u.userId === current.leftChild);

    } else {

      if (!current.rightChild) {
        return {
          parentId: current.userId,
          side: "R"
        };
      }

      current = users.find(u => u.userId === current.rightChild);
    }

    if (!current) {
      throw new Error("Tree broken");
    }
  }
}

// ================= RANDOM USER ID =================
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

// ================= REFERRAL LINK =================
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

// ================= CREATE USER =================
function createUserWithTree(req) {

  try {

    // 🔒 REGISTRATION CHECK
    if (typeof getSystemSettings === "function") {
      let sys = getSystemSettings();

      if (sys && sys.registrationOpen === false) {
        throw new Error("Registration Closed");
      }

      if (sys && sys.lockMode) {
        throw new Error("System Locked");
      }
    }

    // 🔒 SYSTEM SAFE
    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) {
        throw new Error("System not ready");
      }
    }

    let users = (typeof getUsers === "function")
      ? getUsers()
      : [];

    if (!Array.isArray(users)) {
      users = [];
    }

  // 🔒 VALIDATION
if (!req || !req.mobile) {
  throw new Error("Invalid request");
}

req.introducerId = req.introducerId || "BWG000000";
req.sponsorId = req.sponsorId || "BWG000000";

if (!req.position || !["L", "R"].includes(req.position)) {
  req.position = "L";
}

let introducerUser = users.find(u => u.userId === req.introducerId);

if (!introducerUser) {
  throw new Error("Invalid introducer");
}

let sponsorUser = users.find(u => u.userId === req.sponsorId);

if (!sponsorUser) {
  throw new Error("Invalid sponsor");
}

  // 🔒 INTRODUCER CHECK
    if (users.find(u => u.mobile === req.mobile)) {
      throw new Error("Mobile already exists");
    }

    let userId = generateUserId(users);

    // 🌳 TREE PLACEMENT
let placement = findPlacement(
  req.sponsorId || "BWG000000",
  req.position,
  users
);

    let referralLink = generateReferralLink(userId);

    let newUser = {
      upgradeStatus: false,
      repurchaseStatus: false,

      wallet: {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      },

      kycStatus: "pending",

      pinStatus: "none",
      availableUpgradePins: 0,
      availableRepurchasePins: 0,
      usedPinCount: 0,

      lastLogin: null,

      userId,
      username: req.username || "",
      password: req.password || "",
      name: req.name || "",
      email: req.email || "",
      mobile: req.mobile,

      role: "user",
      status: "active",

    introducerId: req.introducerId || "BWG000000",
sponsorId: placement.parentId || "BWG000000",
      sponsorVisible: false,
      introducerVisible: true,
      position: placement.side,

      leftChild: null,
      rightChild: null,

      // 🔹 BUSINESS DATA
      upgradeLevel: 0,
      repurchaseCount: 0,

      // ❤️ POINT SYSTEM
      monthlyPoints: 0,
      lastPointReset: new Date().toISOString(),
      rliHoldBalance: 0,

      // ❤️ RANK SYSTEM
      rankLevel: 0,

      totalIncome: 0,

      referralLink,

      createdAt: new Date().toISOString()
    };

    // 🔗 LINK PARENT
    let parentIndex = users.findIndex(
      u => u.userId === placement.parentId
    );

    if (parentIndex === -1) {
      throw new Error("Parent not found");
    }

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

    users.push(newUser);

    // 💾 SAVE
    if (typeof saveUsers === "function") {
      saveUsers(users);
    } else {
      throw new Error("saveUsers missing");
    }

    // ❤️ DIRECT POINT
if (typeof updateUserPoints === "function") {
  updateUserPoints(
    req.introducerId || "BWG000000",
    0,
    true
  );
}

// 🔥 REGISTRATION TRIGGER
if (typeof triggerRegistrationIncome === "function") {

      try {
        triggerRegistrationIncome(newUser.userId, 0);
      } catch (e) {
        console.warn("Registration trigger fail:", e.message);
      }
    }

    // 🔥 INCOME TRIGGER
    if (typeof processIncome === "function") {
      try {

        let bv = 0;

        if (typeof getActivePin === "function") {
          let pin = getActivePin("upgrade");
          bv = Number(pin?.bv || 0);
        }

        if (bv > 0) {
          processIncome("upgrade", newUser.userId, bv);
        }

      } catch (e) {
        console.warn("Income fail:", e.message);
      }
    }

    // 📊 LOG
    if (typeof logActivity === "function") {
      logActivity(newUser.userId, "USER", "Created");
    }

    return newUser;

  } catch (err) {
    console.error("User creation failed:", err.message);
    throw err;
  }
}


