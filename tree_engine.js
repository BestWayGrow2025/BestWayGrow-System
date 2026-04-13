/*
========================================
TREE ENGINE V10 (FINAL CLEAN LOCK)
========================================
✔ Random User ID (A-Z a-z 0-9)
✔ Referral link added
✔ Safe placement logic
✔ Loop protection
✔ Core system aligned
✔ No extra changes (clean integration)
✔ Production ready
========================================
*/

// ================= GET CHILDREN =================
function getChildren(userId, users) {
  return users.filter(u => u.sponsorId === userId);
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
function findPlacement(introducerId, position, users) {

  let current = users.find(u => u.userId === introducerId);
  if (!current) throw new Error("Invalid introducer");

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

// ================= RANDOM USER ID =================
function generateUserId(users) {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let id;
  let exists;
  let safety = 0;

  do {
    if (safety++ > 1000) {
      throw new Error("User ID generation failed");
    }

    id = "BWG";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }

    exists = users.some(u => u.userId === id);

  } while (exists);

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

    // 🔒 SYSTEM LOCK
    if (typeof getSystemSettings === "function") {
      let sys = getSystemSettings();
      if (sys && sys.lockMode) throw new Error("System Locked");
    }

    // 🔒 SYSTEM SAFE
    if (typeof isSystemSafe === "function") {
      if (!isSystemSafe()) throw new Error("System not ready");
    }

    let users = getUsers();

    // 🔒 BASIC VALIDATION
    if (!req || !req.introducerId || !req.mobile) {
      throw new Error("Invalid request");
    }

    // 🔒 VALID INTRODUCER
    if (typeof isValidIntroducer === "function") {
      if (!isValidIntroducer(req.introducerId)) {
        throw new Error("Invalid introducer");
      }
    }

    // 🔒 DUPLICATE MOBILE
    if (users.find(u => u.mobile === req.mobile)) {
      throw new Error("Mobile already exists");
    }

    let userId = generateUserId(users);

    let placement = findPlacement(
      req.introducerId,
      req.position || "L",
      users
    );

    let referralLink = generateReferralLink(userId);

    let newUser = {
      userId,
      username: req.username || "",
      password: req.password || "",
      mobile: req.mobile,

      role: "user",
      status: "active",

      introducerId: req.introducerId,
      sponsorId: placement.parentId,
      position: placement.side,

      leftChild: null,
      rightChild: null,

      upgradeLevel: 0,
      repurchaseCount: 0,

      wallet: 0,
      totalIncome: 0,

      referralLink: referralLink,

      createdAt: new Date().toISOString()
    };

    // 🔗 LINK PARENT
    let parentIndex = users.findIndex(u => u.userId === placement.parentId);
    if (parentIndex === -1) throw new Error("Parent not found");

    if (placement.side === "L") {
      users[parentIndex].leftChild = userId;
    } else {
      users[parentIndex].rightChild = userId;
    }

    users.push(newUser);

    // 💾 SAVE
    saveUsers(users);

    // 🔥 INCOME TRIGGER (SAFE)
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
