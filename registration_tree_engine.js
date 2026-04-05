/*
========================================
REGISTRATION TREE ENGINE (FINAL v2)
========================================
✔ Deep LEFT / RIGHT placement
✔ Parent-child linking (CRITICAL)
✔ getChildren() compatible
✔ No BFS (directional depth)
✔ Data structure enforced
✔ Production ready
========================================
*/

// ================= USER ID =================
function generateUserId() {
  return "BWG" + Math.random().toString(36).substring(2, 8);
}

// ================= FIND DEEP POSITION =================
function findDeepPosition(introducerId, position) {

  let users = getUsers();

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

  let users = getUsers();

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

    leftChild: null,     // 🔥 REQUIRED
    rightChild: null,    // 🔥 REQUIRED

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
  localStorage.setItem("users", JSON.stringify(users));

  return newUser;
}


🔗 ✅ CONNECT WITH QUEUE (FINAL STEP)
👉 Open: registration_queue.js
FIND:
function processOneRegistration(req)


❌ REMOVE OLD CODE
✅ REPLACE WITH:
function processOneRegistration(req) {

  try {

    createUserWithTree(req);

    return true;

  } catch (err) {

    throw err;
  }
}


📁 ✅ SCRIPT ORDER (VERY IMPORTANT)
In user_register.html:
<script src="core_system.js"></script>
<script src="registration_tree_engine.js"></script>
<script src="registration_queue.js"></script>
