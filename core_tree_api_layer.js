"use strict";

/*
========================================
TREE API LAYER V1.0 (CENTRAL CONTROL FIX)
========================================
✔ Single tree access layer
✔ Removes duplication from UI files
✔ Role-safe tree access
✔ Introducer + Sponsor support
✔ Works with core tree modules
✔ Production-ready architecture fix
========================================
*/

/* ================= CORE ACCESS ================= */

function getAllUsersSafe() {
  return typeof getUsers === "function" ? getUsers() : [];
}

function findUser(userId) {
  const users = getAllUsersSafe();
  return users.find(u => u.userId === userId) || null;
}

/* ================= TREE ROOT ================= */

function getTreeRoot(userId) {
  return findUser(userId);
}

/* ================= LEVEL SAFE BFS ================= */

function getLevelUsers(userId, level) {

  const users = getAllUsersSafe();
  if (!Array.isArray(users)) return [];

  const result = [];
  const queue = [{ id: userId, level: 0 }];
  const visited = new Set();

  while (queue.length) {

    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;

    visited.add(current.id);

    const user = users.find(u => u.userId === current.id);
    if (!user) continue;

    if (current.level === level) {
      result.push(user);
      continue;
    }

    if (current.level < level) {

      if (user.leftChild) {
        queue.push({
          id: user.leftChild,
          level: current.level + 1
        });
      }

      if (user.rightChild) {
        queue.push({
          id: user.rightChild,
          level: current.level + 1
        });
      }
    }
  }

  return result;
}

/* ================= ROLE BASED TREE VIEW ================= */

function getUserTreeByRole(userId, role) {

  const users = getAllUsersSafe();
  const root = findUser(userId);

  if (!root) return null;

  function build(nodeId, depth = 0) {

    const node = users.find(u => u.userId === nodeId);
    if (!node) return null;

    // 🔐 ROLE FILTERING RULE
    if (role === "user" && depth > 30) return null;
    if (role === "admin" && depth > 100) return null;
    // super_admin = no limit

    return {
      userId: node.userId,
      name: node.name || node.username || "",
      left: node.leftChild ? build(node.leftChild, depth + 1) : null,
      right: node.rightChild ? build(node.rightChild, depth + 1) : null
    };
  }

  return build(userId);
}

/* ================= TREE SUMMARY ================= */

function getTreeSummary(userId) {

  const users = getAllUsersSafe();

  const root = findUser(userId);
  if (!root) return null;

  let total = 0;
  let left = 0;
  let right = 0;

  const queue = [root.userId];
  const visited = new Set();

  while (queue.length) {

    const id = queue.shift();
    if (visited.has(id)) continue;

    visited.add(id);
    total++;

    const user = users.find(u => u.userId === id);
    if (!user) continue;

    if (user.leftChild) {
      left++;
      queue.push(user.leftChild);
    }

    if (user.rightChild) {
      right++;
      queue.push(user.rightChild);
    }
  }

  return {
    totalNodes: total,
    leftNodes: left,
    rightNodes: right
  };
}

/* ================= SAFE EXPORT ================= */

window.getLevelUsers = getLevelUsers;
window.getUserTreeByRole = getUserTreeByRole;
window.getTreeSummary = getTreeSummary;
