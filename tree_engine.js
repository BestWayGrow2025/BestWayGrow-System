/*
========================================
TREE ENGINE V7 (FINAL TRUE LOCK)
========================================
✔ Single users snapshot
✔ Safe loop protection
✔ Strong sequential ID
✔ Full safe user structure
✔ Core system aligned
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

// ================= GENERATE USER ID =================
function generateUserId(users) {

  let last = users
    .map(u => u.userId)
    .filter(id => id.startsWith("BWG"))
    .map(id => parseInt(id.replace("BWG", "")))
    .filter(n => !isNaN(n))
    .sort((a, b) => b - a)[0] || 0;

  return "BWG" + String(last + 1).padStart(6, "0");
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

    let newUser = {
      userId,
      username: req.username,
      password: req.password,
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

      createdAt: new Date().toISOString()
    };

    // 🔗 LINK PARENT (SAFE INDEX)
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

    // 🔥 INCOME TRIGGER
    if (typeof processIncome === "function") {
      try {

        let bv = 0;

        if (typeof getSystemConfig === "function") {
          let config = getSystemConfig();
          bv = Number(config?.upgrade?.bv || 0);
        }

        if (bv > 0) {
          processIncome("upgrade", newUser.userId, bv);
        }

      } catch (e) {
        console.warn("Income fail:", e.message);
      }
    }

    // 📊 ACTIVITY LOG
    if (typeof addLog === "function") {
      addLog("NEW USER CREATED", newUser.userId);
    }

    return newUser;

  } catch (err) {
    console.error("User creation failed:", err.message);
    throw err;
  }
}
