"use strict";

/*
========================================
REGISTRATION TREE ENGINE v4.2 (FINAL LOCKED FIXED)
========================================
*/

function safeUsers() {
  return (typeof getUsers === "function" ? getUsers() : []) || [];
}

// ================= USER ID =================
function generateUserId() {

  let users = safeUsers();
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

// ================= FIND POSITION =================
function findDeepPosition(introducerId, position) {

  let users = safeUsers();

  let current = users.find(u => u.userId === introducerId);

  if (!current) {
    throw new Error("Invalid introducer or root not found");
  }

  let visited = new Set();

  while (true) {

    if (!current) {
      throw new Error("Tree broken (null node)");
    }

    if (visited.has(current.userId)) {
      throw new Error("Tree cycle detected");
    }

    visited.add(current.userId);

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

    if (!current) {
      throw new Error("Tree broken during traversal");
    }
  }
}

// ================= CREATE USER =================
function createUserWithTree(req) {

  if (!req) throw new Error("Invalid request");

  let users = safeUsers();

  if (!req.username || !req.mobile || !req.password) {
    throw new Error("Missing required fields");
  }

  if (users.find(u => u.mobile === req.mobile)) {
    throw new Error("Mobile already exists");
  }

  let userId = generateUserId();

  let introducerId = req.introducerId || "BWG000000";

  let placement = findDeepPosition(
    introducerId,
    req.position || "L"
  );

  if (!placement || !placement.parent) {
    throw new Error("Invalid placement");
  }

  let parent = placement.parent;

  let backupLeft = parent.leftChild;
  let backupRight = parent.rightChild;

  let newUser = {
    userId,

    username: req.username,
    email: req.email || "",
    password: req.password,
    mobile: req.mobile,

    introducerId,
    sponsorId: introducerId,

    parentId: parent.userId,
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

    let saved = safeUsers();

    let checkUser = saved.find(u => u.userId === userId);
    let checkParent = saved.find(u => u.userId === parent.userId);

    if (!checkUser) throw new Error("User save failed");
    if (!checkParent) throw new Error("Parent save failed");

    let linked =
      (placement.side === "L" && checkParent.leftChild === userId) ||
      (placement.side === "R" && checkParent.rightChild === userId);

    if (!linked) throw new Error("Tree linking failed");

    if (typeof logActivity === "function") {
      logActivity(userId, "SYSTEM", "TREE CREATED");
    }

    return {
      user: checkUser,
      userId,
      introducerId,
      position: placement.side
    };

  } catch (err) {

    parent.leftChild = backupLeft;
    parent.rightChild = backupRight;

    if (typeof logActivity === "function") {
      logActivity(req.mobile, "SYSTEM", "TREE CREATE FAILED");
    }

    throw err;
  }
}

// ================= EXPORT =================
window.createUserWithTree = createUserWithTree;
window.findDeepPosition = findDeepPosition;
window.generateUserId = generateUserId;
