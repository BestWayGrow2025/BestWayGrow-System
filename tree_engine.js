/*
========================================
TREE ENGINE (ENTERPRISE v4)
========================================
✔ Deep LEFT / RIGHT placement
✔ Queue compatible
✔ Wallet system added
✔ Income engine connected (CORRECT)
✔ Config based BV
✔ Clean + scalable structure
========================================
*/

// ================= GET CHILDREN =================
function getChildren(userId) {
  let users = getUsers();
  return users.filter(u => u.sponsorId === userId);
}

// ================= GET LEFT CHILD =================
function getLeftChild(userId) {
  let user = getUsers().find(u => u.userId === userId);
  return user ? user.leftChild : null;
}

// ================= GET RIGHT CHILD =================
function getRightChild(userId) {
  let user = getUsers().find(u => u.userId === userId);
  return user ? user.rightChild : null;
}

// ================= FIND PLACEMENT =================
function findPlacement(introducerId, position) {

  let users = getUsers();

  let current = users.find(u => u.userId === introducerId);
  if (!current) throw new Error("Invalid introducer");

  while (true) {

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

// ================= CREATE USER =================
function createUserWithTree(req) {

  let users = getUsers();

  // 🔒 DUPLICATE CHECK
  let exists = users.find(u => u.mobile === req.mobile);
  if (exists) throw new Error("Mobile already exists");

  let userId = "BWG" + Math.random().toString(36).substring(2, 8);

  let placement = findPlacement(req.introducerId, req.position || "L");

  let newUser = {
    userId,
    username: req.username,
    password: req.password,
    mobile: req.mobile,

    introducerId: req.introducerId,
    sponsorId: placement.parentId,
    position: placement.side,

    leftChild: null,
    rightChild: null,

    createdAt: Date.now(),

    // 🔥 ENTERPRISE WALLET
    wallet: {
      balance: 0,
      history: []
    }
  };

  // 🔗 LINK TO PARENT
  let parent = users.find(u => u.userId === placement.parentId);
  if (!parent) throw new Error("Parent not found");

  if (placement.side === "L") {
    parent.leftChild = userId;
  } else {
    parent.rightChild = userId;
  }

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // 🔥 INCOME TRIGGER (FINAL CORRECT)
  if (
    typeof processIncome === "function" &&
    typeof loadSystemConfig === "function"
  ) {
    try {

      let config = loadSystemConfig();

      processIncome(
        "upgrade",                // TYPE
        newUser.userId,           // USER
        config.upgrade.bv         // BV (dynamic)
      );

    } catch (e) {
      console.warn("Income processing failed:", e.message);
    }
  }

  return newUser;
}
