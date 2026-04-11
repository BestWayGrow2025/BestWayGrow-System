/*
========================================
TREE ENGINE V7 (FINAL LOCKED)
========================================
✔ Deep LEFT / RIGHT placement
✔ Safe user creation
✔ Core integrated (getUsers / saveUsers)
✔ System lock protected
✔ Income trigger connected (safe)
✔ Clean wallet structure
✔ Production ready
========================================
*/

// ================= GET CHILDREN =================
function getChildren(userId) {
  return getUsers().filter(u => u.sponsorId === userId);
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

  try {

    // 🔒 SYSTEM LOCK
    if (typeof getSystemSettings === "function") {
      let sys = getSystemSettings();
      if (sys && sys.lockMode) {
        throw new Error("System Locked");
      }
    }

    let users = getUsers();

    // 🔒 DUPLICATE MOBILE
    let exists = users.find(u => u.mobile === req.mobile);
    if (exists) throw new Error("Mobile already exists");

    let userId = "BWG" + Date.now().toString().slice(-6);

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

      createdAt: new Date().toISOString(),

      // ✅ CORRECT WALLET (NUMBER)
      wallet: 0
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

    // ✅ SAFE SAVE
    saveUsers(users);

    // 🔥 INCOME TRIGGER (SAFE V7)
    if (typeof processIncome === "function") {
      try {

        // Default fallback BV (safe)
        let bv = 0;

        if (typeof getSystemConfig === "function") {
          let config = getSystemConfig();
          bv = Number(config?.upgrade?.bv || 0);
        }

        if (bv > 0) {
          processIncome("upgrade", newUser.userId, bv);
        }

      } catch (e) {
        console.warn("Income processing failed:", e.message);
      }
    }

    // 📊 ACTIVITY LOG (OPTIONAL)
    if (typeof addLog === "function") {
      addLog("NEW USER CREATED", newUser.userId);
    }

    return newUser;

  } catch (err) {

    console.error("User creation failed:", err.message);
    throw err;

  }
}
