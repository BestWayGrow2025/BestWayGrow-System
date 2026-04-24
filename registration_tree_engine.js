/*
========================================
REGISTRATION TREE ENGINE (FINAL v4 LOCK)
========================================
✔ Deep LEFT / RIGHT placement
✔ Parent-child linking (CRITICAL)
✔ getChildren() compatible
✔ No BFS (directional depth)
✔ Data structure enforced
✔ Role + Status FIXED
✔ Safe save (core aligned)
✔ Duplicate + safety checks
✔ Production LOCKED
========================================
*/

// ================= USER ID =================
function generateUserId() {
  return "BWG" + Date.now(); // ✅ more stable than random
}

// ================= FIND DEEP POSITION =================
function findDeepPosition(introducerId, position) {

  let users = getUsers() || [];

  let current = users.find(u => u.userId === introducerId);
  if (!current) throw new Error("Invalid introducer");

  while (true) {

    if (position === "L") {

      if (!current.leftChild) {
        return { parent: current, side: "L" };
      }

      current = users.find(u => u.userId === current.leftChild);

    } else {

      if (!current.rightChild) {
        return { parent: current, side: "R" };
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

  // 🔒 VALIDATION
  if (!req.username || !req.mobile || !req.password) {
    throw new Error("Missing required fields");
  }

  // 🔒 DUPLICATE CHECK
  let exists = users.find(u => u.mobile === req.mobile);
  if (exists) throw new Error("Mobile already exists");

  let userId = generateUserId();

  // 🔥 FIND POSITION
  let placement = findDeepPosition(req.introducerId, req.position || "L");
  let parent = placement.parent;

  // ================= NEW USER =================
  let newUser = {
    userId,
    username: req.username,
    password: req.password,
    mobile: req.mobile,

    introducerId: req.introducerId,
    sponsorId: parent.userId,

    position: placement.side,

    leftChild: null,
    rightChild: null,

    // ✅ MANDATORY FIELDS (SYSTEM CRITICAL)
    role: "user",
    status: "active",

    // ✅ SAFE DEFAULTS (avoid undefined anywhere)
    walletBalance: 0,
    totalIncome: 0,

    createdAt: Date.now()
  };

  // ================= LINK PARENT =================
  if (placement.side === "L") {
    parent.leftChild = userId;
  } else {
    parent.rightChild = userId;
  }

  // ================= SAVE =================
  users.push(newUser);

  if (typeof saveUsers === "function") {
    saveUsers(users);
  } else {
    localStorage.setItem("users", JSON.stringify(users));
  }

  return newUser;
}

// ================= GLOBAL EXPORT (SAFE) =================
window.createUserWithTree = createUserWithTree;
window.findDeepPosition = findDeepPosition;
