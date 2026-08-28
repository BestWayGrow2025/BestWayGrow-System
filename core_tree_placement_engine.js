"use strict";

/*
========================================
PLACEMENT ENGINE v1.0 (PRODUCTION)
========================================
✔ Sponsor tree placement engine
✔ Safe left/right traversal
✔ Cycle protection
✔ Broken-node protection
✔ Production LOCKED
========================================
*/

/* ================= PLACEMENT ENGINE ================= */

function findPlacement(introducerId, position, users) {
  if (!Array.isArray(users)) {
    throw new Error("Invalid users list");
  }

  if (position !== "L" && position !== "R") {
    throw new Error("Invalid position");
  }

  let current = users.find(function (u) {
    return u.userId === introducerId;
  });

  if (!current) {
    throw new Error("Invalid introducer");
  }

  let safety = 0;
  const visited = new Set();

  while (true) {
    if (safety++ > 1000) {
      throw new Error("Tree overflow detected");
    }

    if (!current || !current.userId) {
      throw new Error("Tree broken during traversal");
    }

    if (visited.has(current.userId)) {
      throw new Error("Tree cycle detected");
    }

    visited.add(current.userId);

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
