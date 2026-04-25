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
  return "BWG" + Date.now();
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

  if (!req.username || !req.mobile || !req.password) {
    throw new Error("Missing required fields");
  }

  let exists = users.find(u => u.mobile === req.mobile);
  if (exists) throw new Error("Mobile already exists");

  let userId = generateUserId();

  let placement = findDeepPosition(req.introducerId, req.position || "L");
  let parent = placement.parent;

  let newUser = {
    userId: userId,
    username: req.username,
    email: req.email || "",
    password: req.password,
    mobile: req.mobile,

    introducerId: req.introducerId,
    sponsorId: parent.userId,

    position: placement.side,

    leftChild: null,
    rightChild: null,

    role: "user",
    status: "active",

    walletBalance: 0,
    totalIncome: 0,

    createdAt: Date.now()
  };

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

  return newUser;
}

// ================= EXPORT =================
window.createUserWithTree = createUserWithTree;
window.findDeepPosition = findDeepPosition;
