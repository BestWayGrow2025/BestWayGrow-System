"use strict";

/*
========================================
TREE SYSTEM V14 (PRODUCTION FINAL)
========================================
✔ Sponsor Tree = hidden placement engine
✔ Introducer Tree = UI filtered support only
✔ Safe L/R placement
✔ Cycle protection
✔ Broken-node protection
✔ Full read support
✔ Diagnostics compatible
✔ Control Center compatible
✔ Production LOCKED
========================================
*/

/* ================= CHILD HELPERS ================= */

function getChildren(userId, users) {
  return users.filter(u => u.sponsorId === userId);
}

function getIntroducerChildren(userId, users) {
  return users.filter(u => u.introducerId === userId);
}

/* ================= DIRECT ACCESS ================= */

function getLeftChild(userId, users) {
  const user = users.find(u => u.userId === userId);
  return user ? user.leftChild : null;
}

function getRightChild(userId, users) {
  const user = users.find(u => u.userId === userId);
  return user ? user.rightChild : null;
}

/* ================= PLACEMENT ENGINE ================= */

function findPlacement(sponsorId, position, users) {

  if (!Array.isArray(users)) {
    throw new Error("Invalid users list");
  }

  let current = users.find(u => u.userId === sponsorId);

  if (!current) {
    throw new Error("Invalid sponsor");
  }

  let safety = 0;

  while (true) {

    if (safety++ > 1000) {
      throw new Error("Tree overflow detected");
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
      throw new Error("Tree broken during traversal");
    }
  }
}

/* ================= USER ID GENERATOR ================= */

function generateUserId(users) {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

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

/* ================= REFERRAL LINK ================= */

function generateReferralLink(userId) {

  const base =
    window.location?.origin || "https://yourdomain.com";

  return `${base}/register.html?ref=${encodeURIComponent(userId)}`;
}

/* ================= TREE VIEW ENGINE ================= */

function getUserTree(userId) {

  let users =
    typeof getUsers === "function"
      ? getUsers()
      : [];

  if (!Array.isArray(users)) return null;

  const root = users.find(u => u.userId === userId);
  if (!root) return null;

  function build(nodeId) {

    const node = users.find(u => u.userId === nodeId);
    if (!node) return null;

    return {
      userId: node.userId,
      name: node.name || node.username || "",
      left: node.leftChild ? build(node.leftChild) : null,
      right: node.rightChild ? build(node.rightChild) : null
    };
  }

  return build(userId);
}

/* ================= DIAGNOSTIC TREE DATA ================= */

function getTreeData(userId) {

  if (userId) {
    return getUserTree(userId);
  }

  if (typeof getUsers === "function") {
    return getUsers() || [];
  }

  return [];
}

/* ================= USER CREATE ENGINE ================= */

function createUserWithTree(req) {

  try {

    const sys =
      typeof getSystemSettings === "function"
        ? getSystemSettings()
        : {};

    if (sys.lockMode) throw new Error("System Locked");
    if (sys.registrationOpen === false) {
      throw new Error("Registration Closed");
    }

    let users =
      typeof getUsers === "function"
        ? getUsers()
        : [];

    if (!Array.isArray(users)) users = [];

    if (!req || !req.mobile) {
      throw new Error("Invalid request");
    }

    req.introducerId = req.introducerId || "BWG000000";
    req.sponsorId = req.sponsorId || req.introducerId;

    if (!["L", "R"].includes(req.position)) {
      req.position = "L";
    }

    if (users.some(u => u.mobile === req.mobile)) {
      throw new Error("Mobile already exists");
    }

    const userId = generateUserId(users);

    const placement = findPlacement(
      req.sponsorId,
      req.position,
      users
    );

    const parent = users.find(
      u => u.userId === placement.parentId
    );

    if (!parent) throw new Error("Parent not found");

    const newUser = {
      userId,
      username: req.username || "",
      password: req.password || "",
      name: req.name || "",
      email: req.email || "",
      mobile: req.mobile,

      role: "user",
      status: "active",

      introducerId: req.introducerId,
      sponsorId: placement.parentId,
      position: placement.side,

      leftChild: null,
      rightChild: null,

      wallet: {
        balance: 0,
        incomeBalance: 0,
        holdIncome: 0,
        totalCredit: 0,
        totalDebit: 0
      },

      referralLink: generateReferralLink(userId),
      createdAt: new Date().toISOString()
    };

    if (placement.side === "L") {
      if (parent.leftChild) {
        throw new Error("Left already occupied");
      }
      parent.leftChild = userId;
    } else {
      if (parent.rightChild) {
        throw new Error("Right already occupied");
      }
      parent.rightChild = userId;
    }

    users.push(newUser);

    if (typeof saveUsers === "function") {
      saveUsers(users);
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "CREATED");
    }

    return newUser;

  } catch (err) {
    console.error("Tree system error:", err.message);
    throw err;
  }
}

/* ================= EXPORT ================= */

window.createUserWithTree = createUserWithTree;
window.findPlacement = findPlacement;
window.getUserTree = getUserTree;
window.generateUserId = generateUserId;
window.getTreeData = getTreeData;

/* ================= REQUIRED FLAGS ================= */

window.__TREE_ENGINE_ACTIVE__ = true;
window.__TREE_SYSTEM_ACTIVE__ = true;

console.log("[TREE SYSTEM] Global flags registered");
