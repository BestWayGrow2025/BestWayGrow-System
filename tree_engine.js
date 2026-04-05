/*
========================================
TREE ENGINE (FINAL v1)
========================================
✔ Deep LEFT / RIGHT placement
✔ Linked with registration queue
✔ Parent-child structure maintained
✔ Clean + scalable
========================================
*/

// ================= GET CHILDREN =================
function getChildren(userId) {
  let users = getUsers();

  return users.filter(u =>
    u.sponsorId === userId
  );
}

// ================= GET LEFT CHILD =================
function getLeftChild(userId) {
  let users = getUsers();
  return users.find(u => u.userId === userId)?.leftChild || null;
}

// ================= GET RIGHT CHILD =================
function getRightChild(userId) {
  let users = getUsers();
  return users.find(u => u.userId === userId)?.rightChild || null;
}

// ================= PLACE USER (DEEP) =================
function placeUserDeep(introducerId, position) {

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


🔗 ✅ NOW IMPORTANT CONNECTION (VERY CLEAR)
1. In registration_queue.js
👉 REMOVE this function:
placeUserDeep()

👉 ADD this at top:
<script src="tree_engine.js"></script>
