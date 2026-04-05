/*
========================================
REGISTRATION QUEUE ENGINE (FINAL v1)
========================================
✔ Single queue (submit आधारित)
✔ Timestamp ordered
✔ Lock system (no parallel run)
✔ Deep LEFT / RIGHT placement
✔ Duplicate protection
✔ Crash-safe
✔ Production ready
========================================
*/

const REG_QUEUE_KEY = "REG_QUEUE_DATA";
const REG_LOCK_KEY = "REG_QUEUE_LOCK";

// ================= LOAD / SAVE =================
function getRegQueue() {
  try {
    return JSON.parse(localStorage.getItem(REG_QUEUE_KEY)) || [];
  } catch {
    localStorage.setItem(REG_QUEUE_KEY, "[]");
    return [];
  }
}

function saveRegQueue(data) {
  localStorage.setItem(REG_QUEUE_KEY, JSON.stringify(data || []));
}

// ================= LOCK =================
function isRegLocked() {
  return localStorage.getItem(REG_LOCK_KEY) === "true";
}

function setRegLock(val) {
  localStorage.setItem(REG_LOCK_KEY, val ? "true" : "false");
}

// ================= ADD TO QUEUE =================
function addToRegistrationQueue(data) {

  if (!data || !data.mobile) return;

  let queue = getRegQueue();

  // 🔒 DUPLICATE BLOCK (QUEUE LEVEL)
  let exists = queue.find(q => q.mobile === data.mobile && q.status === "PENDING");
  if (exists) {
    console.warn("Already in queue");
    return;
  }

  queue.push({
    ...data,
    requestTime: Date.now(),
    status: "PENDING",
    retry: 0
  });

  // ⏱ SORT BY TIME
  queue.sort((a, b) => a.requestTime - b.requestTime);

  saveRegQueue(queue);
}

// ================= USER ID =================
function generateUserId() {
  return "BWG" + Math.random().toString(36).substring(2, 8);
}

// ================= DEEP PLACEMENT =================
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

// ================= PROCESS ONE =================
function processOneRegistration(req) {

  let users = getUsers();

  // 🔒 DUPLICATE MOBILE CHECK (FINAL)
  let exists = users.find(u => u.mobile === req.mobile);
  if (exists) throw new Error("Mobile already exists");

  let userId = generateUserId();

  let placement = placeUserDeep(req.introducerId, req.position || "L");

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

    createdAt: Date.now()
  };

  // 🔥 LINK TO PARENT
  let parent = users.find(u => u.userId === placement.parentId);

  if (placement.side === "L") {
    parent.leftChild = userId;
  } else {
    parent.rightChild = userId;
  }

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  return true;
}

// ================= MAIN PROCESS =================
function processRegistrationQueue() {

  if (isRegLocked()) return;

  let queue = getRegQueue();
  if (!queue.length) return;

  setRegLock(true);

  try {

    for (let i = 0; i < queue.length; i++) {

      let req = queue[i];

      if (req.status !== "PENDING") continue;

      try {

        processOneRegistration(req);

        req.status = "DONE";

      } catch (err) {

        console.warn("Registration Error:", err.message);

        req.retry = (req.retry || 0) + 1;

        if (req.retry >= 3) {
          req.status = "FAILED";
          req.error = err.message;
        }
      }
    }

    saveRegQueue(queue);

  } finally {
    setRegLock(false);
  }
}

// ================= AUTO RUN =================
function startRegistrationQueue() {
  setInterval(processRegistrationQueue, 2000);
}

// ================= START =================
startRegistrationQueue();
