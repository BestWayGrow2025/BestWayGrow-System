
"use strict";

/*
========================================
TREE SYSTEM V13 (FINAL PRODUCTION LOCK + VIEW FIX)
========================================
✔ Sponsor Tree = hidden placement engine (SYSTEM USE ONLY)
✔ Introducer Tree = UI filtered view support
✔ Safe binary placement (L / R)
✔ Cycle protection
✔ Broken-node protection
✔ FULL TREE READ SUPPORT
✔ ROLE READY STRUCTURE (USER / ADMIN / SUPER ADMIN)
========================================
*/

/* ================= TREE HELPERS ================= */

// Get direct sponsor children (SYSTEM TREE)
function getChildren(userId, users) {
  return users.filter(u => u.sponsorId === userId);
}

// Get introducer-based children (UI TREE LOGIC)
function getIntroducerChildren(userId, users) {
  return users.filter(u => u.introducerId === userId);
}

/* ================= DIRECT NODE ACCESS ================= */

function getLeftChild(userId, users) {
  const user = users.find(u => u.userId === userId);
  return user ? user.leftChild : null;
}

function getRightChild(userId, users) {
  const user = users.find(u => u.userId === userId);
  return user ? user.rightChild : null;
}

/* ================= SAFE TREE PLACEMENT ================= */

function findPlacement(sponsorId, position, users) {

  let current = users.find(u => u.userId === sponsorId);
  if (!current) throw new Error("Invalid sponsor");

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
      throw new Error("Tree structure broken during traversal");
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

  try {
    const base = (window.location && window.location.origin)
      ? window.location.origin
      : "https://yourdomain.com";

    return base + "/register.html?ref=" + encodeURIComponent(userId);

  } catch (e) {
    return "https://yourdomain.com/register.html?ref=" + encodeURIComponent(userId);
  }
}

/* ================= TREE VIEW BUILDER (IMPORTANT FIX) =================
   USER / ADMIN / SUPER ADMIN ALL DEPEND ON THIS
*/

function getUserTree(userId) {

  let users = (typeof getUsers === "function") ? getUsers() : [];
  if (!Array.isArray(users)) return null;

  let root = users.find(u => u.userId === userId);
  if (!root) return null;

  function build(nodeId) {

    let node = users.find(u => u.userId === nodeId);
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

/* ================= CORE USER CREATION ENGINE ================= */

function createUserWithTree(req) {

  try {

    let sys = (typeof getSystemSettings === "function")
      ? getSystemSettings()
      : {};

    if (sys.lockMode) throw new Error("System Locked");
    if (sys.registrationOpen === false) throw new Error("Registration Closed");

    let users = (typeof getUsers === "function") ? getUsers() : [];
    if (!Array.isArray(users)) users = [];

    if (!req || !req.mobile) throw new Error("Invalid request");

    req.introducerId = req.introducerId || "BWG000000";
    req.sponsorId = req.sponsorId || req.introducerId;

    if (!["L", "R"].includes(req.position)) {
      req.position = "L";
    }

    if (users.find(u => u.mobile === req.mobile)) {
      throw new Error("Mobile already exists");
    }

    let userId = generateUserId(users);

    let placement = findPlacement(req.sponsorId, req.position, users);

    let parent = users.find(u => u.userId === placement.parentId);
    if (!parent) throw new Error("Parent not found");

    let newUser = {

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

    // LINK TREE
    if (placement.side === "L") {

      if (parent.leftChild) throw new Error("Left already occupied");
      parent.leftChild = userId;

    } else {

      if (parent.rightChild) throw new Error("Right already occupied");
      parent.rightChild = userId;
    }

    users.push(newUser);

    if (typeof saveUsers === "function") {
      saveUsers(users);
    }

    if (typeof logActivity === "function") {
      logActivity(userId, "USER", "Created");
    }

    return newUser;

  } catch (err) {

    console.error("Tree creation failed:", err.message);
    throw err;
  }
}

/* ================= EXPORT ================= */

window.createUserWithTree = createUserWithTree;
window.findPlacement = findPlacement;
window.getUserTree = getUserTree;
window.getChildren = getChildren;
window.getIntroducerChildren = getIntroducerChildren;
