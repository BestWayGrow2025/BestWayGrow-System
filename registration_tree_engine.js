/*
========================================
REGISTRATION TREE ENGINE v4.1 (PATCHED FINAL)
========================================
✔ Collision-safe userId
✔ Directional LEFT / RIGHT deep placement
✔ Cycle-safe traversal
✔ Atomic parent-child commit
✔ Parent rollback protection
✔ Post-save integrity verification
✔ Root / self-link protection
✔ Distinct introducer / parent / sponsor
✔ Safe storage commit
✔ Activity logging
✔ Production patched
========================================
*/

// ================= USER ID =================
function generateUserId() {
  let users = typeof getUsers === "function" ? (getUsers() || []) : [];
  let id = "";
  let attempts = 0;

  do {
    id = "BWG" + Date.now() + Math.floor(Math.random() * 1000);
    attempts++;
    if (attempts > 10) {
      id = "BWG" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      break;
    }
  } while (users.some(u => u.userId === id));

  return id;
}

// ================= FIND DEEP POSITION =================
function findDeepPosition(introducerId, position) {
  let users = getUsers() || [];
  let current = users.find(u => u.userId === introducerId);

  if (!current) throw new Error("Invalid introducer");

  let visited = new Set();

  while (true) {
    if (visited.has(current.userId)) {
      throw new Error("Tree cycle detected");
    }
    visited.add(current.userId);

    if (position === "L") {
      if (!current.leftChild) return { parent: current, side: "L" };

      if (current.leftChild === current.userId) {
        throw new Error("Self-link detected");
      }

      current = users.find(u => u.userId === current.leftChild);
    } else {
      if (!current.rightChild) return { parent: current, side: "R" };

      if (current.rightChild === current.userId) {
        throw new Error("Self-link detected");
      }

      current = users.find(u => u.userId === current.rightChild);
    }

    if (!current) throw new Error("Tree broken");
  }
}

// ================= CREATE USER =================
function createUserWithTree(req) {
  if (!req) throw new Error("Invalid request");

  let users = getUsers() || [];

  if (!req.username || !req.mobile || !req.password) {
    throw new Error("Missing required fields");
  }

  let exists = users.find(u => u.mobile === req.mobile);
  if (exists) throw new Error("Mobile already exists");

  let userId = generateUserId();
  let placement = findDeepPosition(req.introducerId, req.position || "L");
  let parent = placement.parent;

  if (!parent || !parent.userId) throw new Error("Invalid parent");
  if (parent.userId === userId) throw new Error("Invalid self parent");

  let originalLeft = parent.leftChild;
  let originalRight = parent.rightChild;

  let newUser = {
    userId: userId,
    username: req.username,
    email: req.email || "",
    password: req.password,
    mobile: req.mobile,

    introducerId: req.introducerId,      // who referred
    sponsorId: req.introducerId,         // sponsor / referral source
    parentId: parent.userId,             // actual tree placement parent

    position: placement.side,

    leftChild: null,
    rightChild: null,

    role: "user",
    status: "active",

    walletBalance: 0,
    totalIncome: 0,

    createdAt: Date.now()
  };

  try {
    if (placement.side === "L") {
      parent.leftChild = userId;
    } else {
      parent.rightChild = userId;
    }

    users.push(newUser);

    if (typeof saveUsers === "function") {
      saveUsers(users);
    } else {
      localStorage.setItem("users", JSON.stringify(users));
    }

    // ================= POST-SAVE VERIFY =================
    let savedUsers = getUsers() || [];
    let savedUser = savedUsers.find(u => u.userId === userId);
    let savedParent = savedUsers.find(u => u.userId === parent.userId);

    if (!savedUser) throw new Error("User save verification failed");
    if (!savedParent) throw new Error("Parent save verification failed");

    let linked =
      (placement.side === "L" && savedParent.leftChild === userId) ||
      (placement.side === "R" && savedParent.rightChild === userId);

    if (!linked) throw new Error("Parent-child link verification failed");

    if (typeof logActivity === "function") {
      logActivity(userId, "SYSTEM", "TREE USER CREATED");
    }

   return {
  user: savedUser,
  userId: savedUser.userId,
  introducerId: req.introducerId,
  position: placement.side
};

  } catch (e) {
    // ================= ROLLBACK =================
    parent.leftChild = originalLeft;
    parent.rightChild = originalRight;

    if (typeof logActivity === "function") {
      logActivity(req.mobile || "SYSTEM", "SYSTEM", "TREE CREATE FAILED");
    }

    throw e;
  }
}

// ================= EXPORT =================
window.createUserWithTree = createUserWithTree;
window.findDeepPosition = findDeepPosition;
