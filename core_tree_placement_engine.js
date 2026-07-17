"use strict";

/*
========================================
PLACEMENT ENGINE v1.0 (PRODUCTION)
========================================
✔ Sponsor tree placement engine
✔ Safe left/right traversal
✔ Cycle protection
✔ Broken-node protection
✔ Child helper functions
✔ Production LOCKED
========================================
*/

/* ================= CHILD HELPERS ================= */

function getChildren(userId, users) {
  users = Array.isArray(users) ? users : [];

  return users.filter(function (u) {
    return u.sponsorId === userId;
  });
}

function getLeftChild(userId, users) {
  users = Array.isArray(users) ? users : [];

  const user = users.find(function (u) {
    return u.userId === userId;
  });

  return user ? user.leftChild : null;
}

function getRightChild(userId, users) {
  users = Array.isArray(users) ? users : [];

  const user = users.find(function (u) {
    return u.userId === userId;
  });

  return user ? user.rightChild : null;
}

/* ================= PLACEMENT ENGINE ================= */

function findPlacement(sponsorId, position, users) {
  if (!Array.isArray(users)) {
    throw new Error("Invalid users list");
  }

  if (position !== "L" && position !== "R") {
    throw new Error("Invalid position");
  }

  let current = users.find(function (u) {
    return u.userId === sponsorId;
  });

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

      current = users.find(function (u) {
        return u.userId === current.leftChild;
      });
    } else {
      if (!current.rightChild) {
        return {
          parentId: current.userId,
          side: "R"
        };
      }

      current = users.find(function (u) {
        return u.userId === current.rightChild;
      });
    }

    if (!current) {
      throw new Error("Tree broken during traversal");
    }
  }
}

/* ================= EXPORT ================= */

window.findPlacement = findPlacement;

/* ================= FLAGS ================= */

window.__PLACEMENT_ENGINE_ACTIVE__ = true;

console.log("[PLACEMENT ENGINE] Active");

